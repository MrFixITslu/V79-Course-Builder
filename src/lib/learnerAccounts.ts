import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { scoreFinalExam } from './programmeScoring';
import { loadDb } from './courseBuilderDb';
import { canReadCourse, hasMembership } from './academyAccess';

const file = path.join(process.cwd(), 'data', 'learners.json');
const sessions = new Map<string, { id: string; expires: number }>();
function read(): any[] { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : []; }
function write(users: any[]) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file + '.tmp', JSON.stringify(users), { mode: 0o600 }); fs.renameSync(file + '.tmp', file); }
const digest = (password: string, salt: string) => crypto.scryptSync(password, salt, 64).toString('hex');
export function learner(req: express.Request) {
  const token = /(?:^|;\s*)academy_session=([^;]+)/.exec(req.headers.cookie || '')?.[1];
  const session = token && sessions.get(token);
  return session && session.expires > Date.now() ? read().find(u => u.id === session.id) || null : null;
}
function publicUser(u: any) { return { id: u.id, email: u.email, name: u.name, membershipStatus: hasMembership(u) ? 'active' : 'inactive', membershipExpiresAt: u.membershipExpiresAt, enrolledCourseIds: u.enrolledCourseIds || [] }; }
function cookie(req: express.Request, value: string, age: number) { return `academy_session=${value}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${age}${req.secure || process.env.NODE_ENV === 'production' ? '; Secure' : ''}`; }
setInterval(() => { for (const [key, session] of sessions) if (session.expires < Date.now()) sessions.delete(key); }, 60000).unref();
export const learnerRouter = express.Router();
learnerRouter.get('/session', (req, res) => { const u = learner(req); res.json({ user: u ? publicUser(u) : null, billing: { provider: 'stripe', available: false } }); });
for (const action of ['register', 'login']) learnerRouter.post('/' + action, (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || password.length < 12 || password.length > 256) return res.status(400).json({ error: 'Enter a valid email and a password of 12–256 characters.' });
  const users = read();
  let user = users.find(u => u.email === email);
  if (action === 'register') {
    const name = String(req.body.name || '').trim().slice(0, 100);
    if (!name) return res.status(400).json({ error: 'Your name is required.' });
    if (user) return res.status(409).json({ error: 'An account already exists. Sign in instead.' });
    const salt = crypto.randomBytes(16).toString('hex');
    user = { id: crypto.randomUUID(), email, name, salt, hash: digest(password, salt), enrolledCourseIds: [], progress: {}, membershipStatus: 'inactive', createdAt: new Date().toISOString() };
    users.push(user); write(users);
  } else {
    const computed = digest(password, user?.salt || 'invalid-account');
    if (!user || !crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(user.hash, 'hex'))) return res.status(401).json({ error: 'Email or password is incorrect.' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { id: user.id, expires: Date.now() + 12 * 3600000 });
  res.setHeader('Set-Cookie', cookie(req, token, 43200));
  res.json({ user: publicUser(user) });
});
learnerRouter.post('/logout', (req, res) => {
  const token = /(?:^|;\s*)academy_session=([^;]+)/.exec(req.headers.cookie || '')?.[1];
  if (token) sessions.delete(token);
  res.setHeader('Set-Cookie', cookie(req, '', 0)); res.json({ success: true });
});
learnerRouter.use((req, res, next) => { if (!learner(req)) return res.status(401).json({ error: 'Sign in to your learner account.' }); next(); });
learnerRouter.post('/enroll/:courseId', (req, res) => {
  const users = read(); const user = users.find(u => u.id === learner(req).id);
  const course = loadDb().courses.find(c => c.id === req.params.courseId && ['Published', 'Uploaded'].includes(c.status));
  if (!course) return res.status(404).json({ error: 'Course is no longer available.' });
  if (!canReadCourse(course, user)) return res.status(403).json({ error: 'An active academy subscription is required. Online subscriptions are coming soon.', code: 'SUBSCRIPTION_REQUIRED' });
  user.enrolledCourseIds = [...new Set([...(user.enrolledCourseIds || []), course.id])]; write(users); res.json({ user: publicUser(user) });
});
learnerRouter.get('/progress/:courseId', (req, res) => { res.json(learner(req).progress?.[req.params.courseId] || {}); });
learnerRouter.put('/progress/:courseId', (req, res) => {
  const users = read(); const user = users.find(u => u.id === learner(req).id);
  const db = loadDb(); const course = db.courses.find(c => c.id === req.params.courseId && ['Published', 'Uploaded'].includes(c.status));
  if (!course || !canReadCourse(course, user)) return res.status(403).json({ error: 'Course access required.' });
  const ids = new Set(db.lessons.filter(l => l.courseId === course.id).map(l => l.id));
  const completedLessons = Object.fromEntries(Object.entries(req.body.completedLessons || {}).filter(([id, value]) => ids.has(id) && value === true));
  user.progress ||= {}; user.progress[course.id] = { ...user.progress[course.id], completedLessons, assignmentSubmissions: req.body.assignmentSubmissions || {}, programmeState: { ...(req.body.programmeState || user.progress[course.id]?.programmeState || {}), examAttempts: user.progress[course.id]?.programmeState?.examAttempts || [], certificateId: user.progress[course.id]?.programmeState?.certificateId }, updatedAt: new Date().toISOString() };
  write(users); res.json(user.progress[course.id]);
});
learnerRouter.post('/exam/:courseId', (req, res) => {
  const users = read(); const user = users.find(u => u.id === learner(req).id);
  const db = loadDb(); const course = db.courses.find(c => c.id === req.params.courseId && ['Published', 'Uploaded'].includes(c.status));
  if (!course?.programme || !canReadCourse(course, user)) return res.status(403).json({ error: 'Course access required.' });
  const progress = user.progress?.[course.id] || {};
  const lessons = db.lessons.filter(l => l.courseId === course.id);
  const assignments = db.assignments.filter((a: any) => a.courseId === course.id && a.required !== false);
  if (!lessons.length || lessons.some(l => !progress.completedLessons?.[l.id]) || assignments.some(a => !progress.assignmentSubmissions?.[a.id]?.text?.trim())) return res.status(409).json({ error: 'Complete all lessons and required assignments, and allow progress to save, before submitting the exam.' });
  const answers = req.body.answers || {};
  if (course.programme.finalExam.questions.some((q: any) => !q.options.includes(answers[q.id]))) return res.status(400).json({ error: 'Answer every exam question.' });
  const attempt = scoreFinalExam(course.programme, answers);
  progress.programmeState ||= {};
  progress.programmeState.examAttempts = [...(progress.programmeState.examAttempts || []).slice(-99), attempt];
  if (attempt.passed && !progress.programmeState.certificateId) progress.programmeState.certificateId = `V79-${crypto.randomUUID()}`;
  write(users); res.json({ attempt, certificateId: progress.programmeState.certificateId });
});
learnerRouter.post('/certificate/:courseId', (req, res) => {
  const users = read(); const user = users.find(u => u.id === learner(req).id);
  const db = loadDb(); const course = db.courses.find(c => c.id === req.params.courseId && ['Published', 'Uploaded'].includes(c.status));
  if (!course || !canReadCourse(course, user)) return res.status(403).json({ error: 'Course access required.' });
  const progress = user.progress?.[course.id] || {};
  const lessons = db.lessons.filter(l => l.courseId === course.id);
  const assignments = db.assignments.filter((a: any) => a.courseId === course.id && a.required !== false);
  if (!lessons.length || lessons.some(l => !progress.completedLessons?.[l.id]) || assignments.some(a => !progress.assignmentSubmissions?.[a.id]?.text?.trim()) || (course.programme && !(progress.programmeState?.examAttempts || []).some((a: any) => a.passed))) return res.status(409).json({ error: 'Complete the required lessons, assignments and assessment before requesting a certificate.' });
  progress.certificate ||= { id: progress.programmeState?.certificateId || `V79-${crypto.randomUUID()}`, name: user.name, issuedAt: new Date().toISOString(), courseTitle: course.title };
  write(users); res.json(progress.certificate);
});
learnerRouter.post('/checkout', (_req, res) => res.status(503).json({ code: 'BILLING_NOT_CONFIGURED', error: 'Online subscriptions are coming soon. No payment has been taken.' }));
export const learnerAdminRouter = express.Router();
learnerAdminRouter.get('/', (_req, res) => res.json(read().map(publicUser)));
learnerAdminRouter.put('/:id/membership', (req, res) => {
  const users = read(); const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Learner not found.' });
  const active = req.body.status === 'active';
  if (active && !(Date.parse(req.body.expiresAt) > Date.now())) return res.status(400).json({ error: 'Select a future expiry date.' });
  user.membershipStatus = active ? 'active' : 'inactive'; user.membershipExpiresAt = active ? new Date(req.body.expiresAt).toISOString() : null;
  user.membershipSource = 'admin'; user.membershipUpdatedAt = new Date().toISOString(); write(users); res.json(publicUser(user));
});
learnerAdminRouter.post('/:id/reset-password', (req, res) => {
  const password = String(req.body.password || '');
  if (password.length < 12 || password.length > 256) return res.status(400).json({ error: 'Use 12–256 characters.' });
  const users = read(); const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Learner not found.' });
  user.salt = crypto.randomBytes(16).toString('hex'); user.hash = digest(password, user.salt); write(users);
  for (const [key, session] of sessions) if (session.id === user.id) sessions.delete(key);
  res.json({ success: true });
});

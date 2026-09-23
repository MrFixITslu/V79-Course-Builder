import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { learner } from './learnerAccounts';
import { loadDb } from './courseBuilderDb';
import { canReadCourse } from './academyAccess';

const DATA_FILE = path.join(process.cwd(), 'data', 'junior-academy.json');
const LEARNERS_FILE = path.join(process.cwd(), 'data', 'learners.json');

export type JuniorReviewStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Needs Changes' | 'Approved';
export type JuniorTaskStatus = 'To Do' | 'Doing' | 'Done';
export type JuniorRiskLevel = 'Low' | 'Medium' | 'High';

export interface JuniorTeam {
  id: string;
  courseId: string;
  name: string;
  memberIds: string[];
  currentLeaderId: string;
  roles: Record<string, 'Leader' | 'Builder' | 'Checker'>;
  leadershipHistory: Array<{ leaderId: string; startedWeek: number; endedWeek?: number; handedOverAt?: string }>;
  charter: string;
  decisionRule: string;
  conflictAgreement: string;
  project: {
    title: string;
    problem: string;
    audience: string;
    description: string;
    status: 'Idea' | 'Planning' | 'Building' | 'Testing' | 'Final';
  };
  tasks: Array<{ id: string; title: string; ownerId: string; status: JuniorTaskStatus; dueWeek: number }>;
  risks: Array<{
    id: string;
    title: string;
    level: JuniorRiskLevel;
    prevention: string;
    backupPlan: string;
    ownerId: string;
    status: 'Open' | 'Handled';
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface JuniorSubmission {
  id: string;
  teamId: string;
  courseId: string;
  missionNumber: number;
  artifactText: string;
  artifactUrls: string[];
  leaderReport: { planned: string; finished: string; help: string };
  riskUpdate: string;
  individualReflections: Record<string, { helped: string; learned: string; next: string; savedAt: string }>;
  status: JuniorReviewStatus;
  submittedBy: string;
  submittedAt?: string;
  updatedAt: string;
  revision: number;
  reviews: Array<{
    id: string;
    status: Exclude<JuniorReviewStatus, 'Draft' | 'Submitted'>;
    rubric: Record<string, number>;
    strong: string;
    improve: string;
    next: string;
    reviewedAt: string;
    reviewedBy: string;
  }>;
}

export interface JuniorConflictReflection {
  id: string;
  teamId: string;
  courseId: string;
  week: number;
  happened: string;
  feelings: string;
  calmStep: string;
  agreement: string;
  nextTime: string;
  createdBy: string;
  createdAt: string;
}

interface JuniorStore {
  teams: JuniorTeam[];
  submissions: JuniorSubmission[];
  conflictReflections: JuniorConflictReflection[];
}

function emptyStore(): JuniorStore {
  return { teams: [], submissions: [], conflictReflections: [] };
}

function readStore(): JuniorStore {
  if (!fs.existsSync(DATA_FILE)) return emptyStore();
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    return {
      teams: Array.isArray(parsed.teams) ? parsed.teams : [],
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
      conflictReflections: Array.isArray(parsed.conflictReflections) ? parsed.conflictReflections : []
    };
  } catch {
    throw new Error('Junior Academy team data is unreadable. Restore data/junior-academy.json from backup.');
  }
}

function writeStore(store: JuniorStore) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, DATA_FILE);
}

function readLearners(): any[] {
  if (!fs.existsSync(LEARNERS_FILE)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(LEARNERS_FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeLearner(u: any) {
  return u ? { id: u.id, name: u.name, email: u.email, enrolledCourseIds: u.enrolledCourseIds || [] } : null;
}

function cleanText(value: any, max = 4000): string {
  return String(value || '').trim().slice(0, max);
}

function validMission(value: any): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 16 ? n : null;
}

function teamForLearner(store: JuniorStore, courseId: string, learnerId: string) {
  return store.teams.find(t => t.courseId === courseId && t.memberIds.includes(learnerId)) || null;
}

function requireCourseAccess(req: express.Request, res: express.Response) {
  const user = learner(req);
  if (!user) {
    res.status(401).json({ error: 'Sign in to your learner account.' });
    return null;
  }
  const course = loadDb().courses.find((c: any) => c.id === req.params.courseId && ['Published', 'Uploaded'].includes(c.status));
  if (!course || !canReadCourse(course, user)) {
    res.status(403).json({ error: 'Course access required.' });
    return null;
  }
  return { user, course };
}

function decorateTeam(team: JuniorTeam, learners: any[], store: JuniorStore) {
  return {
    ...team,
    members: team.memberIds.map(id => safeLearner(learners.find(l => l.id === id))).filter(Boolean),
    submissions: store.submissions
      .filter(s => s.teamId === team.id)
      .sort((a, b) => a.missionNumber - b.missionNumber)
  };
}

export const juniorLearnerRouter = express.Router();

juniorLearnerRouter.get('/:courseId/team', (req, res) => {
  const access = requireCourseAccess(req, res);
  if (!access) return;
  const store = readStore();
  const team = teamForLearner(store, req.params.courseId, access.user.id);
  if (!team) return res.json({ team: null, message: 'Your instructor has not assigned you to a studio team yet.' });
  res.json({ team: decorateTeam(team, readLearners(), store) });
});

juniorLearnerRouter.put('/:courseId/team', (req, res) => {
  const access = requireCourseAccess(req, res);
  if (!access) return;
  const store = readStore();
  const team = teamForLearner(store, req.params.courseId, access.user.id);
  if (!team) return res.status(404).json({ error: 'Team not found.' });

  if (req.body.charter !== undefined) team.charter = cleanText(req.body.charter, 3000);
  if (req.body.decisionRule !== undefined) team.decisionRule = cleanText(req.body.decisionRule, 800);
  if (req.body.conflictAgreement !== undefined) team.conflictAgreement = cleanText(req.body.conflictAgreement, 1200);
  if (req.body.project) {
    team.project = {
      title: cleanText(req.body.project.title, 160),
      problem: cleanText(req.body.project.problem, 700),
      audience: cleanText(req.body.project.audience, 300),
      description: cleanText(req.body.project.description, 1800),
      status: ['Idea', 'Planning', 'Building', 'Testing', 'Final'].includes(req.body.project.status) ? req.body.project.status : team.project.status
    };
  }
  team.updatedAt = new Date().toISOString();
  writeStore(store);
  res.json({ team: decorateTeam(team, readLearners(), store) });
});

juniorLearnerRouter.put('/:courseId/tasks', (req, res) => {
  const access = requireCourseAccess(req, res);
  if (!access) return;
  const store = readStore();
  const team = teamForLearner(store, req.params.courseId, access.user.id);
  if (!team) return res.status(404).json({ error: 'Team not found.' });
  const tasks = Array.isArray(req.body.tasks) ? req.body.tasks.slice(0, 50) : [];
  team.tasks = tasks.map((task: any) => ({
    id: cleanText(task.id, 80) || crypto.randomUUID(),
    title: cleanText(task.title, 240),
    ownerId: team.memberIds.includes(task.ownerId) ? task.ownerId : access.user.id,
    status: ['To Do', 'Doing', 'Done'].includes(task.status) ? task.status : 'To Do',
    dueWeek: validMission(task.dueWeek) || 1
  })).filter((task: any) => task.title);
  team.updatedAt = new Date().toISOString();
  writeStore(store);
  res.json({ tasks: team.tasks });
});

juniorLearnerRouter.put('/:courseId/risks', (req, res) => {
  const access = requireCourseAccess(req, res);
  if (!access) return;
  const store = readStore();
  const team = teamForLearner(store, req.params.courseId, access.user.id);
  if (!team) return res.status(404).json({ error: 'Team not found.' });
  const risks = Array.isArray(req.body.risks) ? req.body.risks.slice(0, 30) : [];
  team.risks = risks.map((risk: any) => ({
    id: cleanText(risk.id, 80) || crypto.randomUUID(),
    title: cleanText(risk.title, 240),
    level: ['Low', 'Medium', 'High'].includes(risk.level) ? risk.level : 'Low',
    prevention: cleanText(risk.prevention, 800),
    backupPlan: cleanText(risk.backupPlan, 800),
    ownerId: team.memberIds.includes(risk.ownerId) ? risk.ownerId : access.user.id,
    status: risk.status === 'Handled' ? 'Handled' : 'Open'
  })).filter((risk: any) => risk.title);
  team.updatedAt = new Date().toISOString();
  writeStore(store);
  res.json({ risks: team.risks });
});

juniorLearnerRouter.put('/:courseId/reflections/:missionNumber', (req, res) => {
  const access = requireCourseAccess(req, res);
  if (!access) return;
  const missionNumber = validMission(req.params.missionNumber);
  if (!missionNumber) return res.status(400).json({ error: 'Mission must be between 1 and 16.' });

  const store = readStore();
  const team = teamForLearner(store, req.params.courseId, access.user.id);
  if (!team) return res.status(404).json({ error: 'Team not found.' });

  let submission = store.submissions.find(s => s.teamId === team.id && s.missionNumber === missionNumber);
  if (!submission) {
    submission = {
      id: crypto.randomUUID(),
      teamId: team.id,
      courseId: req.params.courseId,
      missionNumber,
      artifactText: '',
      artifactUrls: [],
      leaderReport: { planned: '', finished: '', help: '' },
      riskUpdate: '',
      individualReflections: {},
      status: 'Draft',
      submittedBy: '',
      updatedAt: new Date().toISOString(),
      revision: 0,
      reviews: []
    };
    store.submissions.push(submission);
  }

  submission.individualReflections[access.user.id] = {
    helped: cleanText(req.body.helped, 800),
    learned: cleanText(req.body.learned, 800),
    next: cleanText(req.body.next, 800),
    savedAt: new Date().toISOString()
  };
  submission.updatedAt = new Date().toISOString();
  writeStore(store);
  res.json({ submission });
});

juniorLearnerRouter.post('/:courseId/submissions/:missionNumber', (req, res) => {
  const access = requireCourseAccess(req, res);
  if (!access) return;
  const missionNumber = validMission(req.params.missionNumber);
  if (!missionNumber) return res.status(400).json({ error: 'Mission must be between 1 and 16.' });

  const store = readStore();
  const team = teamForLearner(store, req.params.courseId, access.user.id);
  if (!team) return res.status(404).json({ error: 'Team not found.' });
  if (team.currentLeaderId !== access.user.id) {
    return res.status(403).json({ error: 'The current Team Leader submits the weekly Studio Check-In.' });
  }

  let submission = store.submissions.find(s => s.teamId === team.id && s.missionNumber === missionNumber);
  if (!submission) {
    submission = {
      id: crypto.randomUUID(),
      teamId: team.id,
      courseId: req.params.courseId,
      missionNumber,
      artifactText: '',
      artifactUrls: [],
      leaderReport: { planned: '', finished: '', help: '' },
      riskUpdate: '',
      individualReflections: {},
      status: 'Draft',
      submittedBy: '',
      updatedAt: new Date().toISOString(),
      revision: 0,
      reviews: []
    };
    store.submissions.push(submission);
  }

  if (submission.status === 'Under Review' || submission.status === 'Approved') {
    return res.status(409).json({ error: 'This submission cannot be changed while under review or after approval.' });
  }

  const artifactUrls = Array.isArray(req.body.artifactUrls)
    ? req.body.artifactUrls.slice(0, 10).map((url: any) => cleanText(url, 1000)).filter(Boolean)
    : [];

  submission.artifactText = cleanText(req.body.artifactText, 6000);
  submission.artifactUrls = artifactUrls;
  submission.leaderReport = {
    planned: cleanText(req.body.leaderReport?.planned, 1200),
    finished: cleanText(req.body.leaderReport?.finished, 1200),
    help: cleanText(req.body.leaderReport?.help, 1200)
  };
  submission.riskUpdate = cleanText(req.body.riskUpdate, 1600);
  submission.status = 'Submitted';
  submission.submittedBy = access.user.id;
  submission.submittedAt = new Date().toISOString();
  submission.updatedAt = submission.submittedAt;
  submission.revision += 1;
  writeStore(store);
  res.json({ submission });
});

juniorLearnerRouter.post('/:courseId/conflicts', (req, res) => {
  const access = requireCourseAccess(req, res);
  if (!access) return;
  const week = validMission(req.body.week);
  if (!week) return res.status(400).json({ error: 'Week must be between 1 and 16.' });
  const store = readStore();
  const team = teamForLearner(store, req.params.courseId, access.user.id);
  if (!team) return res.status(404).json({ error: 'Team not found.' });

  const reflection: JuniorConflictReflection = {
    id: crypto.randomUUID(),
    teamId: team.id,
    courseId: req.params.courseId,
    week,
    happened: cleanText(req.body.happened, 1600),
    feelings: cleanText(req.body.feelings, 1000),
    calmStep: cleanText(req.body.calmStep, 500),
    agreement: cleanText(req.body.agreement, 1200),
    nextTime: cleanText(req.body.nextTime, 1200),
    createdBy: access.user.id,
    createdAt: new Date().toISOString()
  };
  store.conflictReflections.push(reflection);
  writeStore(store);
  res.status(201).json({ reflection });
});

export const juniorAdminRouter = express.Router();

juniorAdminRouter.get('/:courseId/teams', (req, res) => {
  const store = readStore();
  const learners = readLearners();
  const teams = store.teams
    .filter(t => t.courseId === req.params.courseId)
    .map(t => decorateTeam(t, learners, store));
  res.json({ teams });
});

juniorAdminRouter.post('/:courseId/teams', (req, res) => {
  const memberIds: string[] = Array.isArray(req.body.memberIds)
    ? Array.from(new Set<string>(req.body.memberIds.map((id: any) => String(id)))).slice(0, 3)
    : [];
  if (!memberIds.length || memberIds.length > 3) return res.status(400).json({ error: 'Select one to three learners.' });
  const learners = readLearners();
  if (memberIds.some(id => !learners.some(l => l.id === id))) return res.status(400).json({ error: 'One or more learner IDs are invalid.' });

  const store = readStore();
  if (store.teams.some(t => t.courseId === req.params.courseId && t.memberIds.some(id => memberIds.includes(id)))) {
    return res.status(409).json({ error: 'One or more learners are already assigned to a team for this course.' });
  }

  const requestedLeaderId = String(req.body.leaderId || '');
  const leaderId = memberIds.includes(requestedLeaderId) ? requestedLeaderId : memberIds[0];
  const roles: JuniorTeam['roles'] = {};
  memberIds.forEach((id, index) => roles[id] = id === leaderId ? 'Leader' : index === 1 ? 'Builder' : 'Checker');

  const now = new Date().toISOString();
  const team: JuniorTeam = {
    id: crypto.randomUUID(),
    courseId: req.params.courseId,
    name: cleanText(req.body.name, 120) || `AI Studio ${store.teams.filter(t => t.courseId === req.params.courseId).length + 1}`,
    memberIds,
    currentLeaderId: leaderId,
    roles,
    leadershipHistory: [{ leaderId, startedWeek: 1 }],
    charter: '',
    decisionRule: 'Listen to every idea, then choose fairly.',
    conflictAgreement: 'Use CALM: Cool down, Ask & listen, Look for fair choices, Make an agreement.',
    project: { title: '', problem: '', audience: '', description: '', status: 'Idea' },
    tasks: [],
    risks: [],
    createdAt: now,
    updatedAt: now
  };
  store.teams.push(team);
  writeStore(store);
  res.status(201).json({ team: decorateTeam(team, learners, store) });
});

juniorAdminRouter.post('/:courseId/auto-form', (req, res) => {
  const learners = readLearners().filter(l => (l.enrolledCourseIds || []).includes(req.params.courseId));
  const store = readStore();
  const assigned = new Set(store.teams.filter(t => t.courseId === req.params.courseId).flatMap(t => t.memberIds));
  const remaining = learners.filter(l => !assigned.has(l.id));
  const created: JuniorTeam[] = [];
  const now = new Date().toISOString();

  for (let i = 0; i < remaining.length; i += 3) {
    const group = remaining.slice(i, i + 3);
    if (!group.length) continue;
    const roles: JuniorTeam['roles'] = {};
    group.forEach((l, idx) => roles[l.id] = idx === 0 ? 'Leader' : idx === 1 ? 'Builder' : 'Checker');
    const team: JuniorTeam = {
      id: crypto.randomUUID(),
      courseId: req.params.courseId,
      name: `AI Studio ${store.teams.filter(t => t.courseId === req.params.courseId).length + created.length + 1}`,
      memberIds: group.map(l => l.id),
      currentLeaderId: group[0].id,
      roles,
      leadershipHistory: [{ leaderId: group[0].id, startedWeek: 1 }],
      charter: '',
      decisionRule: 'Listen to every idea, then choose fairly.',
      conflictAgreement: 'Use CALM: Cool down, Ask & listen, Look for fair choices, Make an agreement.',
      project: { title: '', problem: '', audience: '', description: '', status: 'Idea' },
      tasks: [],
      risks: [],
      createdAt: now,
      updatedAt: now
    };
    created.push(team);
  }
  store.teams.push(...created);
  writeStore(store);
  res.json({ created: created.length, teams: created.map(t => decorateTeam(t, learners, store)) });
});

juniorAdminRouter.put('/teams/:teamId/leader', (req, res) => {
  const store = readStore();
  const team = store.teams.find(t => t.id === req.params.teamId);
  if (!team) return res.status(404).json({ error: 'Team not found.' });
  const nextLeader = String(req.body.leaderId || '');
  const startWeek = validMission(req.body.startWeek);
  if (!team.memberIds.includes(nextLeader)) return res.status(400).json({ error: 'Leader must be a team member.' });
  if (!startWeek) return res.status(400).json({ error: 'Choose the week the new leader starts.' });

  const open = [...team.leadershipHistory].reverse().find(h => h.endedWeek === undefined);
  if (open) {
    open.endedWeek = Math.max(open.startedWeek, startWeek - 1);
    open.handedOverAt = new Date().toISOString();
  }
  team.currentLeaderId = nextLeader;
  team.memberIds.forEach((id, idx) => {
    team.roles[id] = id === nextLeader ? 'Leader' : idx % 2 === 0 ? 'Checker' : 'Builder';
  });
  team.leadershipHistory.push({ leaderId: nextLeader, startedWeek: startWeek });
  team.updatedAt = new Date().toISOString();
  writeStore(store);
  res.json({ team: decorateTeam(team, readLearners(), store) });
});

juniorAdminRouter.put('/submissions/:submissionId/review', (req, res) => {
  const store = readStore();
  const submission = store.submissions.find(s => s.id === req.params.submissionId);
  if (!submission) return res.status(404).json({ error: 'Submission not found.' });

  const status = req.body.status;
  if (!['Under Review', 'Needs Changes', 'Approved'].includes(status)) {
    return res.status(400).json({ error: 'Review status must be Under Review, Needs Changes or Approved.' });
  }

  const rubric: Record<string, number> = {};
  for (const key of ['learning', 'quality', 'teamwork', 'responsibility', 'safety']) {
    const value = Number(req.body.rubric?.[key]);
    if (Number.isFinite(value)) rubric[key] = Math.max(1, Math.min(4, Math.round(value)));
  }

  const review = {
    id: crypto.randomUUID(),
    status,
    rubric,
    strong: cleanText(req.body.strong, 1600),
    improve: cleanText(req.body.improve, 1600),
    next: cleanText(req.body.next, 1600),
    reviewedAt: new Date().toISOString(),
    reviewedBy: cleanText(req.body.reviewedBy, 120) || 'Instructor'
  };
  submission.reviews.push(review);
  submission.status = status;
  submission.updatedAt = review.reviewedAt;
  writeStore(store);
  res.json({ submission });
});

juniorAdminRouter.get('/:courseId/conflicts', (req, res) => {
  const store = readStore();
  res.json({
    conflictReflections: store.conflictReflections
      .filter(c => c.courseId === req.params.courseId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  });
});

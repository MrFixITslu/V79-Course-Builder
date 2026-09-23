import assert from 'node:assert/strict';
import { ensureJuniorAIAcademyCourse, JUNIOR_AI_COURSE_ID } from './juniorAIAcademyCourse';

function freshDb() {
  return {
    courses: [],
    modules: [],
    lessons: [],
    quizzes: [],
    assets: [],
    contentBlocks: [],
    media: [],
    assignments: [],
    downloads: [],
    courseVersions: [],
    importHistories: [],
    publishingLogs: []
  };
}

const db: any = freshDb();
assert.equal(ensureJuniorAIAcademyCourse(db), true, 'first seed should create the course');
assert.equal(ensureJuniorAIAcademyCourse(db), false, 'seed must be idempotent');

const course = db.courses.find((c: any) => c.id === JUNIOR_AI_COURSE_ID);
assert.ok(course, 'Junior AI course should exist');
assert.equal(course.pricingType, 'subscription');
assert.equal(course.status, 'Published');
assert.equal(course.difficultyLevel, 'Beginner');

const modules = db.modules.filter((m: any) => m.courseId === JUNIOR_AI_COURSE_ID);
const lessons = db.lessons.filter((l: any) => l.courseId === JUNIOR_AI_COURSE_ID);
const assignments = db.assignments.filter((a: any) => a.courseId === JUNIOR_AI_COURSE_ID);
const lessonIds = new Set(lessons.map((l: any) => l.id));
const quizzes = db.quizzes.filter((q: any) => lessonIds.has(q.lessonId));

assert.equal(modules.length, 16, 'course must have 16 weekly missions');
assert.equal(lessons.length, 48, 'each mission must have exactly three micro-lessons');
assert.equal(quizzes.length, 16, 'each mission must have a knowledge check');
assert.equal(assignments.length, 16, 'each mission must have a Studio Check-In assignment marker');

for (let mission = 1; mission <= 16; mission++) {
  const module = modules.find((m: any) => m.orderNumber === mission);
  assert.ok(module, `mission ${mission} module missing`);
  const missionLessons = lessons.filter((l: any) => l.moduleId === module.id).sort((a: any,b: any)=>a.orderNumber-b.orderNumber);
  assert.equal(missionLessons.length, 3, `mission ${mission} must have 3 lessons`);
  assert.deepEqual(missionLessons.map((l: any) => l.orderNumber), [1,2,3]);
  const intro = missionLessons[0];
  const n = String(mission).padStart(2, '0');
  assert.equal(intro.videoUrl, `/junior-ai/media/mission-${n}-intro.mp4`);
  assert.deepEqual(intro.imageUrls, [`/junior-ai/images/mission-${n}-cover.svg`]);
  const studio = missionLessons[2];
  assert.match(studio.lessonContent, /Studio Team Mission/);
  assert.match(studio.lessonContent, /CALM/);
  assert.match(studio.lessonContent, /Weekly deliverable/);
  const quiz = quizzes.find((q: any) => q.lessonId === studio.id);
  assert.ok(quiz, `mission ${mission} quiz missing`);
  assert.equal(quiz.questions.length, 3);
  const assignment = assignments.find((a: any) => a.lessonId === studio.id);
  assert.ok(assignment, `mission ${mission} review assignment missing`);
  assert.equal(assignment.required, false, 'team workflow—not legacy individual assignment text—gates Junior completion');
}

const curriculumText = lessons.map((l: any) => `${l.title}\n${l.description}\n${l.lessonContent}`).join('\n').toLowerCase();
assert.ok(!curriculumText.includes('deploy your app'), 'Level 4 app deployment belongs in a separate course');
assert.ok(!curriculumText.includes('build your first web app'), 'Level 4 coding belongs in a separate course');
assert.match(curriculumText, /risk/);
assert.match(curriculumText, /conflict/);
assert.match(curriculumText, /team leader/);

console.log('Junior AI Academy curriculum integrity tests passed.');

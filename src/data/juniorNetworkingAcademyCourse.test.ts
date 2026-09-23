import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { ensureJuniorNetworkingAcademyCourse, JUNIOR_NETWORKING_COURSE_ID } from './juniorNetworkingAcademyCourse';

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
assert.equal(ensureJuniorNetworkingAcademyCourse(db), true);
assert.equal(ensureJuniorNetworkingAcademyCourse(db), false, 'networking seed must be idempotent');

const course = db.courses.find((c: any) => c.id === JUNIOR_NETWORKING_COURSE_ID);
assert.ok(course);
assert.equal(course.status, 'Draft');
assert.equal(course.pricingType, 'subscription');
assert.equal(course.price, 0);
assert.equal(course.difficultyLevel, 'Intermediate');
assert.match(course.title, /Networking Academy/);

const modules = db.modules.filter((m: any) => m.courseId === JUNIOR_NETWORKING_COURSE_ID);
const lessons = db.lessons.filter((l: any) => l.courseId === JUNIOR_NETWORKING_COURSE_ID);
const assignments = db.assignments.filter((a: any) => a.courseId === JUNIOR_NETWORKING_COURSE_ID);
const lessonIds = new Set(lessons.map((l: any) => l.id));
const quizzes = db.quizzes.filter((q: any) => lessonIds.has(q.lessonId));

assert.equal(modules.length, 20, 'course must have 20 missions');
assert.equal(lessons.length, 60, 'each mission must have three lessons');
assert.equal(quizzes.length, 20, 'each mission must have a quiz');
assert.equal(assignments.length, 6, 'course should have six major project milestones');

for (let mission = 1; mission <= 20; mission++) {
  const module = modules.find((m: any) => m.orderNumber === mission);
  assert.ok(module, `mission ${mission} missing`);
  const missionLessons = lessons.filter((l: any) => l.moduleId === module.id).sort((a: any,b: any)=>a.orderNumber-b.orderNumber);
  assert.equal(missionLessons.length, 3);
  assert.deepEqual(missionLessons.map((l: any) => l.orderNumber), [1,2,3]);
  assert.match(missionLessons[0].title, /^Learn:/);
  assert.match(missionLessons[1].title, /^Interactive Lab:/);
  assert.match(missionLessons[2].title, /^Build & Engineer Challenge:/);

  const n = String(mission).padStart(2, '0');
  assert.equal(missionLessons[0].videoUrl, `/junior-networking/media/mission-${n}-intro.mp4`);
  assert.ok(missionLessons[0].imageUrls.includes(`/junior-networking/images/mission-${n}-cover.svg`));
  assert.ok(missionLessons[0].imageUrls.includes(`/junior-networking/images/mission-${n}-diagram.svg`));

  const quiz = quizzes.find((q: any) => q.lessonId === missionLessons[2].id);
  assert.ok(quiz, `mission ${mission} quiz missing`);
  assert.equal(quiz.questions.length, 3);

  for (const suffix of ['cover.svg','diagram.svg']) {
    const asset = path.join(process.cwd(), `public/junior-networking/images/mission-${n}-${suffix}`);
    assert.equal(existsSync(asset), true, `missing networking asset: ${asset}`);
  }
}

for (const mission of [4,9,15,18,19,20]) {
  assert.ok(assignments.some((a: any) => a.moduleId === `jna-mod-${mission}`), `major assignment missing for mission ${mission}`);
}

const curriculum = lessons.map((l: any) => `${l.title}\n${l.lessonContent}`).join('\n').toLowerCase();
for (const required of ['osi', 'structured cabling', 'fiber', 'subnet', 'vlan', 'wi-fi', 'firewall', 'troubleshooting', 'ups']) {
  assert.ok(curriculum.includes(required), `curriculum missing required topic: ${required}`);
}
assert.match(curriculum, /core path/);
assert.match(curriculum, /engineer challenge/);
assert.match(curriculum, /network designer/);
assert.match(curriculum, /network tester \/ security lead/);

console.log('Junior Networking Academy curriculum integrity tests passed.');

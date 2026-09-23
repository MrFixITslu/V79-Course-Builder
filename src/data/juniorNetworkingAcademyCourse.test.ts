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
assert.equal(course.status, 'Published');
assert.equal(course.pricingType, 'subscription');
assert.equal(course.price, 0);
assert.equal(course.difficultyLevel, 'Intermediate');
assert.match(course.title, /Networking Academy/);

// Existing production data from the first release must be migrated exactly once.
const migratedDb: any = freshDb();
migratedDb.courses.push({
  ...course,
  status: 'Draft',
  updatedAt: '2026-09-23T18:45:00.000Z'
});
migratedDb.publishingLogs.push({
  id: 'junior-networking-course-seed-v1',
  courseId: JUNIOR_NETWORKING_COURSE_ID
});
assert.equal(ensureJuniorNetworkingAcademyCourse(migratedDb), true);
assert.equal(migratedDb.courses[0].status, 'Published');
assert.ok(migratedDb.publishingLogs.some((log: any) => log.id === 'junior-networking-course-publication-v2'));
assert.equal(ensureJuniorNetworkingAcademyCourse(migratedDb), false, 'publication migration must run only once');

// If an admin already changed the course status, the migration must preserve it.
const adminChangedDb: any = freshDb();
adminChangedDb.courses.push({
  ...course,
  status: 'Archived'
});
adminChangedDb.publishingLogs.push({
  id: 'junior-networking-course-seed-v1',
  courseId: JUNIOR_NETWORKING_COURSE_ID
});
assert.equal(ensureJuniorNetworkingAcademyCourse(adminChangedDb), true);
assert.equal(adminChangedDb.courses[0].status, 'Archived');
assert.equal(ensureJuniorNetworkingAcademyCourse(adminChangedDb), false);

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

const extraAssets = [
  'public/junior-networking/images/hardware-glossary.svg',
  'public/junior-networking/images/osi-model-poster.svg',
  'public/junior-networking/images/troubleshooting-ladder.svg',
  'public/junior-networking/resources/hardware-inventory.svg',
  'public/junior-networking/resources/rack-layout.svg',
  'public/junior-networking/resources/cable-schedule.svg',
  'public/junior-networking/resources/ip-vlan-plan.svg',
  'public/junior-networking/resources/wireless-security-plan.svg',
  'public/junior-networking/resources/troubleshooting-report.svg',
  'public/junior-networking/resources/final-design-checklist.svg'
];
for (const asset of extraAssets) {
  assert.equal(existsSync(path.join(process.cwd(), asset)), true, `missing networking teaching asset: ${asset}`);
}

assert.ok(lessons.find((l: any) => l.id === 'jna-les-2-1').imageUrls.includes('/junior-networking/images/hardware-glossary.svg'));
assert.ok(lessons.find((l: any) => l.id === 'jna-les-6-1').imageUrls.includes('/junior-networking/images/osi-model-poster.svg'));
assert.ok(lessons.find((l: any) => l.id === 'jna-les-17-1').imageUrls.includes('/junior-networking/images/troubleshooting-ladder.svg'));
assert.ok(lessons.find((l: any) => l.id === 'jna-les-4-3').downloads.some((d: any) => d.url.endsWith('/cable-schedule.svg')));
assert.ok(lessons.find((l: any) => l.id === 'jna-les-20-3').downloads.some((d: any) => d.url.endsWith('/final-design-checklist.svg')));

const curriculum = lessons.map((l: any) => `${l.title}\n${l.lessonContent}`).join('\n').toLowerCase();
for (const required of ['osi', 'structured cabling', 'fiber', 'subnet', 'vlan', 'wi-fi', 'firewall', 'troubleshooting', 'ups']) {
  assert.ok(curriculum.includes(required), `curriculum missing required topic: ${required}`);
}
assert.match(curriculum, /core path/);
assert.match(curriculum, /engineer challenge/);
assert.match(curriculum, /network designer/);
assert.match(curriculum, /network tester \/ security lead/);

console.log('Junior Networking Academy curriculum integrity tests passed.');

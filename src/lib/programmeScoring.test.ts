import { strict as assert } from 'node:assert';
import {
  ensureIdeaToAdvantageCourse,
  IDEA_TO_ADVANTAGE_COURSE_ID,
  IDEA_TO_ADVANTAGE_PROGRAMME
} from '../data/ideaToAdvantageCourse';
import {
  buildProgrammeStatus,
  calculateAssessmentConfidence,
  calculateDiagnostic,
  categoryLabel,
  createInitialProgrammeState,
  normalizeProgrammeState,
  scoreFinalExam
} from './programmeScoring';

const programme = IDEA_TO_ADVANTAGE_PROGRAMME;
const state = createInitialProgrammeState(programme.version);
state.profile.businessName = 'Test Business';
state.profile.industry = 'Retail';
state.profile.offering = 'services';

assert.equal(programme.diagnostic.categories.reduce((sum, category) => sum + category.weight, 0), 100, 'Diagnostic weights must total 100');
assert.equal(programme.diagnostic.questions.length, 40, 'Diagnostic must contain 40 questions');
assert.equal(programme.workbookSections.length, 12, 'Workbook must contain one section per module');
assert.equal(programme.finalExam.questions.length, 24, 'Final exam must contain 24 scenario questions');

const perfectAnswers = Object.fromEntries(programme.diagnostic.questions.map((question) => [question.id, 4]));
const perfect = calculateDiagnostic(programme, state.profile, perfectAnswers);
assert.equal(perfect.complete, true);
assert.equal(perfect.score, 100);
assert.equal(perfect.band, 'Optimised');

const zeroAnswers = Object.fromEntries(programme.diagnostic.questions.map((question) => [question.id, 0]));
const zero = calculateDiagnostic(programme, state.profile, zeroAnswers);
assert.equal(zero.complete, true, 'Zero is a valid answered score');
assert.equal(zero.score, 0);
assert.equal(zero.band, 'Foundation Stage');

const partial = calculateDiagnostic(programme, state.profile, { 'fin-1': 4 });
assert.equal(partial.complete, false);
assert.equal(partial.answered, 1);
assert.equal(partial.total, 40);

const inventoryCategory = programme.diagnostic.categories.find((category) => category.id === 'inventory')!;
assert.equal(categoryLabel(inventoryCategory, state.profile), 'Purchasing & Resource Management');
assert.equal(calculateAssessmentConfidence(true, 0, 12), 55);
assert.equal(calculateAssessmentConfidence(true, 12, 12), 100);

const correctExamAnswers = Object.fromEntries(programme.finalExam.questions.map((question) => [question.id, question.correctAnswer]));
const passingAttempt = scoreFinalExam(programme, correctExamAnswers, '2026-09-23T15:00:00.000Z');
assert.equal(passingAttempt.score, 100);
assert.equal(passingAttempt.passed, true);

const failingExamAnswers = { ...correctExamAnswers };
programme.finalExam.questions.slice(0, 8).forEach((question) => {
  failingExamAnswers[question.id] = question.options.find((option) => option !== question.correctAnswer)!;
});
const failingAttempt = scoreFinalExam(programme, failingExamAnswers, '2026-09-23T15:30:00.000Z');
assert.equal(failingAttempt.score, 67);
assert.equal(failingAttempt.passed, false);
assert.ok(failingAttempt.missedCategoryIds.length > 0);

const locked = buildProgrammeStatus(programme, 100, 11, 12, [passingAttempt]);
assert.equal(locked.readyForCertificate, false, 'All assignments are required');
const eligible = buildProgrammeStatus(programme, 100, 12, 12, [passingAttempt], 'V79-ITA-2026-TEST');
assert.equal(eligible.readyForCertificate, true);
assert.equal(eligible.certificateId, 'V79-ITA-2026-TEST');

const normalized = normalizeProgrammeState({ profile: { businessName: 'Saved' } as any }, programme.version);
assert.equal(normalized.profile.businessName, 'Saved');
assert.equal(normalized.profile.country, 'Saint Lucia');
assert.deepEqual(normalized.examAttempts, []);

const seedDb = {
  courses: [], modules: [], lessons: [], quizzes: [], assignments: [], publishingLogs: []
};
assert.equal(ensureIdeaToAdvantageCourse(seedDb), true, 'First seed should add the programme');
assert.equal(ensureIdeaToAdvantageCourse(seedDb), false, 'Second seed must be idempotent');
assert.equal(seedDb.courses.filter((course: any) => course.id === IDEA_TO_ADVANTAGE_COURSE_ID).length, 1);
assert.equal(seedDb.modules.length, 12);
assert.equal(seedDb.lessons.length, 36);
assert.equal(seedDb.quizzes.length, 12);
assert.equal(seedDb.assignments.length, 12);

console.log('✓ Business Advantage programme scoring tests passed');

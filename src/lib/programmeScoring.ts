import {
  BusinessAdvantageState,
  BusinessProfile,
  CourseProgramme,
  DiagnosticAnswers,
  DiagnosticCategory,
  DiagnosticQuestion,
  DiagnosticResult,
  FinalExamAttempt,
  ProgrammeStatus
} from '../types/programme';

export const EMPTY_BUSINESS_PROFILE: BusinessProfile = {
  businessName: '',
  country: 'Saint Lucia',
  industry: '',
  stage: 'pre_launch',
  offering: 'services',
  customerType: 'consumers',
  yearsOperating: '',
  employeeRange: 'solo',
  monthlySalesRange: '',
  importsInputs: false,
  sellsOnline: false,
  usesAccountingSystem: false,
  usesCrm: false,
  usesAi: false
};

export function createInitialProgrammeState(version: number): BusinessAdvantageState {
  return {
    version,
    profile: { ...EMPTY_BUSINESS_PROFILE },
    startingAssessment: { answers: {} },
    finalAssessment: { answers: {} },
    workbook: {},
    examAnswers: {},
    examAttempts: []
  };
}

export function normalizeProgrammeState(
  saved: Partial<BusinessAdvantageState> | null | undefined,
  version: number
): BusinessAdvantageState {
  const blank = createInitialProgrammeState(version);
  if (!saved || typeof saved !== 'object') return blank;

  return {
    ...blank,
    ...saved,
    version,
    profile: { ...blank.profile, ...(saved.profile || {}) },
    startingAssessment: {
      answers: { ...(saved.startingAssessment?.answers || {}) },
      completedAt: saved.startingAssessment?.completedAt
    },
    finalAssessment: {
      answers: { ...(saved.finalAssessment?.answers || {}) },
      completedAt: saved.finalAssessment?.completedAt
    },
    workbook: { ...(saved.workbook || {}) },
    examAnswers: { ...(saved.examAnswers || {}) },
    examAttempts: Array.isArray(saved.examAttempts) ? saved.examAttempts : []
  };
}

export function isBusinessProfileComplete(profile: BusinessProfile): boolean {
  return Boolean(
    profile.businessName.trim() &&
    profile.country.trim() &&
    profile.industry.trim() &&
    profile.stage &&
    profile.offering &&
    profile.customerType &&
    profile.employeeRange
  );
}

export function categoryLabel(category: DiagnosticCategory, profile: BusinessProfile): string {
  if (profile.offering === 'services' && category.serviceLabel) return category.serviceLabel;
  return category.label;
}

export function diagnosticPrompt(question: DiagnosticQuestion, profile: BusinessProfile): string {
  const serviceBusiness = profile.offering === 'services';
  if (profile.stage === 'pre_launch') {
    return serviceBusiness && question.prompts.preLaunchService
      ? question.prompts.preLaunchService
      : question.prompts.preLaunch;
  }
  return serviceBusiness && question.prompts.operatingService
    ? question.prompts.operatingService
    : question.prompts.operating;
}

function scoreBand(score: number): DiagnosticResult['band'] {
  if (score >= 90) return 'Optimised';
  if (score >= 75) return 'Advancing';
  if (score >= 60) return 'Established';
  if (score >= 40) return 'Developing';
  return 'Foundation Stage';
}

export function calculateDiagnostic(
  programme: CourseProgramme,
  profile: BusinessProfile,
  answers: DiagnosticAnswers
): DiagnosticResult {
  const categories = programme.diagnostic.categories.map((category) => {
    const questions = programme.diagnostic.questions.filter((question) => question.categoryId === category.id);
    const validScores = questions
      .map((question) => answers[question.id])
      .filter((answer) => Number.isInteger(answer) && answer >= 0 && answer <= 4);

    const percent = questions.length > 0 && validScores.length > 0
      ? Math.round((validScores.reduce((sum, value) => sum + value, 0) / (validScores.length * 4)) * 100)
      : 0;

    return {
      categoryId: category.id,
      label: categoryLabel(category, profile),
      percent,
      weightedPoints: Math.round(((percent / 100) * category.weight) * 100) / 100,
      weight: category.weight,
      answered: validScores.length,
      total: questions.length
    };
  });

  const total = categories.reduce((sum, category) => sum + category.total, 0);
  const answered = categories.reduce((sum, category) => sum + category.answered, 0);
  const score = Math.round(categories.reduce((sum, category) => sum + category.weightedPoints, 0));
  const strongest = [...categories].sort((a, b) => b.percent - a.percent || b.weight - a.weight)[0];
  const priorities = [...categories]
    .sort((a, b) => a.percent - b.percent || b.weight - a.weight)
    .slice(0, 3)
    .map((category) => category.categoryId);

  return {
    score,
    band: scoreBand(score),
    categories,
    strongestCategoryId: strongest?.categoryId || '',
    priorityCategoryIds: priorities,
    complete: total > 0 && answered === total,
    answered,
    total
  };
}

export function calculateAssessmentConfidence(
  diagnosticComplete: boolean,
  completedWorkbookSections: number,
  totalWorkbookSections: number
): number {
  if (!diagnosticComplete) return 0;
  const evidenceRate = totalWorkbookSections > 0
    ? Math.min(1, Math.max(0, completedWorkbookSections / totalWorkbookSections))
    : 0;
  return Math.round(55 + (45 * evidenceRate));
}

export function scoreFinalExam(
  programme: CourseProgramme,
  answers: Record<string, string>,
  submittedAt = new Date().toISOString()
): FinalExamAttempt {
  const questions = programme.finalExam.questions;
  let correct = 0;
  const missedCategoryIds = new Set<string>();

  questions.forEach((question) => {
    if (answers[question.id] === question.correctAnswer) {
      correct += 1;
    } else {
      missedCategoryIds.add(question.categoryId);
    }
  });

  const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  return {
    id: `attempt-${submittedAt}-${questions.length}`,
    submittedAt,
    score,
    correct,
    total: questions.length,
    passed: score >= programme.certificate.finalExamMinimumScore,
    missedCategoryIds: [...missedCategoryIds]
  };
}

export function buildProgrammeStatus(
  programme: CourseProgramme,
  lessonCompletionPercent: number,
  assignmentsCompleted: number,
  assignmentsRequired: number,
  attempts: FinalExamAttempt[],
  certificateId?: string
): ProgrammeStatus {
  const bestAttempt = [...attempts].sort((a, b) => b.score - a.score)[0];
  const passingAttempts = attempts.filter((attempt) => attempt.passed);
  const firstPassingAttempt = [...passingAttempts].sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  )[0];
  const finalExamPassed = Boolean(bestAttempt && bestAttempt.score >= programme.certificate.finalExamMinimumScore);
  const lessonsComplete = lessonCompletionPercent >= programme.certificate.requiredLessonCompletionPercent;
  const assignmentsComplete = !programme.certificate.requireAllAssignments ||
    (assignmentsRequired > 0 && assignmentsCompleted >= assignmentsRequired);

  return {
    readyForCertificate: lessonsComplete && assignmentsComplete && finalExamPassed,
    lessonCompletionPercent,
    assignmentsCompleted,
    assignmentsRequired,
    bestExamScore: bestAttempt?.score || 0,
    finalExamPassed,
    finalExamPassedAt: firstPassingAttempt?.submittedAt,
    certificateId
  };
}

export function createCertificateId(now = new Date()): string {
  let token = '';
  try {
    token = globalThis.crypto?.randomUUID?.().replace(/-/g, '').slice(0, 10).toUpperCase() || '';
  } catch {
    token = '';
  }
  if (!token) token = Math.random().toString(36).slice(2, 12).toUpperCase();
  return `V79-ITA-${now.getUTCFullYear()}-${token}`;
}

export function completedWorkbookCount(state: BusinessAdvantageState): number {
  return Object.values(state.workbook).filter((section) => Boolean(section?.completedAt)).length;
}

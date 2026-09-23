export type BusinessStage = 'pre_launch' | 'operating';

export type BusinessOffering = 'goods' | 'services' | 'both';

export interface BusinessProfile {
  businessName: string;
  country: string;
  industry: string;
  stage: BusinessStage;
  offering: BusinessOffering;
  customerType: 'consumers' | 'businesses' | 'government' | 'tourism' | 'export' | 'mixed';
  yearsOperating: string;
  employeeRange: 'solo' | '2-5' | '6-10' | '11-25' | '26+';
  monthlySalesRange: string;
  importsInputs: boolean;
  sellsOnline: boolean;
  usesAccountingSystem: boolean;
  usesCrm: boolean;
  usesAi: boolean;
}

export interface DiagnosticCategory {
  id: string;
  label: string;
  serviceLabel?: string;
  description: string;
  weight: number;
  moduleNumbers: number[];
}

export interface DiagnosticPromptSet {
  preLaunch: string;
  operating: string;
  preLaunchService?: string;
  operatingService?: string;
}

export interface DiagnosticQuestion {
  id: string;
  categoryId: string;
  prompts: DiagnosticPromptSet;
}

export interface DiagnosticScaleOption {
  value: 0 | 1 | 2 | 3 | 4;
  preLaunchLabel: string;
  operatingLabel: string;
  description: string;
}

export interface DiagnosticDefinition {
  title: string;
  intro: string;
  categories: DiagnosticCategory[];
  questions: DiagnosticQuestion[];
  scale: DiagnosticScaleOption[];
}

export interface WorkbookPrompt {
  id: string;
  label: string;
  helpText: string;
  placeholder: string;
}

export interface WorkbookSection {
  id: string;
  moduleNumber: number;
  title: string;
  outcome: string;
  categoryIds: string[];
  prompts: WorkbookPrompt[];
}

export interface FinalExamQuestion {
  id: string;
  moduleNumber: number;
  categoryId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  reviewGuidance: string;
}

export interface ProgrammeCertificateRules {
  title: string;
  requiredLessonCompletionPercent: number;
  requireAllAssignments: boolean;
  finalExamMinimumScore: number;
}

export interface CourseProgramme {
  kind: 'business_advantage';
  version: number;
  name: string;
  framework: string;
  promise: string;
  diagnostic: DiagnosticDefinition;
  workbookSections: WorkbookSection[];
  finalExam: {
    title: string;
    intro: string;
    questions: FinalExamQuestion[];
  };
  certificate: ProgrammeCertificateRules;
}

export type DiagnosticAnswers = Record<string, number>;

export interface DiagnosticAssessment {
  answers: DiagnosticAnswers;
  completedAt?: string;
}

export interface WorkbookSectionState {
  responses: Record<string, string>;
  completedAt?: string;
}

export interface FinalExamAttempt {
  id: string;
  submittedAt: string;
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  missedCategoryIds: string[];
}

export interface BusinessAdvantageState {
  version: number;
  profile: BusinessProfile;
  startingAssessment: DiagnosticAssessment;
  finalAssessment: DiagnosticAssessment;
  workbook: Record<string, WorkbookSectionState>;
  examAnswers: Record<string, string>;
  examAttempts: FinalExamAttempt[];
  certificateId?: string;
}

export interface DiagnosticCategoryScore {
  categoryId: string;
  label: string;
  percent: number;
  weightedPoints: number;
  weight: number;
  answered: number;
  total: number;
}

export interface DiagnosticResult {
  score: number;
  band: 'Foundation Stage' | 'Developing' | 'Established' | 'Advancing' | 'Optimised';
  categories: DiagnosticCategoryScore[];
  strongestCategoryId: string;
  priorityCategoryIds: string[];
  complete: boolean;
  answered: number;
  total: number;
}

export interface ProgrammeStatus {
  readyForCertificate: boolean;
  lessonCompletionPercent: number;
  assignmentsCompleted: number;
  assignmentsRequired: number;
  bestExamScore: number;
  finalExamPassed: boolean;
  finalExamPassedAt?: string;
  certificateId?: string;
}

import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileText,
  Lightbulb,
  Lock,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRoundCog
} from 'lucide-react';
import { Assignment } from '../types/course-builder-v2';
import { Lesson, Module } from '../types';
import {
  BusinessAdvantageState,
  BusinessProfile,
  CourseProgramme,
  DiagnosticAssessment,
  DiagnosticResult,
  ProgrammeStatus,
  WorkbookSection
} from '../types/programme';
import {
  buildProgrammeStatus,
  calculateAssessmentConfidence,
  calculateDiagnostic,
  categoryLabel,
  completedWorkbookCount,
  createCertificateId,
  diagnosticPrompt,
  isBusinessProfileComplete,
  normalizeProgrammeState,
  scoreFinalExam
} from '../lib/programmeScoring';

interface BusinessAdvantageProgrammeProps {
  courseId: string;
  programme: CourseProgramme;
  modules: Module[];
  lessonsMap: Record<string, Lesson[]>;
  completedLessons: Record<string, boolean>;
  assignments: Assignment[];
  assignmentSubmissions: Record<string, { text: string; fileSubmitted: boolean; submittedAt: string }>;
  onOpenModule: (moduleNumber: number, target?: 'first' | 'last') => void;
  onStatusChange: (status: ProgrammeStatus) => void;
}

type ProgrammeTab = 'overview' | 'diagnostic' | 'workbook' | 'exam';
type DiagnosticMode = 'starting' | 'final';

const profileTextInput = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

function formatDate(value?: string): string {
  if (!value) return 'Not completed';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function profileLabel(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function storageState(courseId: string, version: number): BusinessAdvantageState {
  try {
    const raw = localStorage.getItem(`v79_programme_state_${courseId}`);
    return normalizeProgrammeState(raw ? JSON.parse(raw) : null, version);
  } catch {
    return normalizeProgrammeState(null, version);
  }
}

function ScoreBar({ value, colour = 'bg-indigo-600' }: { value: number; colour?: string }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100" aria-label={`${value}%`}>
      <div className={`h-full rounded-full transition-all duration-500 ${colour}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function ScoreSummary({
  result,
  finalResult,
  confidence,
  programme,
  profile
}: {
  result: DiagnosticResult;
  finalResult?: DiagnosticResult;
  confidence: number;
  programme: CourseProgramme;
  profile: BusinessProfile;
}) {
  const strongest = result.categories.find((item) => item.categoryId === result.strongestCategoryId);
  const priorities = result.priorityCategoryIds
    .map((id) => result.categories.find((item) => item.categoryId === id))
    .filter(Boolean);
  const improvement = finalResult?.complete ? finalResult.score - result.score : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-700 to-slate-900 p-6 text-white shadow-lg md:col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200">Business Advantage Score</p>
          <div className="mt-3 flex flex-wrap items-end gap-4">
            <span className="text-6xl font-black tracking-tight">{finalResult?.complete ? finalResult.score : result.score}</span>
            <div className="pb-1">
              <p className="text-lg font-bold">{finalResult?.complete ? finalResult.band : result.band}</p>
              <p className="text-xs text-indigo-200">
                {finalResult?.complete ? `Final score · ${improvement! >= 0 ? '+' : ''}${improvement} from baseline` : `${profile.stage === 'pre_launch' ? 'Business readiness' : 'Management maturity'} baseline`}
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-xl text-xs leading-5 text-indigo-100">
            This diagnostic directs attention; it is not an audit or prediction. Use the category evidence and workbook to decide what to improve next.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Assessment confidence</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{confidence}%</p>
          <ScoreBar value={confidence} colour="bg-emerald-500" />
          <p className="mt-3 text-[11px] leading-4 text-slate-500">
            Self-assessment starts at 55%. Completing workbook evidence raises confidence toward 100%.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-800">Category results</p>
          <div className="mt-4 space-y-4">
            {result.categories.map((category) => {
              const finalCategory = finalResult?.categories.find((item) => item.categoryId === category.categoryId);
              return (
                <div key={category.categoryId}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px]">
                    <span className="font-semibold text-slate-700">{category.label}</span>
                    <span className="shrink-0 font-bold text-slate-900">
                      {finalCategory ? `${category.percent}% → ${finalCategory.percent}%` : `${category.percent}%`}
                    </span>
                  </div>
                  <ScoreBar value={finalCategory?.percent ?? category.percent} colour={finalCategory ? 'bg-emerald-500' : 'bg-indigo-500'} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
            <div className="flex items-start gap-3">
              <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">Strongest area</p>
                <p className="mt-1 text-sm font-bold text-emerald-950">{strongest?.label || 'Complete the assessment'}</p>
                <p className="mt-1 text-[11px] leading-4 text-emerald-800">Use this strength to support weaker systems rather than treating it as finished.</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
            <div className="flex items-start gap-3">
              <Target className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-900">Priority areas</p>
                <ol className="mt-2 space-y-1.5 text-xs text-amber-950">
                  {priorities.map((item, index) => <li key={item!.categoryId}>{index + 1}. <strong>{item!.label}</strong> · {item!.percent}%</li>)}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-slate-400">
        Weights: {programme.diagnostic.categories.map((category) => `${categoryLabel(category, profile)} ${category.weight}%`).join(' · ')}
      </p>
    </div>
  );
}

export function BusinessAdvantageProgramme({
  courseId,
  programme,
  modules,
  lessonsMap,
  completedLessons,
  assignments,
  assignmentSubmissions,
  onOpenModule,
  onStatusChange
}: BusinessAdvantageProgrammeProps) {
  const [state, setState] = useState<BusinessAdvantageState>(() => storageState(courseId, programme.version));
  const [activeTab, setActiveTab] = useState<ProgrammeTab>(() => state.startingAssessment.completedAt ? 'overview' : 'diagnostic');
  const [diagnosticMode, setDiagnosticMode] = useState<DiagnosticMode>(() => state.startingAssessment.completedAt ? 'final' : 'starting');
  const [diagnosticCategoryIndex, setDiagnosticCategoryIndex] = useState(0);
  const [openWorkbookSection, setOpenWorkbookSection] = useState<string>(programme.workbookSections[0]?.id || '');
  const [profileSaved, setProfileSaved] = useState(Boolean(state.startingAssessment.completedAt));
  const [notice, setNotice] = useState<string | null>(null);

  const storageKey = `v79_programme_state_${courseId}`;
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  const startingResult = useMemo(
    () => calculateDiagnostic(programme, state.profile, state.startingAssessment.answers),
    [programme, state.profile, state.startingAssessment.answers]
  );
  const finalResult = useMemo(
    () => calculateDiagnostic(programme, state.profile, state.finalAssessment.answers),
    [programme, state.profile, state.finalAssessment.answers]
  );

  const totalLessons = Object.values(lessonsMap).reduce((sum, list) => sum + list.length, 0);
  const lessonsCompleted = Object.keys(completedLessons).filter((id) => completedLessons[id] && Object.values(lessonsMap).some((list) => list.some((lesson) => lesson.id === id))).length;
  const lessonCompletionPercent = totalLessons ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;
  const programmeAssignments = assignments.filter((assignment) => assignment.courseId === courseId && (assignment as Assignment & { required?: boolean }).required !== false);
  const assignmentsCompleted = programmeAssignments.filter((assignment) => Boolean(assignmentSubmissions[assignment.id])).length;
  const workbookCompleted = completedWorkbookCount(state);
  const confidence = calculateAssessmentConfidence(startingResult.complete, workbookCompleted, programme.workbookSections.length);

  const status = useMemo(
    () => buildProgrammeStatus(
      programme,
      lessonCompletionPercent,
      assignmentsCompleted,
      programmeAssignments.length,
      state.examAttempts,
      state.certificateId
    ),
    [programme, lessonCompletionPercent, assignmentsCompleted, programmeAssignments.length, state.examAttempts, state.certificateId]
  );

  useEffect(() => {
    if (status.readyForCertificate && !state.certificateId) {
      setState((current) => ({ ...current, certificateId: createCertificateId() }));
      return;
    }
    onStatusChange(status);
  }, [status, state.certificateId, onStatusChange]);

  const updateProfile = <K extends keyof BusinessProfile>(key: K, value: BusinessProfile[K]) => {
    setState((current) => ({ ...current, profile: { ...current.profile, [key]: value } }));
  };

  const currentAssessment: DiagnosticAssessment = diagnosticMode === 'starting'
    ? state.startingAssessment
    : state.finalAssessment;
  const activeCategory = programme.diagnostic.categories[diagnosticCategoryIndex];
  const activeQuestions = programme.diagnostic.questions.filter((question) => question.categoryId === activeCategory?.id);
  const currentResult = diagnosticMode === 'starting' ? startingResult : finalResult;
  const currentCategoryAnswered = activeQuestions.every((question) => Number.isInteger(currentAssessment.answers[question.id]));

  const setDiagnosticAnswer = (questionId: string, value: number) => {
    const key = diagnosticMode === 'starting' ? 'startingAssessment' : 'finalAssessment';
    setState((current) => ({
      ...current,
      [key]: {
        ...current[key],
        answers: { ...current[key].answers, [questionId]: value }
      }
    }));
  };

  const finishDiagnostic = () => {
    if (!currentResult.complete) {
      setNotice(`Answer all ${currentResult.total} statements before calculating the score.`);
      return;
    }
    const key = diagnosticMode === 'starting' ? 'startingAssessment' : 'finalAssessment';
    setState((current) => ({
      ...current,
      [key]: { ...current[key], completedAt: new Date().toISOString() }
    }));
    setNotice(diagnosticMode === 'starting' ? 'Starting score saved. Your priority modules are ready.' : 'Final score saved. Your improvement comparison is ready.');
    setActiveTab('overview');
  };

  const updateWorkbookResponse = (section: WorkbookSection, promptId: string, value: string) => {
    setState((current) => ({
      ...current,
      workbook: {
        ...current.workbook,
        [section.id]: {
          responses: {
            ...(current.workbook[section.id]?.responses || {}),
            [promptId]: value
          },
          completedAt: undefined
        }
      }
    }));
  };

  const toggleWorkbookComplete = (section: WorkbookSection) => {
    const saved = state.workbook[section.id] || { responses: {} };
    const allDone = section.prompts.every((prompt) => (saved.responses[prompt.id] || '').trim().length >= 10);
    if (!saved.completedAt && !allDone) {
      setNotice('Complete every workbook response with enough detail before marking this section complete.');
      return;
    }
    setState((current) => ({
      ...current,
      workbook: {
        ...current.workbook,
        [section.id]: {
          ...saved,
          completedAt: saved.completedAt ? undefined : new Date().toISOString()
        }
      }
    }));
  };

  const downloadWorkbook = () => {
    const start = startingResult.complete ? startingResult : null;
    const final = finalResult.complete ? finalResult : null;
    const lines = [
      '# My Business Advantage Plan',
      '',
      `Business: ${state.profile.businessName || 'Not supplied'}`,
      `Country: ${state.profile.country || 'Not supplied'}`,
      `Industry: ${state.profile.industry || 'Not supplied'}`,
      `Stage: ${profileLabel(state.profile.stage)}`,
      `Offering: ${profileLabel(state.profile.offering)}`,
      `Exported: ${new Date().toLocaleString()}`,
      '',
      '## Business Advantage Score',
      start ? `Starting score: ${start.score}/100 — ${start.band}` : 'Starting score: not completed',
      final ? `Final score: ${final.score}/100 — ${final.band} (${final.score - (start?.score || 0) >= 0 ? '+' : ''}${final.score - (start?.score || 0)})` : 'Final score: not completed',
      `Assessment confidence: ${confidence}%`,
      ''
    ];

    programme.workbookSections.forEach((section) => {
      lines.push(`## ${section.moduleNumber}. ${section.title}`, '', section.outcome, '');
      section.prompts.forEach((prompt) => {
        lines.push(`### ${prompt.label}`, state.workbook[section.id]?.responses[prompt.id]?.trim() || '_Not completed_', '');
      });
    });

    lines.push('---', '', 'Created through V79 Academy — From Idea to Advantage.', 'This working plan is not legal, tax, accounting, investment or regulatory advice.');
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${(state.profile.businessName || 'business').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-advantage-plan.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setNotice('Your Business Advantage Plan was downloaded as an editable Markdown document.');
  };

  const submitFinalExam = () => {
    if (programme.finalExam.questions.some((question) => !state.examAnswers[question.id])) {
      setNotice(`Answer all ${programme.finalExam.questions.length} questions before submitting.`);
      return;
    }
    const attempt = scoreFinalExam(programme, state.examAnswers);
    setState((current) => ({
      ...current,
      examAttempts: [...current.examAttempts, attempt],
      examAnswers: {}
    }));
    setNotice(attempt.passed
      ? `Final exam passed with ${attempt.score}%. Your certificate checklist has been updated.`
      : `You scored ${attempt.score}%. Review the highlighted modules and retake when ready.`);
  };

  const bestAttempt = [...state.examAttempts].sort((a, b) => b.score - a.score)[0];
  const latestAttempt = state.examAttempts[state.examAttempts.length - 1];
  const examUnlocked = lessonCompletionPercent >= programme.certificate.requiredLessonCompletionPercent &&
    (!programme.certificate.requireAllAssignments || assignmentsCompleted >= programmeAssignments.length);

  const tabs: { id: ProgrammeTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'My Advantage', icon: BarChart3 },
    { id: 'diagnostic', label: 'Diagnostic', icon: ClipboardCheck },
    { id: 'workbook', label: 'Workbook', icon: FileText },
    { id: 'exam', label: 'Final Exam', icon: Award }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-5 md:p-8">
      <div className="overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-6 text-white shadow-xl md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300">
              <Sparkles className="h-4 w-4" />
              Business improvement programme
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">{programme.name}</h1>
            <p className="mt-2 text-sm leading-6 text-indigo-100">{programme.promise}</p>
            <p className="mt-4 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold text-white">
              {programme.framework}
            </p>
          </div>
          <div className="grid min-w-64 grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-white/10 p-3"><p className="text-xl font-black">{startingResult.complete ? startingResult.score : '—'}</p><p className="text-[9px] uppercase text-indigo-200">Start score</p></div>
            <div className="rounded-xl bg-white/10 p-3"><p className="text-xl font-black">{workbookCompleted}/12</p><p className="text-[9px] uppercase text-indigo-200">Workbook</p></div>
            <div className="rounded-xl bg-white/10 p-3"><p className="text-xl font-black">{bestAttempt?.score ?? '—'}{bestAttempt ? '%' : ''}</p><p className="text-[9px] uppercase text-indigo-200">Best exam</p></div>
          </div>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm" aria-label="Programme sections">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </nav>

      {notice && (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-xs text-indigo-900" role="status">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="font-bold underline">Dismiss</button>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {!startingResult.complete ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
              <ClipboardCheck className="mx-auto h-12 w-12 text-amber-600" />
              <h2 className="mt-4 text-xl font-black text-slate-900">Start with your honest baseline</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">Complete the business profile and 40-question diagnostic. It adapts to pre-launch versus operating businesses and goods versus services.</p>
              <button onClick={() => setActiveTab('diagnostic')} className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow hover:bg-indigo-700">Start Diagnostic</button>
            </div>
          ) : (
            <ScoreSummary
              result={startingResult}
              finalResult={state.finalAssessment.completedAt && finalResult.complete ? finalResult : undefined}
              confidence={confidence}
              programme={programme}
              profile={state.profile}
            />
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-900">Course lessons</span><span className="text-sm font-black text-indigo-700">{lessonCompletionPercent}%</span></div>
              <div className="mt-3"><ScoreBar value={lessonCompletionPercent} /></div>
              <p className="mt-2 text-[11px] text-slate-500">{lessonsCompleted} of {totalLessons} lessons complete</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-900">Practical assignments</span><span className="text-sm font-black text-indigo-700">{assignmentsCompleted}/{programmeAssignments.length}</span></div>
              <div className="mt-3"><ScoreBar value={programmeAssignments.length ? Math.round(assignmentsCompleted / programmeAssignments.length * 100) : 0} colour="bg-emerald-500" /></div>
              <p className="mt-2 text-[11px] text-slate-500">Required for the Certificate of Completion</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-900">Final examination</span><span className="text-sm font-black text-indigo-700">{bestAttempt?.score ?? 0}%</span></div>
              <div className="mt-3"><ScoreBar value={bestAttempt?.score ?? 0} colour={status.finalExamPassed ? 'bg-emerald-500' : 'bg-amber-500'} /></div>
              <p className="mt-2 text-[11px] text-slate-500">Pass mark: {programme.certificate.finalExamMinimumScore}% · Unlimited review and retakes</p>
            </div>
          </div>

          {startingResult.complete && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500" /><h2 className="text-sm font-black text-slate-900">Recommended modules for your priorities</h2></div>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {startingResult.priorityCategoryIds.map((categoryId) => {
                  const category = programme.diagnostic.categories.find((item) => item.id === categoryId)!;
                  return (
                    <div key={categoryId} className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                      <p className="text-xs font-bold text-amber-950">{categoryLabel(category, state.profile)}</p>
                      <p className="mt-1 text-[10px] leading-4 text-amber-800">Prioritise Modules {category.moduleNumbers.join(', ')}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {category.moduleNumbers.map((number) => (
                          <button key={number} onClick={() => onOpenModule(number)} className="rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-bold text-indigo-700 shadow-sm ring-1 ring-indigo-100 hover:bg-indigo-50">Open Module {number}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className={`rounded-2xl border p-6 ${status.readyForCertificate ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-start gap-3">
              {status.readyForCertificate ? <Award className="h-7 w-7 text-emerald-600" /> : <Lock className="h-6 w-6 text-slate-400" />}
              <div className="flex-1">
                <h2 className="text-sm font-black text-slate-900">{status.readyForCertificate ? 'Certificate unlocked' : 'Certificate requirements'}</h2>
                <div className="mt-3 grid grid-cols-1 gap-2 text-xs md:grid-cols-3">
                  <p className={`flex items-center gap-2 ${lessonCompletionPercent >= 100 ? 'text-emerald-700' : 'text-slate-500'}`}><CheckCircle2 className="h-4 w-4" /> 100% lessons</p>
                  <p className={`flex items-center gap-2 ${assignmentsCompleted >= programmeAssignments.length && programmeAssignments.length > 0 ? 'text-emerald-700' : 'text-slate-500'}`}><CheckCircle2 className="h-4 w-4" /> All assignments</p>
                  <p className={`flex items-center gap-2 ${status.finalExamPassed ? 'text-emerald-700' : 'text-slate-500'}`}><CheckCircle2 className="h-4 w-4" /> Exam ≥ {programme.certificate.finalExamMinimumScore}%</p>
                </div>
                {status.certificateId && <p className="mt-3 text-[10px] font-semibold text-emerald-800">Credential ID: {status.certificateId}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'diagnostic' && (
        <div className="space-y-6">
          {!profileSaved ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-start gap-3">
                <UserRoundCog className="mt-0.5 h-6 w-6 text-indigo-600" />
                <div><h2 className="text-lg font-black text-slate-900">Tell us about the business</h2><p className="mt-1 text-xs leading-5 text-slate-500">This makes the questions fair for your stage and operating model. Information is saved only in this browser.</p></div>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="text-xs font-semibold text-slate-700">Business or idea name<input className={`${profileTextInput} mt-1.5`} value={state.profile.businessName} onChange={(e) => updateProfile('businessName', e.target.value)} /></label>
                <label className="text-xs font-semibold text-slate-700">Country<input className={`${profileTextInput} mt-1.5`} value={state.profile.country} onChange={(e) => updateProfile('country', e.target.value)} /></label>
                <label className="text-xs font-semibold text-slate-700">Industry<input className={`${profileTextInput} mt-1.5`} placeholder="e.g. retail, tourism, ICT, food service" value={state.profile.industry} onChange={(e) => updateProfile('industry', e.target.value)} /></label>
                <label className="text-xs font-semibold text-slate-700">Business stage<select className={`${profileTextInput} mt-1.5`} value={state.profile.stage} onChange={(e) => updateProfile('stage', e.target.value as BusinessProfile['stage'])}><option value="pre_launch">Planning / pre-launch</option><option value="operating">Already operating</option></select></label>
                <label className="text-xs font-semibold text-slate-700">What do you provide?<select className={`${profileTextInput} mt-1.5`} value={state.profile.offering} onChange={(e) => updateProfile('offering', e.target.value as BusinessProfile['offering'])}><option value="services">Services</option><option value="goods">Goods/products</option><option value="both">Goods and services</option></select></label>
                <label className="text-xs font-semibold text-slate-700">Main customer type<select className={`${profileTextInput} mt-1.5`} value={state.profile.customerType} onChange={(e) => updateProfile('customerType', e.target.value as BusinessProfile['customerType'])}><option value="consumers">Consumers</option><option value="businesses">Businesses</option><option value="government">Government</option><option value="tourism">Tourism</option><option value="export">Export/regional</option><option value="mixed">Mixed</option></select></label>
                <label className="text-xs font-semibold text-slate-700">Team size<select className={`${profileTextInput} mt-1.5`} value={state.profile.employeeRange} onChange={(e) => updateProfile('employeeRange', e.target.value as BusinessProfile['employeeRange'])}><option value="solo">Owner only</option><option value="2-5">2–5 people</option><option value="6-10">6–10 people</option><option value="11-25">11–25 people</option><option value="26+">26+ people</option></select></label>
                {state.profile.stage === 'operating' && <label className="text-xs font-semibold text-slate-700">Years operating<input className={`${profileTextInput} mt-1.5`} placeholder="e.g. 3 years" value={state.profile.yearsOperating} onChange={(e) => updateProfile('yearsOperating', e.target.value)} /></label>}
              </div>
              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ['importsInputs', 'Imports stock/materials'], ['sellsOnline', 'Sells or books online'], ['usesAccountingSystem', 'Uses accounting software'], ['usesCrm', 'Uses a CRM'], ['usesAi', 'Uses AI in operations']
                ].map(([key, label]) => (
                  <label key={key} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700"><input type="checkbox" checked={Boolean(state.profile[key as keyof BusinessProfile])} onChange={(e) => updateProfile(key as keyof BusinessProfile, e.target.checked as never)} />{label}</label>
                ))}
              </div>
              <button
                disabled={!isBusinessProfileComplete(state.profile)}
                onClick={() => { setProfileSaved(true); setDiagnosticMode('starting'); setDiagnosticCategoryIndex(0); }}
                className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save Profile & Start Diagnostic
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
                <div><p className="text-xs font-bold text-slate-900">{state.profile.businessName}</p><p className="text-[10px] text-slate-500">{profileLabel(state.profile.stage)} · {profileLabel(state.profile.offering)} · {state.profile.country}</p></div>
                {!state.startingAssessment.completedAt && <button onClick={() => setProfileSaved(false)} className="text-[10px] font-bold text-indigo-700 underline">Edit profile</button>}
                {state.startingAssessment.completedAt && (
                  <div className="flex gap-2">
                    <button onClick={() => { setDiagnosticMode('starting'); setDiagnosticCategoryIndex(0); }} className={`rounded-lg px-3 py-2 text-[10px] font-bold ${diagnosticMode === 'starting' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>View Baseline</button>
                    <button onClick={() => { setDiagnosticMode('final'); setDiagnosticCategoryIndex(0); }} className={`rounded-lg px-3 py-2 text-[10px] font-bold ${diagnosticMode === 'final' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Final Diagnostic</button>
                  </div>
                )}
              </div>

              {diagnosticMode === 'starting' && state.startingAssessment.completedAt ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8"><ScoreSummary result={startingResult} confidence={confidence} programme={programme} profile={state.profile} /><div className="mt-6 flex justify-end"><button onClick={() => { setDiagnosticMode('final'); setDiagnosticCategoryIndex(0); }} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white">Take Final Diagnostic</button></div></div>
              ) : diagnosticMode === 'final' && state.finalAssessment.completedAt ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8"><ScoreSummary result={startingResult} finalResult={finalResult} confidence={confidence} programme={programme} profile={state.profile} /><div className="mt-6 flex justify-end"><button onClick={() => setState((current) => ({ ...current, finalAssessment: { answers: {} } }))} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700"><RefreshCw className="h-4 w-4" /> Retake Final Diagnostic</button></div></div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div><p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">{diagnosticMode === 'starting' ? 'Starting diagnostic' : 'Final diagnostic'} · Area {diagnosticCategoryIndex + 1} of {programme.diagnostic.categories.length}</p><h2 className="mt-1 text-xl font-black text-slate-900">{categoryLabel(activeCategory, state.profile)}</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">{activeCategory.description}</p></div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600">Weight {activeCategory.weight}%</span>
                  </div>
                  <div className="mt-5"><ScoreBar value={Math.round(((diagnosticCategoryIndex + (currentCategoryAnswered ? 1 : 0)) / programme.diagnostic.categories.length) * 100)} /></div>
                  <div className="mt-7 space-y-6">
                    {activeQuestions.map((question, questionIndex) => (
                      <fieldset key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                        <legend className="px-1 text-xs font-bold leading-5 text-slate-900">{diagnosticCategoryIndex * 5 + questionIndex + 1}. {diagnosticPrompt(question, state.profile)}</legend>
                        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-5">
                          {programme.diagnostic.scale.map((option) => {
                            const selected = currentAssessment.answers[question.id] === option.value;
                            const label = state.profile.stage === 'pre_launch' ? option.preLaunchLabel : option.operatingLabel;
                            return (
                              <label key={option.value} title={option.description} className={`cursor-pointer rounded-xl border p-3 text-center transition ${selected ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'}`}>
                                <input className="sr-only" type="radio" name={`${diagnosticMode}-${question.id}`} value={option.value} checked={selected} onChange={() => setDiagnosticAnswer(question.id, option.value)} />
                                <span className="block text-base font-black">{option.value}</span><span className="mt-1 block text-[9px] font-bold leading-3">{label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>
                    ))}
                  </div>
                  <div className="mt-7 flex items-center justify-between">
                    <button disabled={diagnosticCategoryIndex === 0} onClick={() => setDiagnosticCategoryIndex((index) => Math.max(0, index - 1))} className="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /> Previous</button>
                    {diagnosticCategoryIndex < programme.diagnostic.categories.length - 1 ? (
                      <button disabled={!currentCategoryAnswered} onClick={() => setDiagnosticCategoryIndex((index) => index + 1)} className="flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-30">Next area <ChevronRight className="h-4 w-4" /></button>
                    ) : (
                      <button disabled={!currentResult.complete} onClick={finishDiagnostic} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-30"><Save className="h-4 w-4" /> Calculate & Save Score</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'workbook' && (
        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:flex-row md:items-center md:justify-between">
            <div><h2 className="text-lg font-black text-slate-900">My Business Advantage Workbook</h2><p className="mt-1 text-xs text-slate-500">Complete one applied section per module. Detailed responses become your exportable operating plan and increase assessment confidence.</p></div>
            <button onClick={downloadWorkbook} className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700"><Download className="h-4 w-4" /> Download My Plan</button>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between text-xs"><span className="font-bold text-slate-800">Workbook evidence</span><span className="font-black text-indigo-700">{workbookCompleted}/{programme.workbookSections.length}</span></div><div className="mt-2"><ScoreBar value={Math.round(workbookCompleted / programme.workbookSections.length * 100)} colour="bg-emerald-500" /></div></div>
          <div className="space-y-3">
            {programme.workbookSections.map((section) => {
              const saved = state.workbook[section.id] || { responses: {} };
              const isOpen = openWorkbookSection === section.id;
              const module = modules[section.moduleNumber - 1];
              return (
                <div key={section.id} className={`overflow-hidden rounded-2xl border bg-white ${saved.completedAt ? 'border-emerald-300' : 'border-slate-200'}`}>
                  <button onClick={() => setOpenWorkbookSection(isOpen ? '' : section.id)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
                    <div className="flex min-w-0 items-start gap-3">{saved.completedAt ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />}<div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Module {section.moduleNumber}</p><h3 className="truncate text-sm font-black text-slate-900">{section.title}</h3><p className="mt-1 text-[11px] leading-4 text-slate-500">{section.outcome}</p></div></div>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="space-y-5 border-t border-slate-100 p-5">
                      {section.prompts.map((prompt) => (
                        <label key={prompt.id} className="block"><span className="text-xs font-bold text-slate-800">{prompt.label}</span><span className="ml-2 text-[10px] text-slate-400">{prompt.helpText}</span><textarea rows={5} className={`${profileTextInput} mt-2 leading-5`} placeholder={prompt.placeholder} value={saved.responses[prompt.id] || ''} onChange={(e) => updateWorkbookResponse(section, prompt.id, e.target.value)} /></label>
                      ))}
                      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <button onClick={() => onOpenModule(section.moduleNumber, 'last')} className="text-left text-[10px] font-bold text-indigo-700 underline">Open {module?.title || `Module ${section.moduleNumber}`} assignment</button>
                        <button onClick={() => toggleWorkbookComplete(section)} className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold ${saved.completedAt ? 'border border-slate-200 bg-white text-slate-600' : 'bg-emerald-600 text-white'}`}>{saved.completedAt ? <RefreshCw className="h-4 w-4" /> : <Check className="h-4 w-4" />}{saved.completedAt ? 'Reopen Section' : 'Mark Evidence Complete'}</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'exam' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
            <div className="flex items-start gap-3"><Award className="h-7 w-7 text-amber-500" /><div><h2 className="text-xl font-black text-slate-900">{programme.finalExam.title}</h2><p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">{programme.finalExam.intro}</p></div></div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className={`rounded-xl border p-4 ${lessonCompletionPercent >= 100 ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}><p className="text-[10px] font-bold uppercase text-slate-500">Lessons</p><p className="mt-1 text-lg font-black text-slate-900">{lessonCompletionPercent}%</p></div>
              <div className={`rounded-xl border p-4 ${assignmentsCompleted >= programmeAssignments.length && programmeAssignments.length > 0 ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}><p className="text-[10px] font-bold uppercase text-slate-500">Assignments</p><p className="mt-1 text-lg font-black text-slate-900">{assignmentsCompleted}/{programmeAssignments.length}</p></div>
              <div className={`rounded-xl border p-4 ${status.finalExamPassed ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}><p className="text-[10px] font-bold uppercase text-slate-500">Best exam score</p><p className="mt-1 text-lg font-black text-slate-900">{bestAttempt?.score ?? 0}%</p></div>
            </div>
          </div>

          {latestAttempt && (
            <div className={`rounded-2xl border p-5 ${latestAttempt.passed ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}>
              <p className="text-sm font-black text-slate-900">Latest attempt: {latestAttempt.score}% · {latestAttempt.passed ? 'Passed' : 'Review required'}</p>
              <p className="mt-1 text-xs text-slate-600">{latestAttempt.correct} of {latestAttempt.total} correct · {formatDate(latestAttempt.submittedAt)}</p>
              {!latestAttempt.passed && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {latestAttempt.missedCategoryIds.map((categoryId) => {
                    const category = programme.diagnostic.categories.find((item) => item.id === categoryId);
                    return category ? <span key={categoryId} className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-amber-800 ring-1 ring-amber-200">Review Modules {category.moduleNumbers.join(', ')} · {categoryLabel(category, state.profile)}</span> : null;
                  })}
                </div>
              )}
            </div>
          )}

          {!examUnlocked ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center"><Lock className="mx-auto h-10 w-10 text-slate-400" /><h3 className="mt-3 text-lg font-black text-slate-900">Complete the learning work first</h3><p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-slate-500">The final exam unlocks after all lessons and required practical assignments are complete. This keeps certification tied to participation and application, not guessing.</p></div>
          ) : status.finalExamPassed ? (
            <div className="rounded-3xl border border-emerald-300 bg-emerald-50 p-8 text-center"><ShieldCheck className="mx-auto h-12 w-12 text-emerald-600" /><h3 className="mt-3 text-xl font-black text-emerald-950">Final examination passed</h3><p className="mt-2 text-sm text-emerald-800">Best score: {status.bestExamScore}% · Your certificate is {status.readyForCertificate ? 'ready to claim from the course sidebar' : 'being prepared'}.</p><button onClick={() => setState((current) => ({ ...current, examAnswers: {} }))} className="mt-4 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-bold text-emerald-800">Optional Retake</button></div>
          ) : (
            <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
              {programme.finalExam.questions.map((question, index) => (
                <fieldset key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                  <legend className="px-1 text-xs font-bold leading-5 text-slate-900">{index + 1}. {question.questionText}</legend>
                  <div className="mt-3 space-y-2">
                    {question.options.map((option) => {
                      const selected = state.examAnswers[question.id] === option;
                      return <label key={option} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-xs transition ${selected ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-950' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'}`}><input type="radio" name={question.id} checked={selected} onChange={() => setState((current) => ({ ...current, examAnswers: { ...current.examAnswers, [question.id]: option } }))} /><span>{option}</span></label>;
                    })}
                  </div>
                </fieldset>
              ))}
              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-[10px] text-slate-500">Answers are saved in this browser. Submit only when all {programme.finalExam.questions.length} questions are answered.</p><button onClick={submitFinalExam} disabled={programme.finalExam.questions.some((question) => !state.examAnswers[question.id])} className="rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow hover:bg-indigo-700 disabled:opacity-40">Submit Final Examination</button></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

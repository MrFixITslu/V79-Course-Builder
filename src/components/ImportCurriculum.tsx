import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UploadCloud, 
  History, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  HelpCircle, 
  Loader2, 
  FileCode,
  FileSpreadsheet,
  Check,
  ChevronDown,
  ChevronRight,
  Info,
  AlertCircle,
  Clock,
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Save,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  FolderPlus,
  FileUp,
  Sliders,
  PlayCircle,
  Music,
  CheckSquare,
  Bookmark,
  Share2
} from 'lucide-react';
import { ImportHistory } from '../types/course-builder-v2';
import { UnifiedCurriculumParser, extractTextFromDocx, ParsedCourse, ValidationError } from '../lib/curriculumParser';

interface ImportCurriculumProps {
  onCourseSelected: (course: any) => void;
  setCurrentView: (view: string) => void;
}

// Edit state path specifier
type EditPath = 
  | { type: 'course' }
  | { type: 'module'; moduleIdx: number }
  | { type: 'lesson'; moduleIdx: number; lesIdx: number };

export function ImportCurriculum({ onCourseSelected, setCurrentView }: ImportCurriculumProps) {
  const [step, setStep] = useState<number>(1);
  const [importedBy, setImportedBy] = useState('Administrator');
  
  // File upload state
  const [docText, setDocText] = useState('');
  const [docFileName, setDocFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<ParsedCourse | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // Auto-save progress
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [autoSavedDate, setAutoSavedDate] = useState<string | null>(null);

  // List expand collapse in Preview
  const [expandedPreviewModules, setExpandedPreviewModules] = useState<Record<number, boolean>>({ 0: true });

  // Step 4: Fine-tune Edit Path
  const [editPath, setEditPath] = useState<EditPath>({ type: 'course' });

  // Step 5: Generation state
  const [generating, setGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<any | null>(null);

  // Step 6: Publishing sync state
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Import histories audit logs
  const [history, setHistory] = useState<ImportHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load history & Check auto-save session on mount
  useEffect(() => {
    fetchHistory();
    const saved = localStorage.getItem('v79_import_wizard_state');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data && (data.docText || data.step > 1)) {
          setAutoSavedDate(data.savedAt ? new Date(data.savedAt).toLocaleString() : 'Recent session');
          setShowResumeBanner(true);
        }
      } catch (e) {
        console.error('Failed to parse auto-saved session:', e);
      }
    }
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/import-histories');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch import histories:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Auto-save state updates
  useEffect(() => {
    if (step > 1 || docText.trim() !== '') {
      localStorage.setItem('v79_import_wizard_state', JSON.stringify({
        step,
        docText,
        docFileName,
        parsedPreview,
        importedBy,
        savedAt: new Date().toISOString()
      }));
    }
  }, [step, docText, docFileName, parsedPreview, importedBy]);

  const handleResume = () => {
    const saved = localStorage.getItem('v79_import_wizard_state');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setStep(data.step || 1);
        setDocText(data.docText || '');
        setDocFileName(data.docFileName || null);
        setParsedPreview(data.parsedPreview || null);
        setImportedBy(data.importedBy || 'Administrator');
      } catch (e) {
        console.error('Error recovering auto-saved state:', e);
      }
    }
    setShowResumeBanner(false);
  };

  const handleStartFresh = () => {
    localStorage.removeItem('v79_import_wizard_state');
    setStep(1);
    setDocText('');
    setDocFileName(null);
    setParsedPreview(null);
    setShowResumeBanner(false);
    setGeneratedCourse(null);
    setPublishMessage(null);
    setEditPath({ type: 'course' });
  };

  // TXT / MD / DOCX File Uploader
  const handleDocFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Enforce 10MB file upload size limit for stability & safety
    const MAX_FILE_SIZE_MB = 10;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setParseError(`Upload Blocked: File "${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB safety limit. Please upload a smaller curriculum outline.`);
      setDocFileName(null);
      return;
    }

    setDocFileName(file.name);
    setParseError(null);

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    try {
      if (fileExt === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const extractedText = await extractTextFromDocx(arrayBuffer);
        setDocText(extractedText);
      } else {
        const text = await file.text();
        setDocText(text);
      }
    } catch (err: any) {
      setParseError('Failed to extract document contents: ' + err.message);
    }
  };

  // Sample Syllabus Loader
  const handleLoadSample = () => {
    const sample = `# Course: Introduction to SIWM
Description: A professional guide to Smart Investment Wealth Manager configurations, portfolio balancing, and asset trading.
Duration: 6.5 hours
Objectives:
- Navigate SIWM's dashboard and analytical panels
- Identify high-priority trade parameters
- Perform buying, holding, and selling simulations

Prerequisites:
- Financial Basics 101
- Clean developer credentials

## Module 1: Core Framework Configurations
Description: Get your system setup and parameters locked.

### Lesson 1.1: Environment Initialization
Objectives:
- Generate authentication hashes
Duration: 45 minutes
Description: Complete walkthrough of system environments and salt variables.

[Video] Setup Walkthrough: https://example.com/siwm-walkthrough.mp4
[Audio] Glossary: https://example.com/audio-definitions.mp3
[PDF] Cheat Sheet: https://example.com/cheatsheet.pdf
[Download] Exercises: https://example.com/exercise.zip

[Assignment] Configure Local Sandbox Environments
Max Points: 100
Submission Type: text
Description: Submit your sandbox environment settings output.

[Quiz] Core Configuration Concepts
Passing Score: 80%

Question: Which cryptographic algorithm is used to hash admin password in standard configs?
Type: multiple_choice
Option A: md5
Option B: scrypt
Option C: plain_text
Correct: B
Explanation: V79 uses Node.js scryptSync to hash admin credentials securely.

Question: True or False: Port 3000 is the only externally accessible port.
Type: true_false
Correct: True
Explanation: Nginx routes ingress strictly through port 3000.
`;
    setDocText(sample);
    setDocFileName('sample-siwm-syllabus.md');
    setParseError(null);
  };

  // Execute Analysis step
  const handleAnalyzeSyllabus = async () => {
    if (!docText.trim()) {
      setParseError('Please write or upload a curriculum outline document first.');
      return;
    }
    setParsing(true);
    setParseError(null);
    try {
      const response = await fetch('/api/courses/parse-curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: docText })
      });
      if (!response.ok) {
        const errResult = await response.json();
        throw new Error(errResult.error || 'Server parser service failed.');
      }
      const parsedData: ParsedCourse = await response.json();
      setParsedPreview(parsedData);
      setStep(2);
      setEditPath({ type: 'course' });
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse curriculum.');
    } finally {
      setParsing(false);
    }
  };

  // -------------------------------------------------------------
  // Data Analytics Helpers (Show Modules, Lessons, Media, Broken Links, Duplicates)
  // -------------------------------------------------------------
  const analytics = useMemo(() => {
    if (!parsedPreview) return { modules: [], lessonsCount: 0, media: [], brokenLinks: [], duplicates: [] };

    const modules = parsedPreview.modules;
    let lessonsCount = 0;
    const media: { type: string; url: string; lesson: string }[] = [];
    const brokenLinks: { lesson: string; resource: string; url: string; reason: string }[] = [];
    const duplicates: { type: string; name: string; info: string }[] = [];

    const modTitles = new Map<string, number>();
    const lesTitles = new Map<string, number>();
    const quizQTexts = new Map<string, number>();

    modules.forEach((mod) => {
      const mTitle = mod.title.trim().toLowerCase();
      if (mTitle) modTitles.set(mTitle, (modTitles.get(mTitle) || 0) + 1);

      (mod.lessons || []).forEach((les) => {
        lessonsCount++;
        const lTitle = les.title.trim().toLowerCase();
        if (lTitle) lesTitles.set(lTitle, (lesTitles.get(lTitle) || 0) + 1);

        // Check Media / Resources
        if (les.videoUrl) {
          media.push({ type: 'video', url: les.videoUrl, lesson: les.title });
          checkLink(les.title, 'Video Link', les.videoUrl, brokenLinks);
        }
        if (les.audioUrl) {
          media.push({ type: 'audio', url: les.audioUrl, lesson: les.title });
          checkLink(les.title, 'Audio Link', les.audioUrl, brokenLinks);
        }
        if (les.pdfUrl) {
          media.push({ type: 'document', url: les.pdfUrl, lesson: les.title });
          checkLink(les.title, 'PDF Reference', les.pdfUrl, brokenLinks);
        }
        (les.downloads || []).forEach((dl) => {
          media.push({ type: 'download', url: dl.url, lesson: les.title });
          checkLink(les.title, `Download: ${dl.name}`, dl.url, brokenLinks);
        });

        // Quizzes & Questions
        (les.quizzes || []).forEach((quiz) => {
          (quiz.questions || []).forEach((q) => {
            const qText = q.questionText.trim().toLowerCase();
            if (qText) quizQTexts.set(qText, (quizQTexts.get(qText) || 0) + 1);
          });
        });
      });
    });

    // Verify Duplicates
    modules.forEach((mod) => {
      if (modTitles.get(mod.title.trim().toLowerCase())! > 1) {
        if (!duplicates.some(d => d.type === 'Module' && d.name === mod.title)) {
          duplicates.push({ type: 'Module', name: mod.title, info: 'Identical module title detected multiple times.' });
        }
      }
      (mod.lessons || []).forEach((les) => {
        if (lesTitles.get(les.title.trim().toLowerCase())! > 1) {
          if (!duplicates.some(d => d.type === 'Lesson' && d.name === les.title)) {
            duplicates.push({ type: 'Lesson', name: les.title, info: 'Lesson title repeated across curriculum.' });
          }
        }
        (les.quizzes || []).forEach((quiz) => {
          (quiz.questions || []).forEach((q) => {
            if (quizQTexts.get(q.questionText.trim().toLowerCase())! > 1) {
              const truncated = q.questionText.length > 40 ? q.questionText.substring(0, 40) + '...' : q.questionText;
              if (!duplicates.some(d => d.type === 'Quiz Question' && d.name === truncated)) {
                duplicates.push({ type: 'Quiz Question', name: truncated, info: 'Duplicate quiz question text.' });
              }
            }
          });
        });
      });
    });

    return { modules, lessonsCount, media, brokenLinks, duplicates };
  }, [parsedPreview]);

  // Helper check for broken/placeholder links
  function checkLink(lessonName: string, typeName: string, url: string, list: any[]) {
    const trimmed = (url || '').trim();
    if (!trimmed || trimmed === '#') {
      list.push({ lesson: lessonName, resource: typeName, url: trimmed || 'None', reason: 'Empty or anchor placeholder' });
    } else if (trimmed.includes('example.com')) {
      list.push({ lesson: lessonName, resource: typeName, url: trimmed, reason: 'Dummy placeholder domain (example.com)' });
    } else if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      list.push({ lesson: lessonName, resource: typeName, url: trimmed, reason: 'Missing web protocol (http/https)' });
    }
  }

  // Edit action helpers (mutating state safely before generation)
  const updateCourseField = (key: keyof ParsedCourse, value: any) => {
    if (!parsedPreview) return;
    setParsedPreview({ ...parsedPreview, [key]: value });
  };

  const updateModuleField = (mIdx: number, key: string, value: any) => {
    if (!parsedPreview) return;
    const modules = [...parsedPreview.modules];
    modules[mIdx] = { ...modules[mIdx], [key]: value };
    setParsedPreview({ ...parsedPreview, modules });
  };

  const updateLessonField = (mIdx: number, lIdx: number, key: string, value: any) => {
    if (!parsedPreview) return;
    const modules = [...parsedPreview.modules];
    const lessons = [...modules[mIdx].lessons];
    lessons[lIdx] = { ...lessons[lIdx], [key]: value };
    modules[mIdx] = { ...modules[mIdx], lessons };
    setParsedPreview({ ...parsedPreview, modules });
  };

  const deleteModule = (mIdx: number) => {
    if (!parsedPreview) return;
    const modules = parsedPreview.modules.filter((_, idx) => idx !== mIdx);
    setParsedPreview({ ...parsedPreview, modules });
    setEditPath({ type: 'course' });
  };

  const addModule = () => {
    if (!parsedPreview) return;
    const newMod = {
      title: `Module ${parsedPreview.modules.length + 1}: Brand New Section`,
      description: 'System-generated module container.',
      lessons: []
    };
    setParsedPreview({ ...parsedPreview, modules: [...parsedPreview.modules, newMod] });
    setEditPath({ type: 'module', moduleIdx: parsedPreview.modules.length });
  };

  const deleteLesson = (mIdx: number, lIdx: number) => {
    if (!parsedPreview) return;
    const modules = [...parsedPreview.modules];
    modules[mIdx].lessons = modules[mIdx].lessons.filter((_, idx) => idx !== lIdx);
    setParsedPreview({ ...parsedPreview, modules });
    setEditPath({ type: 'module', moduleIdx: mIdx });
  };

  const addLesson = (mIdx: number) => {
    if (!parsedPreview) return;
    const modules = [...parsedPreview.modules];
    const newLes = {
      title: `Lesson ${modules[mIdx].lessons.length + 1}: New Topic`,
      description: 'Topic description and guides.',
      estimatedTime: '25 mins',
      learningObjectives: [],
      downloads: [],
      assignments: [],
      quizzes: []
    };
    modules[mIdx].lessons = [...modules[mIdx].lessons, newLes];
    setParsedPreview({ ...parsedPreview, modules });
    setEditPath({ type: 'lesson', moduleIdx: mIdx, lesIdx: modules[mIdx].lessons.length - 1 });
  };

  // -------------------------------------------------------------
  // Step 5: Secure Database Generation Flow
  // -------------------------------------------------------------
  const handleGenerateCourse = async () => {
    if (!parsedPreview) return;
    setGenerating(true);
    setPublishMessage(null);

    try {
      // 1. Compile state into Unified Course Package schema
      const courseId = `course-imp-${Date.now()}`;
      const modules: any[] = [];
      const quizzes: any[] = [];
      const assignments: any[] = [];
      const downloads: any[] = [];

      parsedPreview.modules.forEach((mod, mIdx) => {
        const modId = `mod-imp-${Date.now()}-${mIdx}`;
        const lessonsList: any[] = [];

        (mod.lessons || []).forEach((les, lIdx) => {
          const lesId = `les-imp-${Date.now()}-${mIdx}-${lIdx}`;
          lessonsList.push({
            id: lesId,
            moduleId: modId,
            courseId,
            title: les.title,
            description: les.description,
            estimatedTime: les.estimatedTime || '20 mins',
            learning_objectives: les.learningObjectives || [],
            videoUrl: les.videoUrl || '',
            audioUrl: les.audioUrl || '',
            downloads: les.downloads || []
          });

          // Quizzes
          if (les.quizzes && les.quizzes.length > 0) {
            les.quizzes.forEach((quiz, qIdx) => {
              quizzes.push({
                id: `quiz-imp-${Date.now()}-${mIdx}-${lIdx}-${qIdx}`,
                lessonId: lesId,
                title: quiz.title || 'Lesson Assessment',
                passingScore: quiz.passingScore || 80,
                questions: (quiz.questions || []).map((q, qnIdx) => ({
                  id: `q-imp-${Date.now()}-${mIdx}-${lIdx}-${qIdx}-${qnIdx}`,
                  questionText: q.questionText,
                  questionType: q.questionType,
                  options: q.options || [],
                  correctAnswer: q.correctAnswer,
                  explanation: q.explanation,
                  orderNumber: qnIdx + 1
                }))
              });
            });
          }

          // Assignments
          if (les.assignments && les.assignments.length > 0) {
            les.assignments.forEach((as, asIdx) => {
              assignments.push({
                id: `assign-imp-${Date.now()}-${mIdx}-${lIdx}-${asIdx}`,
                courseId,
                moduleId: modId,
                lessonId: lesId,
                title: as.title,
                description: as.description,
                maxPoints: as.maxPoints || 100,
                submissionType: as.submissionType || 'file'
              });
            });
          }

          // Downloads
          if (les.downloads && les.downloads.length > 0) {
            les.downloads.forEach((dl, dlIdx) => {
              downloads.push({
                id: `dl-imp-${Date.now()}-${mIdx}-${lIdx}-${dlIdx}`,
                courseId,
                lessonId: lesId,
                name: dl.name,
                fileType: dl.type || 'pdf',
                url: dl.url || '#',
                fileSize: dl.size || '1.0 MB'
              });
            });
          }
        });

        modules.push({
          id: modId,
          courseId,
          title: mod.title,
          description: mod.description,
          orderNumber: mIdx + 1,
          lessons: lessonsList
        });
      });

      const payload = {
        course: {
          id: courseId,
          title: parsedPreview.title || 'Untitled Curriculum',
          shortDescription: parsedPreview.shortDescription || 'Imported curriculum outline.',
          fullDescription: parsedPreview.fullDescription || parsedPreview.shortDescription || '',
          estimatedDuration: parsedPreview.estimatedDuration || '10 hours',
          learningObjectives: parsedPreview.learningObjectives || [],
          prerequisites: parsedPreview.prerequisites || [],
          status: 'Imported',
          category: 'General',
          difficultyLevel: 'Beginner',
          instructor: importedBy,
          price: 0,
          pricingType: 'free',
          courseVersion: '1.0.0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        modules,
        quizzes,
        assignments,
        downloads
      };

      // 2. Submit to the backend
      const res = await fetch('/api/courses/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageData: payload,
          importedBy,
          sourceFileName: docFileName || 'curriculum_outline.txt'
        })
      });

      const result = await res.json();
      if (!res.ok || result.status === 'Failed') {
        throw new Error(result.errorMessage || 'Failed to persist course elements.');
      }

      setGeneratedCourse(payload.course);
      localStorage.removeItem('v79_import_wizard_state'); // Successful generation clears progress
      fetchHistory();
      setStep(6);
    } catch (err: any) {
      alert('Generation Failed: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  // -------------------------------------------------------------
  // Step 6: Live Catalog Sync (Publishing)
  // -------------------------------------------------------------
  const handleLivePublish = async () => {
    if (!generatedCourse) return;
    setPublishing(true);
    setPublishMessage(null);
    try {
      const res = await fetch(`/api/courses/${generatedCourse.id}/publish`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Publishing sync refused.');
      }
      setPublishMessage({
        type: 'success',
        text: `Synchronized successfully! Course is now live in Vision79. Remote App ID: ${data.websiteAppId}`
      });
    } catch (err: any) {
      setPublishMessage({
        type: 'error',
        text: err.message || 'Publish connection failed. Verify webhook keys in platform settings.'
      });
    } finally {
      setPublishing(false);
    }
  };

  // Toggle module preview lists
  const togglePreviewModule = (idx: number) => {
    setExpandedPreviewModules(p => ({ ...p, [idx]: !p[idx] }));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Auto-save session restore banner */}
      {showResumeBanner && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Restore Unfinished Session</p>
              <p className="text-[10px] text-slate-500 mt-0.5">We backed up your progress automatically on {autoSavedDate}.</p>
            </div>
          </div>
          <div className="flex space-x-3 shrink-0">
            <button
              onClick={handleStartFresh}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-indigo-100/50 transition-colors"
            >
              Start Fresh
            </button>
            <button
              onClick={handleResume}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-md transition-all"
            >
              Resume Session
            </button>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-indigo-600 uppercase">Phase 4 Release</span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">Interactive Curriculum Import Wizard</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl">
            A state-guided, auto-saving pipeline to transform raw outline documents (.MD, .TXT, .DOCX) into high-fidelity structured course manifests. Edit details prior to database generation.
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Sliders className="w-6 h-6" />
        </div>
      </div>

      {/* Step Progress Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          {[
            { num: 1, label: 'Upload Curriculum' },
            { num: 2, label: 'Analyze Document' },
            { num: 3, label: 'Preview structure' },
            { num: 4, label: 'Fine-Tune details' },
            { num: 5, label: 'Generate Course' },
            { num: 6, label: 'Publish & Launch' }
          ].map((item, idx) => {
            const isActive = step === item.num;
            const isCompleted = step > item.num;
            return (
              <React.Fragment key={item.num}>
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs transition-all ${
                    isCompleted 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : isActive 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : item.num}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-indigo-600' : isCompleted ? 'text-emerald-700' : 'text-slate-400'}`}>
                      Step {item.num}
                    </p>
                    <p className={`text-xs font-semibold truncate ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                      {item.label}
                    </p>
                  </div>
                </div>
                {idx < 5 && <div className="hidden md:block w-px h-8 bg-slate-200 self-center shrink-0" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Wizard Content Panels */}
      <div className="min-h-[450px]">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: UPLOAD CURRICULUM */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                      <FileUp className="w-4 h-4 text-indigo-600" />
                      <span>Syllabus Source File & Metadata</span>
                    </h3>
                    <button
                      onClick={handleLoadSample}
                      className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Load Sample Outline
                    </button>
                  </div>

                  {parseError && (
                    <div className="p-4 rounded-xl border bg-rose-50 text-rose-800 border-rose-200 text-xs flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{parseError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700">Course Author / Importer</label>
                      <input
                        type="text"
                        value={importedBy}
                        onChange={(e) => setImportedBy(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700">Identified Source File</label>
                      <input
                        type="text"
                        readOnly
                        placeholder="No file uploaded"
                        value={docFileName || ''}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Drag-and-drop Styled Upload Area */}
                  <div className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl p-8 text-center bg-slate-50/50 hover:bg-slate-50/10 transition-all space-y-3 relative">
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                    <div>
                      <span className="text-xs font-semibold text-indigo-600 cursor-pointer hover:underline relative">
                        Choose Outline File (.txt, .md, .docx)
                        <input
                          type="file"
                          accept=".txt,.md,.docx"
                          onChange={handleDocFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">Parses headings, description briefs, media attachments, quizzes and assignments.</p>
                    </div>
                  </div>

                  {/* Syllabus editing textarea */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 flex justify-between">
                      <span>Curriculum Outline Content</span>
                      {docText && <span className="text-[10px] text-slate-400 font-normal">{docText.split('\n').length} Lines</span>}
                    </label>
                    <textarea
                      value={docText}
                      onChange={(e) => setDocText(e.target.value)}
                      placeholder="# Course: Course Title&#10;Description: course summary description&#10;&#10;## Module 1: Module Title&#10;Description: module details&#10;&#10;### Lesson 1: Lesson Title&#10;Duration: 30 minutes&#10;Description: lesson text here...&#10;[Video] Overview: https://example.com/lesson-video.mp4"
                      rows={10}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      onClick={handleAnalyzeSyllabus}
                      disabled={parsing || !docText.trim()}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
                    >
                      {parsing ? (
                        <>
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                          <span>Parsing Syllabus Content...</span>
                        </>
                      ) : (
                        <>
                          <span>Parse & Begin Wizard</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 1 Guidelines Panel */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Info className="w-4 h-4 text-indigo-500" />
                    <span>Markup Conventions</span>
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Our NLP system splits text on formatting cues. For perfect structure, use standard markdown headings:
                  </p>
                  <div className="space-y-3 pt-1">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-mono leading-relaxed text-slate-700">
                      <p className="text-indigo-600 font-bold"># Course: Course Title</p>
                      <p className="pl-3">## Module: Section Header</p>
                      <p className="pl-6">### Lesson: Video Topic Name</p>
                      <p className="pl-9">[Video]: https://youtube.com/example</p>
                    </div>
                    <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-1 pl-1">
                      <li>Use <strong className="text-slate-700">[Quiz]</strong> headers to add diagnostic assessments.</li>
                      <li>Use <strong className="text-slate-700">[Assignment]</strong> to assign grading.</li>
                      <li>Media URLs are extracted to construct assets dynamically.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: ANALYZE DOCUMENT */}
          {step === 2 && parsedPreview && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Analytics Summary Badges */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: 'Modules Found', val: analytics.modules.length, sub: 'High-level sections', color: 'border-indigo-200 bg-indigo-50 text-indigo-700' },
                  { label: 'Lessons Parsed', val: analytics.lessonsCount, sub: 'Video & reading units', color: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
                  { label: 'Media Links', val: analytics.media.length, sub: 'Extracted resource links', color: 'border-amber-200 bg-amber-50 text-amber-700' },
                  { label: 'Placeholder Links', val: analytics.brokenLinks.length, sub: 'Needs replacement', color: analytics.brokenLinks.length > 0 ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-slate-50 text-slate-400' },
                  { label: 'Duplicates Highlight', val: analytics.duplicates.length, sub: 'Conflict warnings', color: analytics.duplicates.length > 0 ? 'border-amber-200 bg-amber-50 text-amber-600' : 'border-slate-200 bg-slate-50 text-slate-400' }
                ].map((stat, i) => (
                  <div key={i} className={`p-4 rounded-2xl border ${stat.color} shadow-xs`}>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-85">{stat.label}</p>
                    <p className="text-2xl font-black mt-1">{stat.val}</p>
                    <p className="text-[10px] opacity-75 mt-0.5">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Analytical Breakdown Tabs/Details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Warnings, Blocker Errors, Duplicates & Broken Links Analysis */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {/* Validation Alerts Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
                      <AlertCircle className="w-4 h-4 text-slate-500" />
                      <span>Curriculum Validation Log</span>
                    </h3>
                    
                    {parsedPreview.validationErrors.length === 0 ? (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs flex items-center space-x-2">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                        <span>Markup analysis successful! Zero validation alerts.</span>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {parsedPreview.validationErrors.map((err, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
                              err.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-amber-50 border-amber-100 text-amber-800'
                            }`}
                          >
                            {err.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />}
                            <div>
                              <strong className="font-bold">[{err.path}]:</strong> {err.message}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Duplicate Detection Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
                      <Sliders className="w-4 h-4 text-slate-500" />
                      <span>Duplicate Titles & Question Checks</span>
                    </h3>
                    
                    {analytics.duplicates.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No duplicate titles or overlapping questions found.</p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {analytics.duplicates.map((dup, i) => (
                          <div key={i} className="p-3 bg-amber-50/55 border border-amber-100 rounded-xl text-xs flex items-start space-x-2 text-amber-800">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                            <div>
                              <p className="font-bold">{dup.type}: "{dup.name}"</p>
                              <p className="text-[10px] text-amber-600 mt-0.5">{dup.info}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Media Links and Broken Links Analysis */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {/* Broken Links Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
                      <ExternalLink className="w-4 h-4 text-rose-500" />
                      <span>Placeholder & Empty URL Checks</span>
                    </h3>
                    
                    {analytics.brokenLinks.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">All parsed media URLs have valid syntax.</p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {analytics.brokenLinks.map((link, i) => (
                          <div key={i} className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs flex items-start space-x-2 text-rose-800">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold truncate">{link.lesson} &gt; {link.resource}</p>
                              <p className="font-mono text-[9px] text-rose-500 truncate mt-0.5">{link.url}</p>
                              <p className="text-[10px] text-rose-700 font-semibold mt-1">Issue: {link.reason}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Discovered Media Attachments Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
                      <PlayCircle className="w-4 h-4 text-indigo-500" />
                      <span>Extracted Media Attachments</span>
                    </h3>
                    
                    {analytics.media.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No media resource links found.</p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {analytics.media.map((med, i) => (
                          <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between gap-3">
                            <div className="flex items-center space-x-2 min-w-0">
                              {med.type === 'video' ? <PlayCircle className="w-4 h-4 text-red-500 shrink-0" /> : med.type === 'audio' ? <Music className="w-4 h-4 text-purple-500 shrink-0" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />}
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 truncate">{med.lesson}</p>
                                <p className="text-[10px] font-mono text-slate-500 truncate">{med.url}</p>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-[9px] font-extrabold uppercase text-indigo-700 shrink-0">
                              {med.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>

              {/* Bottom buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-700 flex items-center space-x-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Upload</span>
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-md transition-all flex items-center space-x-2"
                >
                  <span>Proceed to Preview</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PREVIEW */}
          {step === 3 && parsedPreview && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Course Intro Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold tracking-widest text-indigo-600 uppercase">Syllabus Metadata Preview</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{parsedPreview.title || 'Untitled Curriculum'}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{parsedPreview.shortDescription || parsedPreview.fullDescription || 'No description provided.'}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Duration Target: <strong className="text-slate-800">{parsedPreview.estimatedDuration || 'Unspecified'}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span>Sub-Structure: <strong className="text-slate-800">{parsedPreview.modules.length} Modules</strong></span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>Objectives Listed: <strong className="text-slate-800">{parsedPreview.learningObjectives.length}</strong></span>
                  </div>
                </div>
              </div>

              {/* Modules Accordion List */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">Traversable Lesson Tree</h4>
                
                {parsedPreview.modules.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No module sections parsed.</p>
                ) : (
                  parsedPreview.modules.map((mod, modIdx) => {
                    const isOpen = expandedPreviewModules[modIdx];
                    return (
                      <div key={modIdx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                        <button
                          onClick={() => togglePreviewModule(modIdx)}
                          className="w-full bg-slate-50 hover:bg-slate-100/50 transition-colors px-6 py-4 text-left font-bold text-xs text-slate-800 flex justify-between items-center border-b border-slate-100"
                        >
                          <span className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-indigo-600" />
                            <span>Module {modIdx + 1}: {mod.title || 'Untitled Module'}</span>
                          </span>
                          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>

                        {isOpen && (
                          <div className="p-6 space-y-4 divide-y divide-slate-100">
                            {mod.description && (
                              <p className="text-xs text-slate-500 italic pb-2 leading-relaxed">{mod.description}</p>
                            )}
                            
                            {(mod.lessons || []).length === 0 ? (
                              <p className="text-xs text-slate-400 italic pt-2">No parsed lessons in this section.</p>
                            ) : (
                              mod.lessons.map((les, lesIdx) => (
                                <div key={lesIdx} className="pt-4 first:pt-0 space-y-3">
                                  <div className="flex items-start justify-between">
                                    <h5 className="text-xs font-bold text-slate-900">
                                      Lesson {modIdx + 1}.{lesIdx + 1}: {les.title}
                                    </h5>
                                    {les.estimatedTime && <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-md">{les.estimatedTime}</span>}
                                  </div>
                                  
                                  {les.description && <p className="text-xs text-slate-600 leading-relaxed">{les.description}</p>}

                                  {/* Media links preview list */}
                                  {(les.videoUrl || les.audioUrl || les.pdfUrl || (les.downloads && les.downloads.length > 0)) && (
                                    <div className="flex flex-wrap gap-2 pt-1 text-[10px]">
                                      {les.videoUrl && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100 font-medium">
                                          <Play className="w-3 h-3 mr-1 shrink-0 text-red-500" /> Video Resource
                                        </span>
                                      )}
                                      {les.audioUrl && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 font-medium">
                                          <Music className="w-3 h-3 mr-1 shrink-0 text-purple-500" /> Audio Asset
                                        </span>
                                      )}
                                      {les.pdfUrl && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                                          <FileText className="w-3 h-3 mr-1 shrink-0 text-emerald-500" /> Reference PDF
                                        </span>
                                      )}
                                      {(les.downloads || []).map((dl, dIdx) => (
                                        <span key={dIdx} className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
                                          <FileSpreadsheet className="w-3 h-3 mr-1 shrink-0 text-indigo-500" /> [Dl] {dl.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Quiz details list */}
                                  {(les.quizzes || []).map((quiz, qIdx) => (
                                    <div key={qIdx} className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3.5 mt-2 text-xs text-indigo-900">
                                      <p className="font-bold flex items-center gap-1.5 text-indigo-950">
                                        <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                                        <span>Quiz: {quiz.title} ({quiz.passingScore}% Pass Target)</span>
                                      </p>
                                      <p className="text-[10px] text-indigo-700 mt-1">{quiz.questions.length} Diagnostic check questions parsed.</p>
                                    </div>
                                  ))}

                                  {/* Assignment details list */}
                                  {(les.assignments || []).map((as, aIdx) => (
                                    <div key={aIdx} className="bg-amber-50/40 border border-amber-100 rounded-xl p-3.5 mt-2 text-xs text-amber-900">
                                      <p className="font-bold flex items-center gap-1.5 text-amber-950">
                                        <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                                        <span>Graded Assignment: {as.title} ({as.maxPoints} pts)</span>
                                      </p>
                                      {as.description && <p className="text-[10px] text-amber-700 mt-1">{as.description}</p>}
                                    </div>
                                  ))}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-700 flex items-center space-x-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Analytics</span>
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-md transition-all flex items-center space-x-2"
                >
                  <span>Proceed to Fine-Tune</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: FINE-TUNE EDIT DETAILS */}
          {step === 4 && parsedPreview && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              
              {/* Explorer Sidebar Tree Panel */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center space-x-1.5">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    <span>Curriculum Explorer</span>
                  </h4>
                  <button
                    onClick={addModule}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Module</span>
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  {/* Course Node link */}
                  <button
                    onClick={() => setEditPath({ type: 'course' })}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center space-x-2 transition-colors ${
                      editPath.type === 'course' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark className="w-4 h-4 shrink-0" />
                    <span className="truncate">Course Metadata</span>
                  </button>

                  {/* Modules explorer bullet list */}
                  <div className="space-y-2 mt-2 pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-3">Sections / Modules</p>
                    
                    {parsedPreview.modules.map((mod, mIdx) => {
                      const isModActive = editPath.type === 'module' && editPath.moduleIdx === mIdx;
                      return (
                        <div key={mIdx} className="space-y-1 pl-1">
                          <div className={`group flex items-center justify-between px-2 py-1.5 rounded-xl transition-colors ${
                            isModActive ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                          }`}>
                            <button
                              onClick={() => setEditPath({ type: 'module', moduleIdx: mIdx })}
                              className="text-left flex-1 min-w-0 truncate pr-2"
                            >
                              {mIdx + 1}. {mod.title || 'Untitled Module'}
                            </button>
                            <button
                              onClick={() => deleteModule(mIdx)}
                              className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 p-1"
                              title="Delete module"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Lessons Explorer bullet list under modules */}
                          <div className="pl-4 space-y-1">
                            {(mod.lessons || []).map((les, lesIdx) => {
                              const isLesActive = editPath.type === 'lesson' && editPath.moduleIdx === mIdx && editPath.lesIdx === lesIdx;
                              return (
                                <div key={lesIdx} className="group flex items-center justify-between px-2 py-1 rounded-lg">
                                  <button
                                    onClick={() => setEditPath({ type: 'lesson', moduleIdx: mIdx, lesIdx })}
                                    className={`text-left text-[11px] flex-1 min-w-0 truncate ${
                                      isLesActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                  >
                                    {mIdx + 1}.{lesIdx + 1} {les.title}
                                  </button>
                                  <button
                                    onClick={() => deleteLesson(mIdx, lesIdx)}
                                    className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 p-0.5"
                                    title="Delete lesson"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                            <button
                              onClick={() => addLesson(mIdx)}
                              className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 px-2 py-1 flex items-center space-x-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Lesson</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Context Sensitive Editor Panel */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
                
                {/* 1. COURSE METADATA EDITOR */}
                {editPath.type === 'course' && (
                  <div className="space-y-5">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex justify-between items-center">
                      <span>Course Metadata Settings</span>
                      <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Active Selected Node</span>
                    </h3>

                    <div className="space-y-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-700">Course Title</label>
                        <input
                          type="text"
                          value={parsedPreview.title}
                          onChange={(e) => updateCourseField('title', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-850 focus:bg-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-700">Short Description</label>
                        <textarea
                          rows={2}
                          value={parsedPreview.shortDescription}
                          onChange={(e) => updateCourseField('shortDescription', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-700">Full Description</label>
                        <textarea
                          rows={4}
                          value={parsedPreview.fullDescription}
                          onChange={(e) => updateCourseField('fullDescription', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block font-bold text-slate-700">Estimated Duration</label>
                          <input
                            type="text"
                            value={parsedPreview.estimatedDuration}
                            onChange={(e) => updateCourseField('estimatedDuration', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. MODULE EDITOR */}
                {editPath.type === 'module' && (
                  <div className="space-y-5">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex justify-between items-center">
                      <span>Edit Section Module: {editPath.moduleIdx + 1}</span>
                      <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Active Selected Node</span>
                    </h3>

                    <div className="space-y-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-700">Module Title</label>
                        <input
                          type="text"
                          value={parsedPreview.modules[editPath.moduleIdx]?.title || ''}
                          onChange={(e) => updateModuleField(editPath.moduleIdx, 'title', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold focus:bg-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-700">Module Description Brief</label>
                        <textarea
                          rows={4}
                          value={parsedPreview.modules[editPath.moduleIdx]?.description || ''}
                          onChange={(e) => updateModuleField(editPath.moduleIdx, 'description', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. LESSON EDITOR & RESOURCE MANAGEMENT */}
                {editPath.type === 'lesson' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex justify-between items-center">
                      <span>Edit Lesson Node: {editPath.moduleIdx + 1}.{editPath.lesIdx + 1}</span>
                      <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Active Selected Node</span>
                    </h3>

                    {(() => {
                      const lesson = parsedPreview.modules[editPath.moduleIdx]?.lessons[editPath.lesIdx];
                      if (!lesson) return <p className="text-xs text-slate-400 italic">No lesson active.</p>;

                      return (
                        <div className="space-y-5 text-xs">
                          {/* Core Lesson Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5 md:col-span-2">
                              <label className="block font-bold text-slate-700">Lesson Title</label>
                              <input
                                type="text"
                                value={lesson.title || ''}
                                onChange={(e) => updateLessonField(editPath.moduleIdx, editPath.lesIdx, 'title', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block font-bold text-slate-700">Estimated Duration</label>
                              <input
                                type="text"
                                value={lesson.estimatedTime || ''}
                                onChange={(e) => updateLessonField(editPath.moduleIdx, editPath.lesIdx, 'estimatedTime', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block font-bold text-slate-700">Lesson Body Content Brief</label>
                            <textarea
                              rows={3}
                              value={lesson.description || ''}
                              onChange={(e) => updateLessonField(editPath.moduleIdx, editPath.lesIdx, 'description', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-indigo-500 focus:outline-none"
                            />
                          </div>

                          {/* Media URL Proxy overrides */}
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                            <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">Associated Media Resource URLs</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="block text-[10px] text-slate-500 font-bold">Video Link URL</label>
                                <input
                                  type="text"
                                  placeholder="https://..."
                                  value={lesson.videoUrl || ''}
                                  onChange={(e) => updateLessonField(editPath.moduleIdx, editPath.lesIdx, 'videoUrl', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-[10px] focus:border-indigo-500 focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-[10px] text-slate-500 font-bold">Audio Link URL</label>
                                <input
                                  type="text"
                                  placeholder="https://..."
                                  value={lesson.audioUrl || ''}
                                  onChange={(e) => updateLessonField(editPath.moduleIdx, editPath.lesIdx, 'audioUrl', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-[10px] focus:border-indigo-500 focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-[10px] text-slate-500 font-bold">Reference PDF URL</label>
                                <input
                                  type="text"
                                  placeholder="https://..."
                                  value={lesson.pdfUrl || ''}
                                  onChange={(e) => updateLessonField(editPath.moduleIdx, editPath.lesIdx, 'pdfUrl', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-[10px] focus:border-indigo-500 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Nested Quizzes Editor list */}
                          <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <p className="font-bold text-indigo-950 text-[11px] uppercase tracking-wider">Assessment Exams ({lesson.quizzes?.length || 0})</p>
                              <button
                                onClick={() => {
                                  const quizzes = lesson.quizzes || [];
                                  const newQuiz = { title: 'Chapter Assessment', passingScore: 80, questions: [] };
                                  updateLessonField(editPath.moduleIdx, editPath.lesIdx, 'quizzes', [...quizzes, newQuiz]);
                                }}
                                className="text-[10px] font-bold text-indigo-600 flex items-center space-x-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Quiz</span>
                              </button>
                            </div>

                            {(lesson.quizzes || []).map((quiz, qIdx) => (
                              <div key={qIdx} className="bg-white border border-indigo-100 rounded-xl p-3.5 space-y-3 shadow-xs">
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] text-slate-500 font-bold">Quiz Title</label>
                                    <input
                                      type="text"
                                      value={quiz.title || ''}
                                      onChange={(e) => {
                                        const quizzes = [...lesson.quizzes];
                                        quizzes[qIdx].title = e.target.value;
                                        updateLessonField(editPath.moduleIdx, editPath.lesIdx, 'quizzes', quizzes);
                                      }}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 font-bold">Pass (%)</label>
                                    <input
                                      type="number"
                                      value={quiz.passingScore || 80}
                                      onChange={(e) => {
                                        const quizzes = [...lesson.quizzes];
                                        quizzes[qIdx].passingScore = parseInt(e.target.value, 10) || 80;
                                        updateLessonField(editPath.moduleIdx, editPath.lesIdx, 'quizzes', quizzes);
                                      }}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                                    />
                                  </div>
                                </div>

                                {/* Questions sub list */}
                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                  <div className="flex justify-between items-center">
                                    <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">Questions ({quiz.questions?.length || 0})</label>
                                    <button
                                      onClick={() => {
                                        const quizzes = [...lesson.quizzes];
                                        const newQ = { questionText: 'New Question text?', questionType: 'multiple_choice' as const, options: ['Option A', 'Option B'], correctAnswer: 'Option A', explanation: '' };
                                        quizzes[qIdx].questions = [...(quizzes[qIdx].questions || []), newQ];
                                        updateLessonField(editPath.moduleIdx, editPath.lesIdx, 'quizzes', quizzes);
                                      }}
                                      className="text-[9px] font-bold text-indigo-600"
                                    >
                                      [+] Add Question
                                    </button>
                                  </div>

                                  {(quiz.questions || []).map((q, qnIdx) => (
                                    <div key={qnIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                                      <div className="flex justify-between items-start gap-2">
                                        <input
                                          type="text"
                                          placeholder="Question text"
                                          value={q.questionText}
                                          onChange={(e) => {
                                            const quizzes = [...lesson.quizzes];
                                            quizzes[qIdx].questions[qnIdx].questionText = e.target.value;
                                            updateLessonField(editPath.moduleIdx, editPath.lesIdx, 'quizzes', quizzes);
                                          }}
                                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                                        />
                                        <button
                                          onClick={() => {
                                            const quizzes = [...lesson.quizzes];
                                            quizzes[qIdx].questions = quizzes[qIdx].questions.filter((_, idx) => idx !== qnIdx);
                                            updateLessonField(editPath.moduleIdx, editPath.lesIdx, 'quizzes', quizzes);
                                          }}
                                          className="text-rose-500 hover:text-rose-700 p-0.5 mt-1"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                                        <input
                                          type="text"
                                          placeholder="Correct Answer match"
                                          value={q.correctAnswer}
                                          onChange={(e) => {
                                            const quizzes = [...lesson.quizzes];
                                            quizzes[qIdx].questions[qnIdx].correctAnswer = e.target.value;
                                            updateLessonField(editPath.moduleIdx, editPath.lesIdx, 'quizzes', quizzes);
                                          }}
                                          className="bg-white border border-slate-200 rounded px-2 py-1"
                                        />
                                        <input
                                          type="text"
                                          placeholder="Explanation rationale"
                                          value={q.explanation}
                                          onChange={(e) => {
                                            const quizzes = [...lesson.quizzes];
                                            quizzes[qIdx].questions[qnIdx].explanation = e.target.value;
                                            updateLessonField(editPath.moduleIdx, editPath.lesIdx, 'quizzes', quizzes);
                                          }}
                                          className="bg-white border border-slate-200 rounded px-2 py-1"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                        </div>
                      );
                    })()}
                  </div>
                )}

              </div>

              {/* Step Navigation buttons */}
              <div className="lg:col-span-12 flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-700 flex items-center space-x-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Preview</span>
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-md transition-all flex items-center space-x-2"
                >
                  <span>Proceed to Generate</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: GENERATE COURSE */}
          {step === 5 && parsedPreview && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <Sliders className="w-8 h-8" />
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Compile & Structure Assets</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                    Ready to build the relational catalog entries? Nothing is written to the course database tables until you select generate.
                  </p>
                </div>

                {/* Summarized structure count tags */}
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap justify-center gap-4 text-xs font-semibold text-slate-700 max-w-lg mx-auto">
                  <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl flex items-center space-x-1">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <span>{parsedPreview.title || 'Untitled'}</span>
                  </span>
                  <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl">
                    <strong>{analytics.modules.length}</strong> Modules
                  </span>
                  <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl">
                    <strong>{analytics.lessonsCount}</strong> Lessons
                  </span>
                  <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl">
                    <strong>{analytics.media.length}</strong> Resources
                  </span>
                </div>

                <div className="pt-4 flex justify-center space-x-3">
                  <button
                    onClick={() => setStep(4)}
                    disabled={generating}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-700 flex items-center space-x-2 transition-colors disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Fine-Tune</span>
                  </button>
                  <button
                    onClick={handleGenerateCourse}
                    disabled={generating}
                    className="px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4.5 h-4.5 animate-spin" />
                        <span>Generating Database Records...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4.5 h-4.5" />
                        <span>Generate Course Database</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 6: PUBLISH & LAUNCH */}
          {step === 6 && generatedCourse && (
            <motion.div
              key="step-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Curriculum Generated Successfully!</h3>
                  <p className="text-xs text-slate-500 mt-1">Course metadata, lessons, quizzes, and attachments are now recorded.</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs max-w-md mx-auto space-y-2">
                  <p><span className="font-semibold text-slate-500">Import Author:</span> <strong className="text-slate-800">{importedBy}</strong></p>
                  <p><span className="font-semibold text-slate-500">Course Identifier:</span> <strong className="text-slate-800 font-mono text-[11px]">{generatedCourse.id}</strong></p>
                  <p><span className="font-semibold text-slate-500">Initial State:</span> <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-100 font-semibold text-blue-700 text-[10px]">Imported</span></p>
                </div>

                {publishMessage && (
                  <div className={`p-4 rounded-xl text-left border text-xs max-w-md mx-auto flex items-start space-x-2 ${
                    publishMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    {publishMessage.type === 'success' ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />}
                    <span>{publishMessage.text}</span>
                  </div>
                )}

                <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-3">
                  <button
                    onClick={handleLivePublish}
                    disabled={publishing}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
                  >
                    {publishing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Synchronizing Catalog...</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 text-slate-500" />
                        <span>Publish to Live Catalog</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onCourseSelected(generatedCourse);
                      setCurrentView('editor');
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Open in Course Editor</span>
                  </button>

                  <button
                    onClick={handleStartFresh}
                    className="w-full sm:w-auto px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-medium"
                  >
                    Import Another
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Audit log Table at the bottom */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-150">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <History className="w-4 h-4 text-slate-500" />
            <span>Curriculum Package Import Logs</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Audit historical curriculum uploads and trace package resolution statuses.</p>
        </div>

        {loadingHistory ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
            <span>Loading import manifest trace...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <span>No import traces recorded in database yet.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Source File</th>
                  <th className="py-3 px-6">Author</th>
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {history.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-slate-900 flex items-center space-x-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.sourceFileName}</span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">{log.importedBy}</td>
                    <td className="py-3.5 px-6 text-slate-500">
                      {new Date(log.importedAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6">
                      {log.status === 'Success' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Success
                        </span>
                      ) : log.status === 'Pending' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                          Pending
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-100 cursor-help"
                          title={log.errorMessage}
                        >
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono text-[10px] text-slate-400">
                      {log.importedCourseId ? (
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/courses`);
                              const courses = await res.json();
                              const matched = courses.find((c: any) => c.id === log.importedCourseId);
                              if (matched) {
                                onCourseSelected(matched);
                                setCurrentView('editor');
                              } else {
                                alert('Course no longer exists.');
                              }
                            } catch {
                              alert('Error retrieving imported course details.');
                            }
                          }}
                          className="text-indigo-600 hover:underline font-semibold flex items-center justify-end space-x-0.5 ml-auto"
                        >
                          <span>Open</span>
                          <Play className="w-2.5 h-2.5" />
                        </button>
                      ) : (
                        <span>N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  BookOpen,
  Clock,
  Play,
  Award,
  CheckCircle2,
  FileText,
  Download,
  Check,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Send,
  FileCode,
  ChevronRight,
  Printer,
  X,
  Compass,
  CheckSquare,
  HelpCircle,
  Volume2
} from 'lucide-react';
import { Course, Module, Lesson, Quiz } from '../types';
import { ContentBlock, Assignment, Download as DownloadType } from '../types/course-builder-v2';

interface StudentPortalProps {
  courseSlug: string;
}

export function StudentPortal({ courseSlug }: StudentPortalProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonsMap, setLessonsMap] = useState<{ [moduleId: string]: Lesson[] }>({});
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState<number>(0);
  
  // Custom public-only sub-collections
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [downloads, setDownloads] = useState<any[]>([]);
  
  // States
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allPublishedCourses, setAllPublishedCourses] = useState<Course[]>([]);
  
  // Quiz states
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  
  // Assignment states
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<{ [assignId: string]: { text: string; fileSubmitted: boolean; submittedAt: string } }>({});
  const [currentAssignmentText, setCurrentAssignmentText] = useState<string>('');
  
  // Progress states (persisted via LocalStorage)
  const [completedLessons, setCompletedLessons] = useState<{ [lesId: string]: boolean }>({});
  
  // Certificate states
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>('Alex Mercer');
  const [certDate, setCertDate] = useState<string>(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));

  // Scroll to active lesson ref
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Fetch all published courses to recommend or fallback
  const fetchAllPublished = async () => {
    try {
      const res = await fetch('/api/public/courses');
      if (res.ok) {
        const data = await res.json();
        setAllPublishedCourses(data || []);
      }
    } catch (e) {
      console.error('Error fetching catalog', e);
    }
  };

  useEffect(() => {
    fetchAllPublished();
  }, []);

  // Main load course routine
  useEffect(() => {
    if (!courseSlug) return;
    
    const loadCourseData = async () => {
      setLoading(true);
      setError(null);
      try {
        const courseRes = await fetch(`/api/public/courses/by-slug/${courseSlug}`);
        if (!courseRes.ok) {
          throw new Error('Course not found or is currently not published.');
        }
        const courseData = await courseRes.json();
        setCourse(courseData);

        // Load progress from localStorage
        const storedProgress = localStorage.getItem(`v79_student_progress_${courseData.id}`);
        if (storedProgress) {
          try {
            setCompletedLessons(JSON.parse(storedProgress));
          } catch {
            // ignore corrupt parsing
          }
        }

        // Load assignment submissions
        const storedSubmissions = localStorage.getItem(`v79_student_submissions_${courseData.id}`);
        if (storedSubmissions) {
          try {
            setAssignmentSubmissions(JSON.parse(storedSubmissions));
          } catch {
            // ignore
          }
        }

        // Fetch Modules
        const modulesRes = await fetch(`/api/public/courses/${courseData.id}/modules`);
        const modulesData = await modulesRes.json();
        setModules(modulesData);

        // Fetch Lessons for all modules
        const lMap: { [id: string]: Lesson[] } = {};
        let firstLesson: Lesson | null = null;
        for (const m of modulesData) {
          const lessonsRes = await fetch(`/api/public/modules/${m.id}/lessons`);
          const lessonsData = await lessonsRes.json();
          lMap[m.id] = lessonsData;
          if (!firstLesson && lessonsData.length > 0) {
            firstLesson = lessonsData[0];
          }
        }
        setLessonsMap(lMap);

        if (firstLesson) {
          setCurrentLesson(firstLesson);
        }

        // Fetch course-wide assignments & downloads
        const assignRes = await fetch(`/api/public/courses/${courseData.id}/assignments`);
        if (assignRes.ok) {
          const assignData = await assignRes.json();
          setAssignments(assignData || []);
        }

        const dlRes = await fetch(`/api/public/courses/${courseData.id}/downloads`);
        if (dlRes.ok) {
          const dlData = await dlRes.json();
          setDownloads(dlData || []);
        }

      } catch (err: any) {
        setError(err.message || 'An error occurred loading the course portal.');
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [courseSlug]);

  // Handle active lesson context switching (fetching quiz & blocks)
  useEffect(() => {
    if (!currentLesson) return;

    // Scroll back to top of center main screen
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }

    // Reset temporary states
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setCurrentAssignmentText('');

    const fetchLessonSubCollections = async () => {
      try {
        // Fetch Content Blocks
        const blockRes = await fetch(`/api/public/lessons/${currentLesson.id}/content-blocks`);
        if (blockRes.ok) {
          const blockData = await blockRes.ok ? await blockRes.json() : [];
          setContentBlocks(blockData || []);
        }

        // Fetch Quiz
        const quizRes = await fetch(`/api/public/lessons/${currentLesson.id}/quiz`);
        if (quizRes.ok) {
          const quizData = await quizRes.json();
          setActiveQuiz(quizData);
        } else {
          setActiveQuiz(null);
        }
      } catch (e) {
        console.error('Error fetching lesson components', e);
      }
    };

    fetchLessonSubCollections();
  }, [currentLesson]);

  // Persist completion status when updated
  const toggleLessonCompletion = (lessonId: string) => {
    if (!course) return;
    const nextCompleted = { ...completedLessons, [lessonId]: !completedLessons[lessonId] };
    setCompletedLessons(nextCompleted);
    localStorage.setItem(`v79_student_progress_${course.id}`, JSON.stringify(nextCompleted));
  };

  // Check if a specific lesson is completed
  const isLessonCompleted = (lessonId: string) => {
    return !!completedLessons[lessonId];
  };

  // Calculate stats
  let totalLessons = 0;
  Object.values(lessonsMap).forEach((list: any) => {
    if (list && Array.isArray(list)) {
      totalLessons += list.length;
    }
  });
  const completedCount = Object.keys(completedLessons).filter(id => completedLessons[id]).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Handle Quiz Submissions
  const handleQuizSubmit = () => {
    if (!activeQuiz) return;
    let correct = 0;
    activeQuiz.questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const score = Math.round((correct / activeQuiz.questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    if (score >= activeQuiz.passingScore && currentLesson) {
      // Mark lesson as complete upon passing the quiz
      const nextCompleted = { ...completedLessons, [currentLesson.id]: true };
      setCompletedLessons(nextCompleted);
      localStorage.setItem(`v79_student_progress_${course!.id}`, JSON.stringify(nextCompleted));
    }
  };

  // Handle Assignment Submissions
  const handleAssignmentSubmit = (assignId: string) => {
    if (!course || !currentLesson) return;
    
    const newSubmission = {
      text: currentAssignmentText,
      fileSubmitted: true,
      submittedAt: new Date().toLocaleDateString()
    };

    const nextSubmissions = {
      ...assignmentSubmissions,
      [assignId]: newSubmission
    };

    setAssignmentSubmissions(nextSubmissions);
    localStorage.setItem(`v79_student_submissions_${course.id}`, JSON.stringify(nextSubmissions));
    
    // Auto-mark lesson complete upon submitting assignments
    const nextCompleted = { ...completedLessons, [currentLesson.id]: true };
    setCompletedLessons(nextCompleted);
    localStorage.setItem(`v79_student_progress_${course.id}`, JSON.stringify(nextCompleted));

    setCurrentAssignmentText('');
  };

  // Custom Markdown renderer for visual elegance
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
      <div className="space-y-4 text-slate-700 leading-relaxed text-sm font-normal">
        {lines.map((line, idx) => {
          // Headers
          if (line.startsWith('### ')) {
            return <h4 key={idx} className="text-sm font-bold text-slate-900 mt-5 mb-2 flex items-center gap-1.5">{line.replace('### ', '')}</h4>;
          }
          if (line.startsWith('## ')) {
            return <h3 key={idx} className="text-base font-bold text-slate-900 mt-6 mb-3 border-b border-slate-100 pb-1.5">{line.replace('## ', '')}</h3>;
          }
          if (line.startsWith('# ')) {
            return <h2 key={idx} className="text-lg font-bold text-indigo-950 mt-8 mb-4">{line.replace('# ', '')}</h2>;
          }
          // Blockquote
          if (line.startsWith('> ')) {
            return (
              <blockquote key={idx} className="border-l-4 border-indigo-500 bg-indigo-50/50 p-4 rounded-r-xl italic text-indigo-900 my-4 text-xs font-medium">
                {line.replace('> ', '')}
              </blockquote>
            );
          }
          // Bullets
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <ul key={idx} className="list-disc pl-5 space-y-1.5 my-2 text-slate-600">
                <li>{line.substring(2)}</li>
              </ul>
            );
          }
          if (/^\d+\.\s/.test(line)) {
            return (
              <ol key={idx} className="list-decimal pl-5 space-y-1.5 my-2 text-slate-600">
                <li>{line.replace(/^\d+\.\s/, '')}</li>
              </ol>
            );
          }
          // Blank line
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }
          // Default paragraph
          return <p key={idx} className="mb-2.5 text-slate-600">{line}</p>;
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold text-slate-700">Entering your V79 Academy Classroom...</p>
        <p className="text-xs text-slate-400 mt-1">Preparing modules, lectures, and resources.</p>
      </div>
    );
  }

  // Course not found or not published state
  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl p-10 space-y-6 text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Classroom Unavailable</h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              The course URL you entered is either incorrect, or this academy course has not been marked as **Published** yet.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-left space-y-3">
            <h3 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-600" />
              Published Courses Directory
            </h3>
            {allPublishedCourses.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allPublishedCourses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => window.location.pathname = `/course/${c.id}`}
                    className="w-full text-left p-3 bg-white hover:bg-indigo-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{c.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{c.category} • {c.instructor}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-indigo-600 shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-indigo-700/80 leading-relaxed">
                No courses are currently published. Go to the course builder settings as an administrator and set a course internal status to **Published** to preview it here instantly.
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => window.location.pathname = '/'}
              className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
            >
              Back to Builder Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Find currently active lesson's module name
  const currentModule = modules.find(m => m.id === currentLesson?.moduleId);

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans antialiased overflow-hidden h-screen">
      
      {/* 1. Left Navigation Sidebar (Classroom Index) */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 h-full overflow-hidden">
        
        {/* Course Core Header */}
        <div className="p-6 border-b border-slate-100 space-y-4 shrink-0 bg-slate-50/50">
          <div>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
              {course.category}
            </span>
            <h1 className="text-sm font-bold text-slate-900 mt-2 line-clamp-2 leading-snug">{course.title}</h1>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Instructor: {course.instructor}</p>
          </div>

          {/* Progress Tracker */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span>Overall Course Completion</span>
              <span className="font-bold text-indigo-700">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>{completedCount} of {totalLessons} completed</span>
              {progressPercent === 100 && (
                <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                  Ready for Certificate! 🎓
                </span>
              )}
            </div>
          </div>

          {/* Certificate Badge Callout */}
          {progressPercent === 100 ? (
            <button
              onClick={() => setShowCertificate(true)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 animate-bounce"
            >
              <Award className="w-4 h-4" />
              Claim Your Certificate
            </button>
          ) : (
            <button
              onClick={() => {
                // Pre-fill student name, show what certificate looks like
                setShowCertificate(true);
              }}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all flex items-center justify-center gap-1.5"
            >
              <Award className="w-4 h-4 text-slate-400" />
              Preview Certificate
            </button>
          )}
        </div>

        {/* Modules & Lessons Curriculum Accordion/List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {modules.map((mod, modIdx) => {
            const moduleLessons = lessonsMap[mod.id] || [];
            return (
              <div key={mod.id} className="space-y-2">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[10px] font-bold text-indigo-900/80 uppercase tracking-wider block">
                    MODULE {modIdx + 1}
                  </span>
                  <h3 className="font-bold text-xs text-slate-800 mt-0.5 truncate" title={mod.title}>
                    {mod.title}
                  </h3>
                </div>

                <div className="space-y-1 pl-1.5 border-l-2 border-slate-100">
                  {moduleLessons.map((les, lesIdx) => {
                    const isActive = currentLesson?.id === les.id;
                    const isComplete = isLessonCompleted(les.id);
                    return (
                      <button
                        key={les.id}
                        onClick={() => {
                          setCurrentLesson(les);
                          setCurrentModuleIndex(modIdx);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs font-medium flex items-center justify-between transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          {isComplete ? (
                            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                          ) : (
                            <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          )}
                          <span className="truncate">{lesIdx + 1}. {les.title}</span>
                        </div>
                        <span className={`text-[9px] opacity-80 shrink-0 ml-1.5 ${isActive ? 'text-white/90' : 'text-slate-400'}`}>
                          {les.estimatedTime}
                        </span>
                      </button>
                    );
                  })}
                  {moduleLessons.length === 0 && (
                    <p className="text-[10px] text-slate-400 italic pl-3">No lessons yet.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800">Student Portal</span>
          </div>
          <button
            onClick={() => window.location.pathname = '/'}
            className="text-[10px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors bg-white px-2 py-1 rounded border border-slate-200"
          >
            Builder Login
          </button>
        </div>
      </aside>

      {/* 2. Main Content Center Screen (Classroom Player) */}
      <div 
        ref={mainContentRef}
        className="flex-1 overflow-y-auto flex flex-col h-full bg-slate-50"
      >
        
        {/* Dynamic Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">
              {currentModule ? `Module ${currentModuleIndex + 1}: ${currentModule.title}` : 'Overview'}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span className="text-xs font-bold text-slate-800 truncate max-w-sm">
              {currentLesson ? currentLesson.title : 'Overview'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {currentLesson && (
              <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl cursor-pointer transition-all text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={isLessonCompleted(currentLesson.id)}
                  onChange={() => toggleLessonCompletion(currentLesson.id)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className={isLessonCompleted(currentLesson.id) ? 'text-emerald-700' : 'text-slate-600'}>
                  {isLessonCompleted(currentLesson.id) ? 'Lesson Completed ✓' : 'Mark Lesson Complete'}
                </span>
              </label>
            )}
          </div>
        </header>

        {/* Lesson View Panel */}
        {currentLesson ? (
          <div className="p-8 max-w-3xl mx-auto w-full space-y-8 flex-1">
            
            {/* 1. Core Lecture Metadata */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
                <Clock className="w-3.5 h-3.5" />
                <span>Estimated Lecture Time: {currentLesson.estimatedTime}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{currentLesson.title}</h1>
              {currentLesson.description && (
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {currentLesson.description}
                </p>
              )}
            </div>

            {/* 2. Audio/Video Block */}
            {(currentLesson.videoUrl || currentLesson.audioUrl) && (
              <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                {currentLesson.videoUrl && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                      <Play className="w-3 h-3 text-indigo-600 fill-indigo-600" />
                      Classroom Video Lecture
                    </p>
                    <div className="rounded-xl overflow-hidden bg-black aspect-video border border-slate-900 relative">
                      <video
                        src={currentLesson.videoUrl}
                        controls
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}

                {currentLesson.audioUrl && (
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                      Podcast Audio Companion
                    </p>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <audio
                        src={currentLesson.audioUrl}
                        controls
                        className="w-full"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. Lesson Core content */}
            {currentLesson.lessonContent && (
              <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-2xs">
                {renderMarkdown(currentLesson.lessonContent)}
              </div>
            )}

            {/* 4. Lesson Content Blocks (Visual Blocks) */}
            {contentBlocks.length > 0 && (
              <div className="space-y-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Extended Learning Blocks ({contentBlocks.length})
                </h3>
                {contentBlocks.map((block) => {
                  const data = block.contentData || {};
                  return (
                    <div key={block.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xs space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-bold text-indigo-900/80 uppercase pb-2 border-b border-slate-100">
                        <span>{block.type} BLOCK</span>
                        <span>v1.0</span>
                      </div>
                      
                      {block.type === 'Markdown' && data.markdown && renderMarkdown(data.markdown)}
                      
                      {block.type === 'Rich Text' && data.html && (
                        <div className="text-sm text-slate-700 leading-relaxed font-normal" dangerouslySetInnerHTML={{ __html: data.html }} />
                      )}

                      {block.type === 'Video' && data.videoUrl && (
                        <div className="space-y-1.5">
                          <p className="font-bold text-xs text-slate-800">{data.title || 'Instructional Video'}</p>
                          <div className="rounded-xl overflow-hidden bg-black border border-slate-800 aspect-video">
                            <video src={data.videoUrl} controls className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                        </div>
                      )}

                      {block.type === 'Audio' && data.audioUrl && (
                        <div className="space-y-1.5">
                          <p className="font-bold text-xs text-slate-800">{data.title || 'Audio Narrative'}</p>
                          <audio src={data.audioUrl} controls className="w-full" referrerPolicy="no-referrer" />
                        </div>
                      )}

                      {block.type === 'Image' && data.imageUrl && (
                        <div className="space-y-2 text-center">
                          <img 
                            src={data.imageUrl} 
                            alt={data.altText || 'Lecture graphic'} 
                            className="rounded-xl border border-slate-200 max-h-96 mx-auto object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {data.caption && <p className="text-xs text-slate-400 italic">{data.caption}</p>}
                        </div>
                      )}

                      {block.type === 'Code' && data.code && (
                        <div className="space-y-1.5 text-left">
                          <p className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-semibold uppercase inline-block">
                            {data.language || 'typescript'}
                          </p>
                          <pre className="bg-slate-950 text-indigo-200 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                            <code>{data.code}</code>
                          </pre>
                        </div>
                      )}

                      {block.type === 'Callout' && data.text && (
                        <div className={`p-4 rounded-xl border text-xs font-semibold flex items-start gap-2.5 ${
                          data.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                          data.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                          data.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                          'bg-indigo-50 border-indigo-200 text-indigo-800'
                        }`}>
                          <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600" />
                          <div>
                            {data.title && <p className="font-bold uppercase tracking-wider text-[10px] mb-0.5">{data.title}</p>}
                            <p className="font-medium">{data.text}</p>
                          </div>
                        </div>
                      )}

                      {block.type === 'Checklist' && Array.isArray(data.items) && (
                        <div className="space-y-2">
                          <p className="font-bold text-xs text-slate-800">Operational Checklist</p>
                          <div className="space-y-1.5 pl-1.5">
                            {data.items.map((it: any) => (
                              <div key={it.id} className="flex items-center gap-2.5 text-xs text-slate-600">
                                <CheckSquare className="w-4 h-4 text-indigo-600" />
                                <span>{it.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 5. Downloads / Assets */}
            {((currentLesson.downloads && currentLesson.downloads.length > 0) || (downloads.filter(d => d.lessonId === currentLesson.id).length > 0)) && (
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-2xs">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Download className="w-4 h-4 text-indigo-600" />
                  <span>Lesson Resources & Templates</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Render inline course downloads */}
                  {currentLesson.downloads?.map((dl, idx) => (
                    <a
                      key={`inline-${idx}`}
                      href={dl.url}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-white flex items-center justify-between transition-all group"
                    >
                      <div className="truncate">
                        <p className="font-semibold text-xs text-slate-800 group-hover:text-indigo-900 truncate">{dl.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{dl.size || '1.0 MB'} • {dl.type || 'PDF'}</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Download className="w-4 h-4" />
                      </div>
                    </a>
                  ))}

                  {/* Render linked course-wide downloads specifically for this lesson */}
                  {downloads.filter(d => d.lessonId === currentLesson.id).map((dl) => (
                    <a
                      key={dl.id}
                      href={dl.url}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-white flex items-center justify-between transition-all group"
                    >
                      <div className="truncate">
                        <p className="font-semibold text-xs text-slate-800 group-hover:text-indigo-900 truncate">{dl.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{dl.fileSize || '1.0 MB'} • {dl.fileType || 'PDF'}</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Download className="w-4 h-4" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Quiz Assessments */}
            {activeQuiz && (
              <div className="bg-white border border-slate-200 p-8 rounded-2xl space-y-6 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                      LECTURE ASSESSMENT
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{activeQuiz.title}</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    Passing Threshold: {activeQuiz.passingScore}%
                  </span>
                </div>

                {quizSubmitted ? (
                  <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-4">
                    <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center font-bold text-lg ${
                      quizScore! >= activeQuiz.passingScore
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {quizScore}%
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">
                        {quizScore! >= activeQuiz.passingScore ? 'Assessment Passed! 🎉' : 'Assessment Not Passed'}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                        {quizScore! >= activeQuiz.passingScore
                          ? 'Outstanding! You have met the mastery threshold for this lecture. Progress saved.'
                          : `You scored ${quizScore}%. The required passing score is ${activeQuiz.passingScore}%. Retake the quiz once you've reviewed the material.`}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setQuizSubmitted(false);
                        setQuizAnswers({});
                        setQuizScore(null);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      Retake Assessment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeQuiz.questions.map((q, qIdx) => (
                      <div key={q.id} className="space-y-3 p-5 rounded-xl bg-slate-50/50 border border-slate-200">
                        <p className="font-bold text-xs text-slate-900">
                          Question {qIdx + 1}: {q.questionText}
                        </p>
                        <div className="space-y-2 pl-2">
                          {q.options.map((opt, oIdx) => (
                            <label
                              key={oIdx}
                              className={`flex items-center space-x-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                quizAnswers[q.id] === opt
                                  ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-semibold'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${q.id}`}
                                value={opt}
                                checked={quizAnswers[q.id] === opt}
                                onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt })}
                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleQuizSubmit}
                        disabled={activeQuiz.questions.some(q => !quizAnswers[q.id])}
                        className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-50"
                      >
                        Submit Assessment Answers
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. Assignments */}
            {assignments.filter(a => a.lessonId === currentLesson.id).map((assign) => {
              const submission = assignmentSubmissions[assign.id];
              return (
                <div key={assign.id} className="bg-white border border-slate-200 p-8 rounded-2xl space-y-5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                        PRACTICAL ASSIGNMENT
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{assign.title}</h3>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      Max Points: {assign.maxPoints} pts
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-2 leading-relaxed">
                    <p className="font-bold text-slate-800">Prompt & Instructions:</p>
                    <p>{assign.description}</p>
                  </div>

                  {submission ? (
                    <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                      <div className="flex items-center justify-between text-xs text-emerald-800">
                        <span className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Assignment Submitted Successfully!
                        </span>
                        <span className="text-[10px] font-medium opacity-80">Submitted {submission.submittedAt}</span>
                      </div>
                      
                      {submission.text && (
                        <div className="p-3 bg-white rounded-lg border border-emerald-100 text-xs text-slate-700 whitespace-pre-wrap font-mono">
                          {submission.text}
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-1">
                        <p className="text-[10px] text-emerald-800/80">
                          Status: <span className="font-bold">Passed</span> (Mastery Checked)
                        </p>
                        <button
                          onClick={() => {
                            const nextSubs = { ...assignmentSubmissions };
                            delete nextSubs[assign.id];
                            setAssignmentSubmissions(nextSubs);
                            localStorage.setItem(`v79_student_submissions_${course.id}`, JSON.stringify(nextSubs));
                          }}
                          className="text-[10px] font-bold text-rose-600 hover:text-rose-800 underline"
                        >
                          Delete and Resubmit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {assign.submissionType !== 'none' && (
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-700">
                            Your Text Response / Submission Notes
                          </label>
                          <textarea
                            value={currentAssignmentText}
                            onChange={(e) => setCurrentAssignmentText(e.target.value)}
                            placeholder="Enter your comprehensive response, formulas, or repository links here..."
                            rows={4}
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-lg p-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      )}

                      {assign.submissionType === 'file' && (
                        <div className="p-5 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 text-center space-y-1 transition-all">
                          <FileCode className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="text-xs font-semibold text-slate-700">Upload assignment attachment</p>
                          <p className="text-[10px] text-slate-400">PDF, ZIP, or spreadsheet files supported up to 50MB</p>
                          <div className="pt-2">
                            <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-[10px] font-bold cursor-pointer transition-colors inline-block">
                              Choose File
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleAssignmentSubmit(assign.id)}
                          disabled={assign.submissionType !== 'none' && !currentAssignmentText.trim()}
                          className="px-5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Assignment Work</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bottom Nav helper */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                Need help? Your instructor is just an email away.
              </span>
              <p className="text-[11px] text-slate-400">Course version {course.courseVersion}</p>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <BookOpen className="w-16 h-16 text-indigo-200" />
            <h2 className="text-xl font-bold text-slate-800">Select a Lesson to Begin</h2>
            <p className="text-xs text-slate-400 max-w-sm">
              Use the sidebar index to navigate modules and lessons. Your overall progress will be saved automatically as you check off items, pass quizzes, or submit practical tasks.
            </p>
          </div>
        )}
      </div>

      {/* 3. Certificate of Completion Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl p-6 md:p-8 space-y-6 relative border border-slate-100 shadow-2xl">
            
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cert customization */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Student Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Issue Date</label>
                <input
                  type="text"
                  value={certDate}
                  onChange={(e) => setCertDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800"
                />
              </div>
              <div className="flex items-end justify-end">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save as PDF
                </button>
              </div>
            </div>

            {/* CERTIFICATE GRAPHIC (High Elegance) */}
            <div 
              id="v79-certificate-canvas"
              className="border-8 border-amber-500/35 bg-white p-12 text-center space-y-8 relative overflow-hidden"
              style={{ minHeight: '440px' }}
            >
              {/* Decorative corners */}
              <div className="absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 border-amber-500/60"></div>
              <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-amber-500/60"></div>
              <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-amber-500/60"></div>
              <div className="absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 border-amber-500/60"></div>

              <div className="space-y-1.5 pt-4">
                <GraduationCap className="w-12 h-12 text-amber-500 mx-auto" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                  V79 Academy Certification of Mastery
                </span>
                <h1 className="text-3xl font-extrabold text-indigo-950 font-serif tracking-tight mt-3">
                  Certificate of Completion
                </h1>
                <p className="text-xs text-slate-400 italic">This is proudly presented to</p>
              </div>

              <div className="py-4">
                <h2 className="text-2xl font-black text-slate-900 border-b-2 border-amber-500/20 max-w-md mx-auto pb-2 font-serif uppercase tracking-wider">
                  {studentName}
                </h2>
                <p className="text-[11px] text-slate-500 max-w-lg mx-auto leading-relaxed mt-4">
                  for successfully finishing and demonstrating comprehensive mastery of all curriculum, homework assignments, and exams in the course:
                </p>
                <p className="text-base font-bold text-indigo-900 uppercase tracking-wide mt-2">
                  {course.title}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                  V79 Application Core Focus: {course.category}
                </p>
              </div>

              {/* Badges and Signatures */}
              <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-slate-100 max-w-2xl mx-auto text-xs text-slate-500">
                <div className="text-center sm:text-left space-y-0.5 mb-4 sm:mb-0">
                  <p className="text-[10px] text-slate-400">Date of Award</p>
                  <p className="font-bold text-slate-800">{certDate}</p>
                </div>

                {/* Gold Seal */}
                <div className="relative w-16 h-16 rounded-full border-4 border-amber-400/80 bg-amber-50 flex items-center justify-center select-none shadow-sm shrink-0">
                  <span className="text-[8px] font-black text-amber-600 text-center uppercase leading-none">
                    V79<br />ACADEMY<br />SEAL
                  </span>
                </div>

                <div className="text-center sm:text-right space-y-0.5">
                  <p className="text-[10px] text-slate-400">Authorized Signature</p>
                  <p className="font-serif italic text-slate-800 font-semibold text-sm">Elena Vance, CFA</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase">Academy Lead Director</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

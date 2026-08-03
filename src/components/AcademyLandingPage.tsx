import React, { useState, useEffect } from 'react';
import { Course, Module } from '../types';
import { PublicCourseCard } from './PublicCourseCard';
import {
  GraduationCap,
  Search,
  Sparkles,
  BookOpen,
  Award,
  Users,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  ChevronRight,
  Filter,
  X,
  Lock,
  ArrowRight,
  Mail,
  KeyRound,
  LogIn,
  UserPlus,
  Compass,
  Layers,
  Star,
  Globe,
  DollarSign,
  HelpCircle,
  PlayCircle,
  BarChart,
  BookMarked
} from 'lucide-react';

interface AcademyLandingPageProps {
  initialCourseSlug?: string;
}

export function AcademyLandingPage({ initialCourseSlug }: AcademyLandingPageProps) {
  // Courses state
  const [publishedCourses, setPublishedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [priceFilter, setPriceFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selected course for detailed view
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);
  const [detailModules, setDetailModules] = useState<Module[]>([]);
  const [detailLessonsCount, setDetailLessonsCount] = useState<number>(0);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // Active view tab in landing page: 'home' | 'catalog' | 'my-courses'
  const [activeTab, setActiveTab] = useState<'home' | 'catalog' | 'my-courses'>('home');

  // Student auth state
  const [studentUser, setStudentUser] = useState<{ email: string; name: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authName, setAuthName] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [pendingEnrollCourse, setPendingEnrollCourse] = useState<Course | null>(null);

  // Enrolled course IDs state
  const [enrolledMap, setEnrolledMap] = useState<{ [courseId: string]: boolean }>({});

  // Fetch published courses from server
  const fetchPublishedCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/public/courses');
      if (res.ok) {
        const data = await res.json();
        setPublishedCourses(data || []);
      }
    } catch (e) {
      console.error('Error loading public courses', e);
    } finally {
      setLoading(false);
    }
  };

  // Load student session and enrollment state on mount
  useEffect(() => {
    fetchPublishedCourses();

    // Check localStorage student session
    const storedUser = localStorage.getItem('v79_student_user');
    if (storedUser) {
      try {
        setStudentUser(JSON.parse(storedUser));
      } catch {
        // ignore
      }
    }

    // Refresh enrolled map for all courses
    refreshEnrolledMap();
  }, []);

  const refreshEnrolledMap = () => {
    const map: { [courseId: string]: boolean } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('v79_enrolled_') && localStorage.getItem(key) === 'true') {
        const cId = key.replace('v79_enrolled_', '');
        map[cId] = true;
      }
    }
    setEnrolledMap(map);
  };

  // Check initial slug if present
  useEffect(() => {
    if (initialCourseSlug && publishedCourses.length > 0) {
      const found = publishedCourses.find(c => 
        c.id.toLowerCase() === initialCourseSlug.toLowerCase() || 
        c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === initialCourseSlug.toLowerCase()
      );
      if (found) {
        handleViewCourseDetails(found);
      }
    }
  }, [initialCourseSlug, publishedCourses]);

  // Load course details (modules and lesson count)
  const handleViewCourseDetails = async (course: Course) => {
    setDetailCourse(course);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/public/courses/${course.id}/modules`);
      if (res.ok) {
        const mods: Module[] = await res.json();
        setDetailModules(mods || []);
        
        // Count total lessons
        let lCount = 0;
        for (const m of mods) {
          const lRes = await fetch(`/api/public/modules/${m.id}/lessons`);
          if (lRes.ok) {
            const lessons = await lRes.json();
            lCount += (lessons || []).length;
          }
        }
        setDetailLessonsCount(lCount);
      }
    } catch (e) {
      console.error('Error fetching course details', e);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Student Enrollment / Continue Handler
  const handleEnrollOrContinue = (course: Course) => {
    const isEnrolled = !!enrolledMap[course.id];

    if (isEnrolled) {
      // Launch Student Portal Player!
      window.location.href = `/course/${course.id}`;
      return;
    }

    // If not authenticated, require login/register first
    if (!studentUser) {
      setPendingEnrollCourse(course);
      setShowAuthModal(true);
      return;
    }

    // Execute Enrollment
    executeEnrollment(course);
  };

  const executeEnrollment = (course: Course) => {
    localStorage.setItem(`v79_enrolled_${course.id}`, 'true');
    refreshEnrolledMap();

    // Navigate straight to student portal
    window.location.href = `/course/${course.id}`;
  };

  // Handle Auth submission
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please provide email and password.');
      return;
    }

    if (authMode === 'register' && !authName.trim()) {
      setAuthError('Please provide your full name.');
      return;
    }

    const user = {
      email: authEmail.trim(),
      name: authName.trim() || authEmail.split('@')[0]
    };

    localStorage.setItem('v79_student_user', JSON.stringify(user));
    setStudentUser(user);
    setShowAuthModal(false);

    // If pending enrollment exists, complete it!
    if (pendingEnrollCourse) {
      const c = pendingEnrollCourse;
      setPendingEnrollCourse(null);
      executeEnrollment(c);
    }
  };

  const handleStudentLogout = () => {
    localStorage.removeItem('v79_student_user');
    setStudentUser(null);
  };

  // Filtering
  const categories = ['All', 'Fire Finance Pro (FFPRO2)', 'SIWM', 'Tiquet', 'KashDash', 'General Academy'];

  const filteredCourses = publishedCourses.filter((course) => {
    const matchesSearch =
      (course.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.shortDescription || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.instructor || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesDifficulty = difficultyFilter === 'All' || course.difficultyLevel === difficultyFilter;
    
    const isPaid = course.pricingType === 'premium' || (typeof course.price === 'number' && course.price > 0);
    const matchesPrice =
      priceFilter === 'All' ||
      (priceFilter === 'Free' && !isPaid) ||
      (priceFilter === 'Premium' && isPaid);

    return matchesSearch && matchesCategory && matchesDifficulty && matchesPrice;
  });

  const enrolledCoursesList = publishedCourses.filter(c => !!enrolledMap[c.id]);
  const featuredCourses = publishedCourses.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* 1. PUBLIC ACADEMY NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-6 lg:px-12 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div 
            onClick={() => { setActiveTab('home'); setDetailCourse(null); }}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight flex items-center gap-1.5">
                V79 Academy
              </span>
              <span className="text-[10px] text-indigo-400 font-bold block uppercase tracking-widest">
                Student Portal
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => { setActiveTab('home'); setDetailCourse(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'home' && !detailCourse
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => { setActiveTab('catalog'); setDetailCourse(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'catalog' && !detailCourse
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Browse Catalog ({publishedCourses.length})
            </button>
            {studentUser && (
              <button
                onClick={() => { setActiveTab('my-courses'); setDetailCourse(null); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'my-courses' && !detailCourse
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <BookMarked className="w-3.5 h-3.5 text-indigo-400" />
                <span>My Courses ({enrolledCoursesList.length})</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right Header Navigation & Actions */}
        <div className="flex items-center space-x-4">
          <a
            href="/"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
            title="Switch back to V79 Authoring Studio Admin"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>Builder Studio</span>
          </a>

          {studentUser ? (
            <div className="flex items-center space-x-3 bg-slate-800/80 border border-slate-700/80 p-1.5 pl-3 rounded-2xl">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-100">{studentUser.name}</p>
                <p className="text-[10px] text-indigo-400">{studentUser.email}</p>
              </div>
              <button
                onClick={handleStudentLogout}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition-colors border border-rose-500/20"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                  setShowAuthModal(true);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setAuthError(null);
                  setShowAuthModal(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
              >
                Create Free Account
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. MAIN BODY AREA */}
      <main className="flex-1">
        
        {/* VIEW 1: COURSE DETAILS VIEW */}
        {detailCourse ? (
          <div className="p-6 lg:p-12 max-w-6xl mx-auto space-y-8 animate-fade-in">
            {/* Back Button */}
            <button
              onClick={() => setDetailCourse(null)}
              className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/60"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span>Back to Course Catalog</span>
            </button>

            {/* Course Details Header Hero */}
            <div className="bg-slate-800/90 rounded-3xl border border-slate-700/80 p-8 lg:p-10 shadow-2xl relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 font-extrabold text-xs rounded-lg border border-indigo-500/30">
                      {detailCourse.category}
                    </span>
                    <span className="px-3 py-1 bg-slate-700/80 text-slate-300 font-semibold text-xs rounded-lg">
                      {detailCourse.difficultyLevel || 'Intermediate'}
                    </span>
                    <span className="px-3 py-1 bg-slate-700/80 text-slate-300 font-semibold text-xs rounded-lg flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {detailCourse.estimatedDuration || '3.5 Hours'}
                    </span>
                  </div>

                  <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                    {detailCourse.title}
                  </h1>

                  <p className="text-slate-300 text-sm leading-relaxed font-normal">
                    {detailCourse.fullDescription || detailCourse.shortDescription}
                  </p>

                  <div className="flex items-center space-x-6 pt-2 border-t border-slate-700/60 text-xs text-slate-400">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Instructor</span>
                      <span className="font-bold text-slate-200">{detailCourse.instructor || 'V79 Lead Instructor'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Course Version</span>
                      <span className="font-bold text-slate-200">v{detailCourse.courseVersion || '1.0.0'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Certificate</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> Included
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Enrollment Action Box */}
                <div className="bg-slate-900/90 rounded-2xl border border-slate-700 p-6 space-y-6 text-center shadow-xl">
                  <div className="relative h-40 rounded-xl overflow-hidden bg-slate-950">
                    <img 
                      src={detailCourse.thumbnail} 
                      alt={detailCourse.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-white/90 drop-shadow-md" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tuition & Access</span>
                    <div className="text-3xl font-black text-white">
                      {detailCourse.pricingType === 'premium' || (typeof detailCourse.price === 'number' && detailCourse.price > 0)
                        ? `$${(detailCourse.price || 49.99).toFixed(2)}`
                        : 'FREE'}
                    </div>
                  </div>

                  <button
                    onClick={() => handleEnrollOrContinue(detailCourse)}
                    className={`w-full py-3.5 rounded-xl text-xs font-black transition-all shadow-lg flex items-center justify-center space-x-2 ${
                      enrolledMap[detailCourse.id]
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    }`}
                  >
                    {enrolledMap[detailCourse.id] ? (
                      <>
                        <span>Continue Course</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Enroll Now & Start</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-400 leading-tight">
                    {enrolledMap[detailCourse.id] 
                      ? '✓ You are actively enrolled in this course.' 
                      : 'Lifetime access. Includes all video lectures, quizzes, downloadable resources, and completion certificate.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Course Curriculum & Learning Outcomes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                
                {/* Learning Outcomes */}
                {detailCourse.learningObjectives && detailCourse.learningObjectives.length > 0 && (
                  <div className="bg-slate-800/60 rounded-2xl border border-slate-700/70 p-6 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-700/60 pb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>What You Will Learn</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {detailCourse.learningObjectives.map((obj, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modules Curriculum Breakdown */}
                <div className="bg-slate-800/60 rounded-2xl border border-slate-700/70 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <span>Course Curriculum ({detailModules.length} Modules)</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                      {detailLessonsCount} Total Lessons
                    </span>
                  </div>

                  {loadingDetails ? (
                    <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p>Loading course structure...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {detailModules.map((m, mIdx) => (
                        <div key={m.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-300">
                              Module {mIdx + 1}: {m.title}
                            </span>
                          </div>
                          {m.description && (
                            <p className="text-xs text-slate-400 leading-snug">{m.description}</p>
                          )}
                        </div>
                      ))}
                      {detailModules.length === 0 && (
                        <p className="text-xs text-slate-400 italic">Curriculum details available upon enrollment.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Info Card */}
              <div className="space-y-6">
                <div className="bg-slate-800/60 rounded-2xl border border-slate-700/70 p-6 space-y-4">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-700/60 pb-3">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Course Features</span>
                  </h4>
                  <ul className="space-y-3 text-xs text-slate-300 font-medium">
                    <li className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{detailCourse.estimatedDuration || 'Self-paced learning'}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Certificate of Completion</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Quizzes, Worksheets & Media</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>100% Online & Mobile Friendly</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        ) : activeTab === 'my-courses' ? (
          /* VIEW 2: STUDENT MY COURSES DASHBOARD */
          <div className="p-6 lg:p-12 max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-white">My Enrolled Courses</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Welcome back, <strong className="text-indigo-300">{studentUser?.name}</strong>. Continue where you left off.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('catalog')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-colors shadow-md shadow-indigo-600/20"
              >
                Browse More Courses
              </button>
            </div>

            {enrolledCoursesList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCoursesList.map((c) => (
                  <PublicCourseCard
                    key={c.id}
                    course={c}
                    isEnrolled={true}
                    onViewDetails={handleViewCourseDetails}
                    onEnrollOrContinue={handleEnrollOrContinue}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/40 rounded-3xl border border-slate-800 p-12 text-center max-w-lg mx-auto space-y-4">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto border border-indigo-500/20">
                  <BookMarked className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">No Enrolled Courses Yet</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You haven't enrolled in any courses yet. Browse our course catalog to get started.
                </p>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Explore Course Catalog
                </button>
              </div>
            )}
          </div>
        ) : (
          /* VIEW 3: HOME LANDING PAGE & PUBLIC CATALOG */
          <div className="space-y-16 pb-20">
            
            {/* HERO SECTION */}
            <section className="relative overflow-hidden pt-16 pb-20 px-6 lg:px-12 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800/80">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-extrabold tracking-wide uppercase shadow-inner">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span>Interactive Learning Engine</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                  Master Practical Skills with <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
                    V79 Academy
                  </span>
                </h1>

                <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
                  Instructor-led, hands-on courses engineered for real-world execution. Complete interactive lessons, solve practical assessments, and earn certified credentials.
                </p>

                {/* Hero Search Bar */}
                <div className="max-w-xl mx-auto bg-slate-800/90 border border-slate-700/80 p-2 rounded-2xl shadow-2xl flex items-center space-x-2">
                  <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search courses, instructors, topics..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value) setActiveTab('catalog');
                    }}
                    className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none px-2 py-1.5"
                  />
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
                  >
                    Search
                  </button>
                </div>

                {/* Quick Feature Badges */}
                <div className="pt-4 flex items-center justify-center gap-6 sm:gap-10 text-slate-400 text-xs font-medium flex-wrap">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Published Curriculum</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <span>Official Certificates</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-violet-400" />
                    <span>Interactive Quizzes & Downloads</span>
                  </span>
                </div>
              </div>
            </section>

            {/* FEATURED COURSES SECTION */}
            {featuredCourses.length > 0 && activeTab === 'home' && !searchQuery && (
              <section className="max-w-7xl mx-auto px-6 lg:px-12 space-y-8">
                <div className="flex items-end justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">Featured Programs</span>
                    <h2 className="text-2xl font-extrabold text-white mt-1">Popular Academy Courses</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>View All Catalog ({publishedCourses.length})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredCourses.map((course) => (
                    <PublicCourseCard
                      key={course.id}
                      course={course}
                      isEnrolled={!!enrolledMap[course.id]}
                      onViewDetails={handleViewCourseDetails}
                      onEnrollOrContinue={handleEnrollOrContinue}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* PUBLIC COURSE CATALOG SECTION */}
            <section id="catalog-section" className="max-w-7xl mx-auto px-6 lg:px-12 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-white">Public Course Catalog</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Explore all published V79 Academy courses and learning tracks.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center space-x-1 bg-slate-800/80 border border-slate-700/80 p-1 rounded-xl">
                    <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="bg-transparent text-xs text-slate-200 focus:outline-none pr-2 py-1"
                    >
                      <option value="All" className="bg-slate-900">All Levels</option>
                      <option value="Beginner" className="bg-slate-900">Beginner</option>
                      <option value="Intermediate" className="bg-slate-900">Intermediate</option>
                      <option value="Advanced" className="bg-slate-900">Advanced</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-1 bg-slate-800/80 border border-slate-700/80 p-1 rounded-xl">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400 ml-2" />
                    <select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="bg-transparent text-xs text-slate-200 focus:outline-none pr-2 py-1"
                    >
                      <option value="All" className="bg-slate-900">All Tuition</option>
                      <option value="Free" className="bg-slate-900">Free Courses</option>
                      <option value="Premium" className="bg-slate-900">Premium Courses</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Catalog Grid */}
              {loading ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-400 font-semibold">Loading academy course catalog...</p>
                </div>
              ) : filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCourses.map((course) => (
                    <PublicCourseCard
                      key={course.id}
                      course={course}
                      isEnrolled={!!enrolledMap[course.id]}
                      onViewDetails={handleViewCourseDetails}
                      onEnrollOrContinue={handleEnrollOrContinue}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-slate-800/40 rounded-3xl border border-slate-800 p-12 text-center space-y-4 max-w-lg mx-auto">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">No Courses Found</h3>
                  <p className="text-xs text-slate-400">
                    No published courses matched your filters or search term. Try resetting your search filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setDifficultyFilter('All');
                      setPriceFilter('All');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </section>

          </div>
        )}

      </main>

      {/* 3. STUDENT AUTHENTICATION MODAL (LOGIN / REGISTER) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800/80"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">
                {authMode === 'login' ? 'Student Sign In' : 'Create Student Account'}
              </h2>
              <p className="text-xs text-slate-400">
                {pendingEnrollCourse 
                  ? `Sign in or register to enroll in "${pendingEnrollCourse.title}".` 
                  : 'Access your academy courses and track completion stats.'}
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs font-semibold">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Mercer"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                {authMode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{authMode === 'login' ? 'Sign In & Continue' : 'Create Account & Continue'}</span>
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800">
              {authMode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => { setAuthMode('register'); setAuthError(null); }}
                    className="text-indigo-400 font-bold hover:underline"
                  >
                    Create one
                  </button>
                </p>
              ) : (
                <p>
                  Already registered?{' '}
                  <button
                    onClick={() => { setAuthMode('login'); setAuthError(null); }}
                    className="text-indigo-400 font-bold hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 py-10 px-6 lg:px-12 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            <span className="font-bold text-slate-300">V79 Academy</span>
            <span>•</span>
            <span>Powered by V79 Course Builder</span>
          </div>
          <p>© {new Date().getFullYear()} V79 Academy. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Course, Module, Lesson } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CourseList } from './components/CourseList';
import { CourseEditor } from './components/CourseEditor';
import { CoursePreview } from './components/CoursePreview';
import { ExportModal } from './components/ExportModal';
import { AICourseAssistantModal } from './components/AICourseAssistantModal';
import { CreateCourseForm } from './components/CreateCourseForm';
import { ImportCurriculum } from './components/ImportCurriculum';
import { MediaLibrary } from './components/MediaLibrary';
import { PublishingManager } from './components/PublishingManager';
import { StudentPortal } from './components/StudentPortal';
import { AcademyLandingPage } from './components/AcademyLandingPage';
import { FolderKanban, Settings, ShieldCheck, Database, Globe, KeyRound, ArrowLeft, CheckCircle2, HelpCircle } from 'lucide-react';

export default function App() {
  const pathname = window.location.pathname;

  const isAcademyView = pathname.startsWith('/academy');
  const academySlug = isAcademyView && pathname.startsWith('/academy/course/') 
    ? pathname.substring('/academy/course/'.length) 
    : '';

  if (isAcademyView) {
    return <AcademyLandingPage initialCourseSlug={academySlug} />;
  }

  const isStudentView = pathname.startsWith('/course/');
  const studentCourseSlug = isStudentView ? pathname.substring('/course/'.length) : '';

  if (isStudentView) {
    return <StudentPortal courseSlug={studentCourseSlug} />;
  }

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [exportingCourse, setExportingCourse] = useState<Course | null>(null);
  const [previewingCourse, setPreviewingCourse] = useState<Course | null>(null);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [selectedAppCategory, setSelectedAppCategory] = useState<string>('All Applications');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userRole, setUserRole] = useState<'Admin' | 'Instructor' | 'Student'>('Admin');

  // Custom role-aware fetch helper to supply user roles to simulated API endpoints
  const fetchWithRole = async (url: string, init?: RequestInit) => {
    const headers = {
      ...(init?.headers || {}),
      'X-User-Role': userRole
    };
    return fetch(url, {
      ...init,
      headers
    });
  };

  // ---------------------------------------------------------------------
  // Authentication gate. This app previously had no login of any kind -
  // anyone who could reach it could edit or publish courses. 'checking' is
  // the brief state while we ask the server if our session cookie is still
  // valid; nothing else in the app renders until we're 'authenticated'.
  // ---------------------------------------------------------------------
  const [authStatus, setAuthStatus] = useState<'checking' | 'login' | 'forgot-password' | 'change-password' | 'authenticated'>('checking');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [changePwCurrent, setChangePwCurrent] = useState('');
  const [changePwNew, setChangePwNew] = useState('');
  const [changePwConfirm, setChangePwConfirm] = useState('');
  const [changePwError, setChangePwError] = useState<string | null>(null);
  const [changePwSubmitting, setChangePwSubmitting] = useState(false);

  // Forgot / Reset password state
  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/session');
        const data = await res.json();
        if (!data.authenticated) {
          setAuthStatus('login');
        } else if (data.mustChangePassword) {
          setAuthStatus('change-password');
        } else {
          setAuthStatus('authenticated');
        }
      } catch {
        setAuthStatus('login');
      }
    })();
  }, []);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchCourses();
    }
  }, [authStatus]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed.');
      setLoginPassword('');
      setAuthStatus(data.mustChangePassword ? 'change-password' : 'authenticated');
    } catch (err: any) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePwError(null);
    if (changePwNew.length < 12) {
      setChangePwError('New password must be at least 12 characters long.');
      return;
    }
    if (changePwNew !== changePwConfirm) {
      setChangePwError('New password and confirmation do not match.');
      return;
    }
    setChangePwSubmitting(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: changePwCurrent, newPassword: changePwNew })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password.');
      setChangePwCurrent('');
      setChangePwNew('');
      setChangePwConfirm('');
      setAuthStatus('authenticated');
    } catch (err: any) {
      setChangePwError(err.message || 'Failed to change password.');
    } finally {
      setChangePwSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (!resetToken.trim()) {
      setResetError('Please enter your recovery token.');
      return;
    }
    if (resetNewPassword.length < 12) {
      setResetError('New password must be at least 12 characters long.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('New password and confirmation do not match.');
      return;
    }

    setResetSubmitting(true);
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword: resetNewPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password reset failed.');
      setResetSuccess(data.message || 'Password reset successfully! You can now log in.');
      setResetToken('');
      setResetNewPassword('');
      setResetConfirmPassword('');
    } catch (err: any) {
      setResetError(err.message || 'Password reset failed.');
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // ignore network errors on logout, still clear local state below
    }
    setCourses([]);
    setModules([]);
    setLessons([]);
    setSelectedCourse(null);
    setCurrentView('dashboard');
    setAuthStatus('login');
  };

  const fetchCourses = async () => {
    try {
      const res = await fetchWithRole('/api/courses');
      const data = await res.json();
      if (res.status === 401) {
        setAuthStatus('login');
        setCourses([]);
        return;
      }
      if (res.status === 403 && data.code === 'PASSWORD_CHANGE_REQUIRED') {
        setAuthStatus('change-password');
        setCourses([]);
        return;
      }
      if (Array.isArray(data)) {
        setCourses(data);
      } else {
        setCourses([]);
      }
    } catch (e) {
      console.error(e);
      setCourses([]);
    }
  };

  const handleCreateNewCourse = async () => {
    try {
      const res = await fetchWithRole('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New V79 Academy Course',
          shortDescription: 'Enter course short description here...',
          fullDescription: 'Enter comprehensive course overview and learning outcomes...',
          category: selectedAppCategory === 'All Applications' ? 'Fire Finance Pro (FFPRO2)' : selectedAppCategory,
          difficultyLevel: 'Intermediate',
          instructor: 'V79 Academy Lead Author',
          courseVersion: '1.0.0',
          thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
          estimatedDuration: '3.0 hours',
          prerequisites: ['Basic V79 Application Knowledge'],
          learning_objectives: ['Understand core workflows', 'Execute advanced configuration tasks'],
          status: 'Draft'
        })
      });
      if (res.ok) {
        const created = await res.json();
        await fetchCourses();
        setSelectedCourse(created);
        setCurrentView('editor');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await fetchWithRole(`/api/courses/${courseId}`, { method: 'DELETE' });
      await fetchCourses();
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
        setCurrentView('dashboard');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authStatus === 'login') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-5">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold text-slate-900">V79 Course Builder</h1>
            <p className="text-xs text-slate-500">Admin sign-in required.</p>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Password</label>
            <input
              type="password"
              required
              autoFocus
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          {loginError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">{loginError}</div>
          )}
          <button
            type="submit"
            disabled={loginSubmitting}
            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-md transition-all disabled:opacity-50"
          >
            {loginSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => {
                setLoginError(null);
                setResetError(null);
                setResetSuccess(null);
                setAuthStatus('forgot-password');
              }}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition-colors inline-flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Forgot Password? Reset with Recovery Token
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (authStatus === 'forgot-password') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-5">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold text-slate-900">Reset Admin Password</h1>
            <p className="text-xs text-slate-500">Enter your secure recovery token to set a new admin password.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-900 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-indigo-700">
              <HelpCircle className="w-4 h-4 shrink-0" />
              Recovery Token Info
            </div>
            <p className="text-indigo-800/90 leading-relaxed">
              Use your master recovery key (<code className="bg-indigo-100 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold text-indigo-950">V79-RECOVERY-KEY-2026</code> or custom <code className="bg-indigo-100 px-1.5 py-0.5 rounded font-mono text-[11px]">ADMIN_RESET_TOKEN</code>).
            </p>
          </div>

          {resetSuccess ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-900">Password Updated!</p>
                  <p className="mt-0.5">{resetSuccess}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResetSuccess(null);
                  setAuthStatus('login');
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-md transition-all"
              >
                Sign In with New Password
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Recovery Token</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. V79-RECOVERY-KEY-2026"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 font-mono placeholder:font-sans placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">New Password (min. 12 characters)</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new strong password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {resetError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">{resetError}</div>
              )}

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-md transition-all disabled:opacity-50"
                >
                  {resetSubmitting ? 'Resetting Password...' : 'Reset Admin Password'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setResetError(null);
                    setAuthStatus('login');
                  }}
                  className="w-full py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-medium hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (authStatus === 'change-password') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <form onSubmit={handleChangePassword} className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-5">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold text-slate-900">Set a New Password</h1>
            <p className="text-xs text-slate-500">You signed in with a temporary one-time password. Set a permanent one before continuing.</p>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">One-Time Password</label>
            <input
              type="password"
              required
              autoFocus
              value={changePwCurrent}
              onChange={(e) => setChangePwCurrent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">New Password (min. 12 characters)</label>
            <input
              type="password"
              required
              value={changePwNew}
              onChange={(e) => setChangePwNew(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Confirm New Password</label>
            <input
              type="password"
              required
              value={changePwConfirm}
              onChange={(e) => setChangePwConfirm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800"
            />
          </div>
          {changePwError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">{changePwError}</div>
          )}
          <button
            type="submit"
            disabled={changePwSubmitting}
            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-md transition-all disabled:opacity-50"
          >
            {changePwSubmitting ? 'Saving...' : 'Set New Password'}
          </button>
        </form>
      </div>
    );
  }

  if (previewingCourse) {
    return (
      <CoursePreview
        course={previewingCourse}
        onBack={() => setPreviewingCourse(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={(v) => {
          setCurrentView(v);
          setSelectedCourse(null);
        }}
        selectedAppCategory={selectedAppCategory}
        setSelectedAppCategory={setSelectedAppCategory}
        userRole={userRole}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNewCourse={handleCreateNewCourse}
          onOpenAiAssistant={() => setShowAiModal(true)}
          selectedAppCategory={selectedAppCategory}
          onLogout={handleLogout}
          userRole={userRole}
          setUserRole={setUserRole}
        />

        <main className="flex-1">
          {currentView === 'dashboard' && (
            <Dashboard
              courses={courses}
              modules={modules}
              lessons={lessons}
              onSelectCourse={(c) => {
                setSelectedCourse(c);
                setCurrentView('editor');
              }}
              onPreviewCourse={(c) => setPreviewingCourse(c)}
              onExportCourse={(c) => setExportingCourse(c)}
              onNewCourse={handleCreateNewCourse}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'courses' && (
            <CourseList
              courses={courses}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedAppCategory={selectedAppCategory}
              onSelectCourse={(c) => {
                setSelectedCourse(c);
                setCurrentView('editor');
              }}
              onPreviewCourse={(c) => setPreviewingCourse(c)}
              onExportCourse={(c) => setExportingCourse(c)}
              onDeleteCourse={handleDeleteCourse}
              onNewCourse={handleCreateNewCourse}
              onRefreshCourses={fetchCourses}
            />
          )}

          {currentView === 'create-course' && (
            <CreateCourseForm
              onBack={() => setCurrentView('courses')}
              onCourseCreated={(course) => {
                fetchCourses();
                setSelectedCourse(course);
                setCurrentView('editor');
              }}
              selectedAppCategory={selectedAppCategory}
            />
          )}

          {currentView === 'import-curriculum' && (
            <ImportCurriculum
              onCourseSelected={(course) => {
                setSelectedCourse(course);
              }}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'media-library' && (
            <MediaLibrary
              courses={courses}
            />
          )}

          {currentView === 'publishing' && (
            <PublishingManager
              courses={courses}
              onCourseUpdated={fetchCourses}
              userRole={userRole}
            />
          )}

          {currentView === 'editor' && selectedCourse && (
            <CourseEditor
              course={selectedCourse}
              onBack={() => {
                setSelectedCourse(null);
                setCurrentView('courses');
              }}
              onUpdateCourse={(updated) => {
                setSelectedCourse(updated);
                fetchCourses();
              }}
              onExportCourse={(c) => setExportingCourse(c)}
            />
          )}

          {currentView === 'assets' && (
            <div className="p-8 space-y-6 max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Global Asset Management Repository</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Central media registry for all V79 Academy courses across Fire Finance Pro, SIWM, Tiquet, and KashDash.</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FolderKanban className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
                <Database className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">Integrated with Course Authoring</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Assets are organized directly per course, module, and lesson within each course editor. Select a course from the catalog to manage its media assets.
                </p>
                <button
                  onClick={() => setCurrentView('courses')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-md transition-all inline-block"
                >
                  Browse Course Catalog
                </button>
              </div>
            </div>
          )}

          {currentView === 'settings' && (
            <div className="p-8 space-y-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Academy Platform Settings</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Configure V79 Academy integration webhooks, database credentials, and roles.</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Settings className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 shadow-xs">
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Data Storage</h4>
                    <p className="text-xs text-slate-500">Courses are stored in a JSON file at ./data/store.json, persisted via the Docker volume mount.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <p className="font-semibold text-slate-700">Supported V79 Applications</p>
                    <p className="text-slate-500">Fire Finance Pro (FFPRO2), SIWM, Tiquet, KashDash</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <p className="font-semibold text-slate-700">Export Package Format</p>
                    <p className="text-slate-500">Structured JSON (`course.json`, modules, lessons, quizzes)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Export Modal */}
      {exportingCourse && (
        <ExportModal
          course={exportingCourse}
          onClose={() => setExportingCourse(null)}
        />
      )}

      {/* AI Assistant Modal */}
      {showAiModal && (
        <AICourseAssistantModal
          onClose={() => setShowAiModal(false)}
          onCourseCreated={() => {
            fetchCourses();
            setCurrentView('courses');
          }}
        />
      )}
    </div>
  );
}

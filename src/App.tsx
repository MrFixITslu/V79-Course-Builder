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
import { FolderKanban, Settings, ShieldCheck, Database, Globe } from 'lucide-react';

export default function App() {
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

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      setCourses(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateNewCourse = async () => {
    try {
      const res = await fetch('/api/courses', {
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
      await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
      await fetchCourses();
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
        setCurrentView('dashboard');
      }
    } catch (e) {
      console.error(e);
    }
  };

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
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNewCourse={handleCreateNewCourse}
          onOpenAiAssistant={() => setShowAiModal(true)}
          selectedAppCategory={selectedAppCategory}
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
                    <h4 className="font-bold text-slate-900 text-sm">PostgreSQL & Docker Environment Status</h4>
                    <p className="text-xs text-slate-500">Connected to active database runtime on port 5432</p>
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

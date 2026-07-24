import React, { useState, useEffect } from 'react';
import { Course, Lesson } from '../types';
import { ArrowLeft, BookOpen, Layers, FolderKanban, Settings, Save, CheckCircle2 } from 'lucide-react';
import { ModuleLessonManager } from './ModuleLessonManager';
import { AssetManager } from './AssetManager';
import { QuizBuilder } from './QuizBuilder';

interface CourseEditorProps {
  course: Course;
  onBack: () => void;
  onUpdateCourse: (updated: Course) => void;
  onExportCourse: (course: Course) => void;
}

export function CourseEditor({ course, onBack, onUpdateCourse, onExportCourse }: CourseEditorProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'assets' | 'quiz' | 'settings'>('curriculum');
  const [formData, setFormData] = useState<Course>({ ...course });
  const [selectedLessonForQuiz, setSelectedLessonForQuiz] = useState<Lesson | null>(null);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        setAutoSaveStatus('saving');
        const res = await fetch(`/api/courses/${course.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const updated = await res.json();
          onUpdateCourse(updated);
          setAutoSaveStatus('saved');
          setLastSavedTime(new Date().toLocaleTimeString());
        }
      } catch (e) {
        console.error('Auto-save error:', e);
        setAutoSaveStatus('unsaved');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, course.id]);

  const handleSaveOverview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdateCourse(updated);
        setAutoSaveStatus('saved');
        setLastSavedTime(new Date().toLocaleTimeString());
        alert('Course overview saved successfully!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700">
                {formData.category}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-500">v{formData.courseVersion}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{formData.title}</h2>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className={`w-2 h-2 rounded-full ${autoSaveStatus === 'saving' ? 'bg-amber-500 animate-pulse' : autoSaveStatus === 'saved' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span>{autoSaveStatus === 'saving' ? 'Auto-saving...' : autoSaveStatus === 'saved' ? `Auto-saved (${lastSavedTime})` : 'Unsaved'}</span>
          </div>
          <button
            onClick={() => onExportCourse(formData)}
            className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold hover:bg-purple-100 transition-colors"
          >
            Export Package
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => { setActiveTab('curriculum'); setSelectedLessonForQuiz(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
            activeTab === 'curriculum' && !selectedLessonForQuiz
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Curriculum & Lessons</span>
        </button>

        <button
          onClick={() => { setActiveTab('overview'); setSelectedLessonForQuiz(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Course Overview & Metadata</span>
        </button>

        <button
          onClick={() => { setActiveTab('assets'); setSelectedLessonForQuiz(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
            activeTab === 'assets'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>Asset Manager</span>
        </button>

        <button
          onClick={() => { setActiveTab('settings'); setSelectedLessonForQuiz(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
            activeTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Publishing & Status</span>
        </button>
      </div>

      {/* Tab Content */}
      {selectedLessonForQuiz ? (
        <QuizBuilder
          lesson={selectedLessonForQuiz}
          onBack={() => setSelectedLessonForQuiz(null)}
        />
      ) : (
        <>
          {activeTab === 'curriculum' && (
            <ModuleLessonManager
              course={formData}
              onOpenQuizBuilder={(lesson) => setSelectedLessonForQuiz(lesson)}
            />
          )}

          {activeTab === 'overview' && (
            <form onSubmit={handleSaveOverview} className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 shadow-xs max-w-4xl mx-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Course Metadata & Overview</h3>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-md transition-all flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">V79 Application Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800"
                  >
                    <option value="Fire Finance Pro (FFPRO2)">Fire Finance Pro (FFPRO2)</option>
                    <option value="SIWM">SIWM</option>
                    <option value="Tiquet">Tiquet</option>
                    <option value="KashDash">KashDash</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty Level</label>
                  <select
                    value={formData.difficultyLevel}
                    onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Instructor Name</label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course Version</label>
                  <input
                    type="text"
                    value={formData.courseVersion}
                    onChange={(e) => setFormData({ ...formData, courseVersion: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Thumbnail Image URL</label>
                  <input
                    type="text"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description</label>
                  <textarea
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800"
                    rows={2}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Description</label>
                  <textarea
                    value={formData.fullDescription}
                    onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 leading-relaxed"
                    rows={4}
                  />
                </div>
              </div>
            </form>
          )}

          {activeTab === 'assets' && (
            <AssetManager course={formData} />
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 max-w-4xl mx-auto shadow-xs">
              <h3 className="text-lg font-bold text-slate-900">Publishing & Workflow Status</h3>
              <p className="text-xs text-slate-500">Update course lifecycle status before exporting to the V79 Academy website.</p>

              <div className="space-y-4 pt-4">
                <label className="block text-xs font-semibold text-slate-700">Course Status</label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {(['Draft', 'Review', 'Ready for Upload', 'Uploaded'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        const updated = { ...formData, status: st };
                        setFormData(updated);
                        onUpdateCourse(updated);
                      }}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        formData.status === st
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-bold text-xs text-slate-900">{st}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {st === 'Draft' && 'Work in progress by author'}
                        {st === 'Review' && 'Submitted for peer review'}
                        {st === 'Ready for Upload' && 'Approved & ready for Academy export'}
                        {st === 'Uploaded' && 'Live on V79 Academy portal'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

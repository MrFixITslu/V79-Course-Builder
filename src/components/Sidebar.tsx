import React from 'react';
import { BookOpen, LayoutDashboard, Settings, GraduationCap, PlusCircle, UploadCloud, Image, FileCheck } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedAppCategory: string;
  setSelectedAppCategory: (cat: string) => void;
  userRole: 'Admin' | 'Instructor' | 'Student';
}

export function Sidebar({ currentView, setCurrentView, selectedAppCategory, setSelectedAppCategory, userRole }: SidebarProps) {
  const categories = [
    'All Applications',
    'Fire Finance Pro (FFPRO2)',
    'SIWM',
    'Tiquet',
    'KashDash'
  ];

  const canEdit = userRole === 'Admin' || userRole === 'Instructor';
  const isAdmin = userRole === 'Admin';

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-white text-base tracking-wide">V79 Academy</h1>
          <p className="text-xs text-indigo-400 font-medium">Course Builder v2.4</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 flex-1 space-y-6 overflow-y-auto">
        {/* Authoring Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Authoring Engine</p>
          
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              currentView === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          {canEdit && (
            <>
              <button
                onClick={() => setCurrentView('courses')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  currentView === 'courses' || currentView === 'editor'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>My Courses</span>
              </button>

              <button
                onClick={() => setCurrentView('create-course')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  currentView === 'create-course'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Course</span>
              </button>

              <button
                onClick={() => setCurrentView('import-curriculum')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  currentView === 'import-curriculum'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Import Curriculum</span>
              </button>
            </>
          )}

          <div className="pt-2 px-3">
            <a
              href="/academy"
              className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-bold bg-gradient-to-tr from-indigo-600 to-violet-500 text-white hover:opacity-90 shadow-xs transition-opacity text-center"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Launch Student Portal ↗</span>
            </a>
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
              Visit the public V79 Academy landing page & catalog (<code className="text-indigo-400">/academy</code>).
            </p>
          </div>
        </div>

        {/* Application Filters */}
        {canEdit && (
          <div className="space-y-2">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">V79 Applications</p>
            <div className="space-y-1 pl-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedAppCategory(cat);
                    if (currentView !== 'courses' && currentView !== 'dashboard') {
                      setCurrentView('courses');
                    }
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                    selectedAppCategory === cat
                      ? 'bg-slate-800 text-indigo-400 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  {cat !== 'All Applications' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Assets & Deployments */}
        {canEdit && (
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Systems</p>
            
            <button
              onClick={() => setCurrentView('media-library')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                currentView === 'media-library'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>Media Library</span>
            </button>

            <button
              onClick={() => setCurrentView('publishing')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                currentView === 'publishing'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Publishing & Versions</span>
            </button>

            <button
              onClick={() => setCurrentView('settings')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                currentView === 'settings'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Academy Settings</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400">
            {userRole === 'Admin' ? 'AD' : userRole === 'Instructor' ? 'IN' : 'ST'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">
              {userRole === 'Admin' ? 'Administrator' : userRole === 'Instructor' ? 'Instructor' : 'Student'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {userRole === 'Admin' ? 'V79 Academy Root' : userRole === 'Instructor' ? 'Course Instructor' : 'Public Viewer'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

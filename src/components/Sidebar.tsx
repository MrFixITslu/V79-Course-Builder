import React from 'react';
import { BookOpen, LayoutDashboard, FolderKanban, Database, Sparkles, Settings, GraduationCap } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedAppCategory: string;
  setSelectedAppCategory: (cat: string) => void;
}

export function Sidebar({ currentView, setCurrentView, selectedAppCategory, setSelectedAppCategory }: SidebarProps) {
  const categories = [
    'All Applications',
    'Fire Finance Pro (FFPRO2)',
    'SIWM',
    'Tiquet',
    'KashDash'
  ];

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
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Main Menu</p>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentView('courses')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'courses' || currentView === 'editor'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Course Catalog</span>
          </button>
        </div>

        {/* Application Filters */}
        <div className="space-y-2">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">V79 Applications</p>
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
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  selectedAppCategory === cat
                    ? 'bg-slate-800 text-indigo-400 font-semibold'
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

        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Tools & Export</p>
          <button
            onClick={() => setCurrentView('assets')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'assets'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Global Asset Manager</span>
          </button>

          <button
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'settings'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Academy Settings</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400">
            AD
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-white truncate">Administrator</p>
            <p className="text-[10px] text-slate-400 truncate">V79 Academy Root</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

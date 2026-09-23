import React from 'react';
import { Search, Plus, Sparkles, Bell, Globe, LogOut } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onNewCourse: () => void;
  onOpenAiAssistant: () => void;
  selectedAppCategory: string;
  onLogout?: () => void;
  userRole: 'Admin' | 'Instructor' | 'Student';
  setUserRole: (role: 'Admin' | 'Instructor' | 'Student') => void;
}

export function Header({
  searchQuery,
  setSearchQuery,
  onNewCourse,
  onOpenAiAssistant,
  selectedAppCategory,
  onLogout,
  userRole,
  setUserRole
}: HeaderProps) {
  return (
    <header className="min-h-16 flex-wrap gap-3 py-3 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center space-x-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all"
          />
        </div>
        {selectedAppCategory !== 'All Applications' && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
            <Globe className="w-3 h-3 mr-1" />
            {selectedAppCategory}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={onOpenAiAssistant}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-sm transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Course Architect</span>
        </button>

        <button
          onClick={onNewCourse}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Course</span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1 shrink-0"></div>



        {onLogout && (
          <button
            onClick={onLogout}
            title="Log out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
}

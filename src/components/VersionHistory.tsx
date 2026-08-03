import React, { useState, useEffect } from 'react';
import { CourseVersion } from '../types/course-builder-v2';
import { Clock, Plus, RefreshCw, CheckCircle2, AlertCircle, History, ArrowLeft, ArrowUpRight, User } from 'lucide-react';

interface VersionHistoryProps {
  courseId: string;
  onRollback: () => void;
}

export function VersionHistory({ courseId, onRollback }: VersionHistoryProps) {
  const [versions, setVersions] = useState<CourseVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [newVersionNumber, setNewVersionNumber] = useState('');
  const [changelog, setChangelog] = useState('');
  const [author, setAuthor] = useState('Administrator');
  const [isCreating, setIsCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Rollback Status
  const [rollingBackId, setRollingBackId] = useState<string | null>(null);

  const fetchVersions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}/versions`);
      if (!res.ok) throw new Error('Failed to load version history');
      const data = await res.json();
      setVersions(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching versions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [courseId]);

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionNumber.trim()) return;

    setIsCreating(true);
    setCreateSuccess(false);
    setError(null);

    try {
      const res = await fetch(`/api/courses/${courseId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          versionNumber: newVersionNumber,
          changelog,
          exportedBy: author
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create version snapshot');
      }

      setCreateSuccess(true);
      setNewVersionNumber('');
      setChangelog('');
      fetchVersions();
      setTimeout(() => setCreateSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error saving version');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRollback = async (versionId: string, versionNumber: string) => {
    if (!confirm(`Are you sure you want to rollback to Version ${versionNumber}? All current course contents (modules, lessons, quizzes, assignments) will be replaced with this snapshot's state.`)) {
      return;
    }

    setRollingBackId(versionId);
    setError(null);

    try {
      const res = await fetch(`/api/courses/${courseId}/versions/${versionId}/rollback`, {
        method: 'POST'
      });

      if (!res.ok) {
        throw new Error('Rollback failed');
      }

      alert(`Successfully rolled back to Version ${versionNumber}!`);
      onRollback();
      fetchVersions();
    } catch (err: any) {
      setError(err.message || 'Error executing rollback');
    } finally {
      setRollingBackId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
      {/* Create Version Form */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs h-fit">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <History className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm">Create Course Snapshot</h3>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Snapshotting locks the current state of curriculum, lessons, and assignments into a permanent restore point.
        </p>

        {createSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Version snapshot saved successfully!</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCreateVersion} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Version Name/Number</label>
            <input
              type="text"
              placeholder="e.g. 2.0.0, 1.4.3-Draft"
              value={newVersionNumber}
              onChange={(e) => setNewVersionNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Changelog Notes</label>
            <textarea
              placeholder="What changes are made in this version?"
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Author Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {isCreating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Snapshot...</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Save New Version</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Version Logs & Restore List */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Version History Point Logs</h3>
          </div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
            {versions.length} points
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Loading historical snapshots...</span>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-20 space-y-2">
            <History className="w-12 h-12 text-slate-200 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700">No versions tracked yet</h4>
            <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
              Save your first version snapshot on the left to capture a restore point for this course.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {versions.map((ver) => (
              <div
                key={ver.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono text-[10px] font-bold">
                        v{ver.versionNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">by {ver.exportedBy}</span>
                    </div>
                    {ver.changelog && (
                      <p className="text-xs text-slate-700 mt-2 font-medium bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed whitespace-pre-wrap">
                        {ver.changelog}
                      </p>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                    {new Date(ver.exportedAt).toLocaleDateString()} {new Date(ver.exportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">
                    Contains: {ver.snapshot.modules?.length || 0} modules · {ver.snapshot.lessons?.length || 0} lessons
                  </span>

                  <button
                    onClick={() => handleRollback(ver.id, ver.versionNumber)}
                    disabled={rollingBackId !== null}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {rollingBackId === ver.id ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Restoring...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        <span>Restore Point</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { CourseVersion, PublishingLog } from '../types/course-builder-v2';
import { 
  Globe, 
  History, 
  AlertTriangle, 
  FileCheck, 
  CheckCircle2, 
  RotateCcw, 
  Plus, 
  ListRestart, 
  HelpCircle, 
  Copy, 
  Trash2, 
  Archive, 
  Loader2, 
  ShieldAlert, 
  BadgeInfo, 
  FileText,
  UserCheck,
  Check,
  X
} from 'lucide-react';

interface PublishingManagerProps {
  courses: Course[];
  onCourseUpdated: () => void;
  userRole: 'Admin' | 'Instructor' | 'Student';
}

export function PublishingManager({ courses, onCourseUpdated, userRole }: PublishingManagerProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(courses[0] || null);
  const [status, setStatus] = useState<string>('Draft');
  const [versions, setVersions] = useState<CourseVersion[]>([]);
  const [logs, setLogs] = useState<PublishingLog[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // New snapshot state
  const [showSnapForm, setShowSnapForm] = useState(false);
  const [versionNumber, setVersionNumber] = useState('1.1.0');
  const [changelog, setChangelog] = useState('');
  const [snapping, setSnapping] = useState(false);

  // General feedback messages
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (courses.length > 0) {
      if (!selectedCourse || !courses.some(c => c.id === selectedCourse.id)) {
        setSelectedCourse(courses[0]);
      } else {
        // Refresh reference
        const currentRef = courses.find(c => c.id === selectedCourse.id);
        if (currentRef) setSelectedCourse(currentRef);
      }
    } else {
      setSelectedCourse(null);
    }
  }, [courses]);

  useEffect(() => {
    if (selectedCourse) {
      setStatus(selectedCourse.status);
      fetchVersions(selectedCourse.id);
      fetchLogs(selectedCourse.id);
      setMessage(null);
      setValidationErrors([]);
    } else {
      setVersions([]);
      setLogs([]);
    }
  }, [selectedCourse]);

  const fetchVersions = async (courseId: string) => {
    setLoadingVersions(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/versions`, {
        headers: { 'X-User-Role': userRole }
      });
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
      }
    } catch (err) {
      console.error('Failed to load version trace:', err);
    } finally {
      setLoadingVersions(false);
    }
  };

  const fetchLogs = async (courseId: string) => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/publishing-logs`, {
        headers: { 'X-User-Role': userRole }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Status transitions (Draft, Review, Imported, etc.)
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedCourse) return;
    setMessage(null);
    setValidationErrors([]);
    setActionLoading('status');

    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Role': userRole
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await res.json();
      if (res.ok) {
        setStatus(data.status);
        setMessage({ type: 'success', text: `Course status transitioned to "${newStatus}" successfully.` });
        onCourseUpdated();
        fetchLogs(selectedCourse.id);
      } else {
        throw new Error(data.error || 'Failed to update publishing state.');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error updating status.' });
    } finally {
      setActionLoading(null);
    }
  };

  // Perform full validation and publish synchronization
  const handlePublishLive = async () => {
    if (!selectedCourse) return;
    setMessage(null);
    setValidationErrors([]);
    setActionLoading('publish');

    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': userRole
        }
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('Published');
        setMessage({ 
          type: 'success', 
          text: `Successfully published course live! Curriculum synchronized with live student portal (Website App ID: ${data.websiteAppId || 'V79-Active'}).` 
        });
        onCourseUpdated();
        fetchLogs(selectedCourse.id);
      } else {
        if (data.details && Array.isArray(data.details)) {
          setValidationErrors(data.details);
          throw new Error(data.error || 'Validation failed. Please resolve all issues before publishing.');
        } else {
          throw new Error(data.error || 'Publish request failed.');
        }
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Publishing rejected.' });
    } finally {
      setActionLoading(null);
    }
  };

  // Duplicate a course
  const handleDuplicateCourse = async () => {
    if (!selectedCourse) return;
    setMessage(null);
    setValidationErrors([]);
    setActionLoading('duplicate');

    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': userRole
        }
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: `Course "${selectedCourse.title}" successfully duplicated as "${selectedCourse.title} (Copy)" (Status: Draft).` });
        onCourseUpdated();
        // Automatically switch to the duplicated course after rendering
        if (data.id) {
          const matched = courses.find(c => c.id === data.id);
          if (matched) setSelectedCourse(matched);
        }
      } else {
        throw new Error(data.error || 'Duplication failed.');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error duplicating course.' });
    } finally {
      setActionLoading(null);
    }
  };

  // Delete draft course
  const handleDeleteDraft = async () => {
    if (!selectedCourse) return;
    if (!confirm(`Are you sure you want to delete "${selectedCourse.title}"? This will permanently erase this course and all associated modules and lessons.`)) {
      return;
    }

    setMessage(null);
    setValidationErrors([]);
    setActionLoading('delete');

    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': userRole
        }
      });

      const data = await res.json();
      if (res.ok) {
        alert('Course draft deleted successfully.');
        setSelectedCourse(null);
        onCourseUpdated();
      } else {
        throw new Error(data.error || 'Delete failed.');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error deleting course.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleTakeSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    if (!versionNumber.trim()) {
      alert('Version number is required');
      return;
    }

    setSnapping(true);
    setMessage(null);
    setValidationErrors([]);

    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}/versions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Role': userRole
        },
        body: JSON.stringify({
          versionNumber,
          changelog: changelog.trim() || 'Manual revision backup snapshot.',
          exportedBy: userRole === 'Admin' ? 'Administrator' : 'Instructor'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to snap course state.');

      setMessage({ type: 'success', text: `Version snapshot v${versionNumber} captured successfully!` });
      setVersionNumber('');
      setChangelog('');
      setShowSnapForm(false);
      fetchVersions(selectedCourse.id);
      fetchLogs(selectedCourse.id);
      onCourseUpdated();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error taking snapshot.' });
    } finally {
      setSnapping(false);
    }
  };

  const handleRollback = async (version: CourseVersion) => {
    if (!selectedCourse) return;
    if (!confirm(`Are you absolutely sure you want to rollback to version ${version.versionNumber}? This will overwrite all current modules and content blocks with this snapshot.`)) return;

    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}/versions/${version.id}/rollback`, {
        method: 'POST',
        headers: { 'X-User-Role': userRole }
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: `Overwrote working branch and restored state to Version ${version.versionNumber}!` });
        fetchVersions(selectedCourse.id);
        fetchLogs(selectedCourse.id);
        onCourseUpdated();
      } else {
        throw new Error(data.error || 'Rollback action rejected by server.');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error restoring rollback trace.' });
    }
  };

  const getStatusStyle = (s: string) => {
    switch (s) {
      case 'Published':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Review':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Archived':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Imported':
        return 'bg-indigo-50 text-indigo-800 border-indigo-100';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Intro section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Publishing, Versions & Audit Trails</h2>
            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-indigo-100">
              Active Role: {userRole}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Track student-facing course distribution, check validation safeguards, restore instant database backups, and explore chronological change logs.
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Globe className="w-6 h-6" />
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          <span>Please create or import a course first before deploying publish targets.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Console Controls */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Curriculum Deployment Engine</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Perform state transitions and trigger student live publishing syncs.</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(status)}`}>
                  {status}
                </span>
              </div>

              {message && (
                <div className={`p-4 rounded-xl text-xs flex items-start space-x-2 border ${
                  message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold">{message.text}</p>
                    {validationErrors.length > 0 && (
                      <div className="mt-2 bg-white/60 p-3 rounded-lg border border-rose-100 space-y-1 text-slate-700 font-sans">
                        <p className="font-bold text-rose-800 flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Validation Warnings found ({validationErrors.length}):</span>
                        </p>
                        <ul className="list-disc list-inside space-y-0.5 pl-1.5 text-[11px] text-slate-600">
                          {validationErrors.map((err, idx) => (
                            <li key={idx} className="leading-relaxed">{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Selected Course</label>
                  <select
                    value={selectedCourse?.id || ''}
                    onChange={(e) => {
                      const matched = courses.find((c) => c.id === e.target.value);
                      if (matched) setSelectedCourse(matched);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title} [{c.category}]</option>
                    ))}
                  </select>
                </div>

                {/* Status transitions (Draft, Review, Archived) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700">Course Status Workflow Actions</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {['Draft', 'Imported', 'Review', 'Archived'].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        disabled={actionLoading !== null}
                        className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                          status === s
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        } disabled:opacity-50`}
                      >
                        {actionLoading === 'status' ? 'Updating...' : s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Authoritative Live Publish Trigger */}
                <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <Globe className="w-4 h-4 text-indigo-600" />
                      <span>Synchronize with Live Student Catalog</span>
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed max-w-md">
                      Publishes the finalized curriculum database live. Requires **Administrator** credentials. This triggers full content validation beforehand.
                    </p>
                  </div>
                  <button
                    onClick={handlePublishLive}
                    disabled={actionLoading !== null}
                    className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-1.5 shrink-0 disabled:opacity-60"
                  >
                    {actionLoading === 'publish' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Validating & Deploying...</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-3.5 h-3.5" />
                        <span>Publish Live 🚀</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel (Duplicate, Delete Draft, Archive) */}
            {selectedCourse && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-slate-700" />
                    <span>Quick Management Controls</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Perform immediate duplications, draft teardowns, or archiving.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Duplicate */}
                  <button
                    onClick={handleDuplicateCourse}
                    disabled={actionLoading !== null}
                    className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all"
                  >
                    <Copy className="w-4 h-4 text-slate-500" />
                    <div className="text-left">
                      <span className="block font-bold">Duplicate Course</span>
                      <span className="block text-[9px] text-slate-400 font-normal">Deep copy course modules & quizzes</span>
                    </div>
                  </button>

                  {/* Archive */}
                  <button
                    onClick={() => handleStatusChange('Archived')}
                    disabled={actionLoading !== null || status === 'Archived'}
                    className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all disabled:opacity-55"
                  >
                    <Archive className="w-4 h-4 text-slate-500" />
                    <div className="text-left">
                      <span className="block font-bold">Archive Course</span>
                      <span className="block text-[9px] text-slate-400 font-normal">Deactivate student distribution</span>
                    </div>
                  </button>

                  {/* Delete Draft */}
                  <button
                    onClick={handleDeleteDraft}
                    disabled={actionLoading !== null}
                    className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-red-200 hover:bg-red-50 text-red-700 text-xs font-semibold transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <div className="text-left">
                      <span className="block font-bold">Delete Draft</span>
                      <span className="block text-[9px] text-slate-400 font-normal text-red-500/70">Permanently purge raw workspace</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Version Snapshot Form Area */}
            {selectedCourse && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                      <History className="w-4 h-4 text-indigo-600" />
                      <span>Curriculum Backups & Version Snapshots</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Generate rollback checkpoints for disaster recovery.</p>
                  </div>
                  {!showSnapForm && (
                    <button
                      onClick={() => setShowSnapForm(true)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Take Snapshot</span>
                    </button>
                  )}
                </div>

                {showSnapForm ? (
                  <form onSubmit={handleTakeSnapshot} className="space-y-4 pt-1">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Version No.</label>
                        <input
                          type="text"
                          required
                          value={versionNumber}
                          onChange={(e) => setVersionNumber(e.target.value)}
                          placeholder="e.g. 1.2.0"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Author Role</label>
                        <input
                          type="text"
                          disabled
                          value={userRole}
                          className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-400 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Changelog & Revision Summary</label>
                      <textarea
                        required
                        value={changelog}
                        onChange={(e) => setChangelog(e.target.value)}
                        placeholder="e.g. Initial import of fire-finance curriculum with fully localized quizzes."
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowSnapForm(false)}
                        className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs text-slate-600 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={snapping}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                      >
                        {snapping ? 'Snapping...' : 'Commit Revision'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-xs text-slate-500">
                    Snapshots capture full course state including module structures, lessons, block content types, assignments, and download resources. Restoring a version rolls back the working draft state.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Version History Trace list */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col h-[340px] justify-between">
              <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-100 pb-3 shrink-0">
                  <ListRestart className="w-4 h-4 text-indigo-500" />
                  <span>Version Snapshots</span>
                </h4>

                {loadingVersions ? (
                  <div className="py-8 text-center text-xs text-slate-400 flex-1 flex flex-col items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600 mb-2" />
                    <span>Loading snapshots...</span>
                  </div>
                ) : versions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 flex-1 flex flex-col items-center justify-center">
                    <span>No recorded point-in-time snapshots for this course yet.</span>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                    {versions.map((ver) => (
                      <div
                        key={ver.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[10px]">
                            v{ver.versionNumber}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(ver.exportedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-slate-600 leading-relaxed text-[11px] line-clamp-2" title={ver.changelog}>
                          {ver.changelog}
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-[10px] text-slate-400">By {ver.exportedBy}</span>
                          <button
                            onClick={() => handleRollback(ver)}
                            className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-semibold hover:bg-indigo-700 flex items-center space-x-0.5"
                            title="Restore snapshot"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>Rollback</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center space-x-1.5 shrink-0">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Rollbacks overwrite current draft structures. Use carefully to prevent discarding work in progress.
                </p>
              </div>
            </div>

            {/* Chronological Event Audit Log Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col h-[350px]">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-100 pb-3 shrink-0">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Publishing & Audit Logs</span>
              </h4>

              {loadingLogs ? (
                <div className="py-8 text-center text-xs text-slate-400 flex-1 flex flex-col items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-600 mb-2" />
                  <span>Loading audit trace...</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 flex-1 flex flex-col items-center justify-center">
                  <span>No recorded actions in the audit trail.</span>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto pr-1 flex-1 mt-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-white shadow-xs space-y-1.5 text-[11px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 uppercase tracking-wide">
                          {log.event}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-slate-600 leading-relaxed">{log.details}</p>

                      <div className="flex items-center justify-between pt-1 text-[9px] text-slate-400 border-t border-slate-100">
                        <span>Role: <strong className="text-slate-600">{log.performedBy}</strong></span>
                        {log.fromStatus && log.toStatus && (
                          <span className="bg-slate-100 text-slate-600 px-1 py-0.5 rounded-sm">
                            {log.fromStatus} → {log.toStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

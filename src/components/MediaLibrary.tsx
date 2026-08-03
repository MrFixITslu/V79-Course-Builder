import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { Media } from '../types/course-builder-v2';
import { Image as ImageIcon, Video, FileText, Music, Link, Trash2, Plus, Search, Filter, HardDrive, Info, AlertCircle, Loader2 } from 'lucide-react';

interface MediaLibraryProps {
  courses: Course[];
}

export function MediaLibrary({ courses }: MediaLibraryProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Add reference form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourseId, setNewCourseId] = useState(courses[0]?.id || '');
  const [name, setName] = useState('');
  const [fileType, setFileType] = useState('image');
  const [url, setUrl] = useState('');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, [selectedCourseId]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      if (selectedCourseId === 'all') {
        // Fetch media for all courses and consolidate
        const promises = courses.map((c) => fetch(`/api/courses/${c.id}/media`).then((r) => r.json()));
        const results = await Promise.all(promises);
        const consolidated = results.flat().filter(Boolean);
        setMediaList(consolidated);
      } else {
        const res = await fetch(`/api/courses/${selectedCourseId}/media`);
        if (res.ok) {
          const data = await res.json();
          setMediaList(data);
        }
      }
    } catch (err) {
      console.error('Failed to load media files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) {
      setFormError('Please provide both file name and address URL.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch(`/api/courses/${newCourseId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, fileType, url, fileSize })
      });

      if (!res.ok) throw new Error('Failed to register media file.');

      setName('');
      setUrl('');
      setFileSize('1.2 MB');
      setShowAddForm(false);
      fetchMedia();
    } catch (err: any) {
      setFormError(err.message || 'Media registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media reference?')) return;

    try {
      const res = await fetch(`/api/media/${mediaId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMedia();
      } else {
        alert('Failed to remove media file.');
      }
    } catch {
      alert('Error connecting to deletion endpoint.');
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return <Video className="w-5 h-5 text-rose-500" />;
      case 'audio':
        return <Music className="w-5 h-5 text-cyan-500" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-emerald-500" />;
      case 'pdf':
      case 'document':
        return <FileText className="w-5 h-5 text-amber-500" />;
      default:
        return <Link className="w-5 h-5 text-indigo-500" />;
    }
  };

  // Local filtering & search
  const filteredMedia = mediaList.filter((m) => {
    const matchesSearch = m.name?.toLowerCase().includes(search.toLowerCase()) || m.url?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || m.fileType?.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Media Library Registry</h2>
          <p className="text-xs text-slate-500 mt-0.5">Central authoring database for audios, videos, guides, and slide sheets.</p>
        </div>
        <button
          onClick={() => {
            if (courses.length === 0) {
              alert('Please create a course before adding media references.');
              return;
            }
            setShowAddForm(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Media File</span>
        </button>
      </div>

      {/* Register Media Reference Modal Form Overlay */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddMedia} className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-slate-950 text-base">Register Media Reference</h3>
            <p className="text-xs text-slate-500">Mappable attachment for content blocks and lesson resource hubs.</p>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">Associate Course</label>
                <select
                  value={newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">Media Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SIWM Volatility Calculation Guide"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">File Type</label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="video">Video URL</option>
                    <option value="audio">Audio URL</option>
                    <option value="image">Image File</option>
                    <option value="pdf">PDF / Slide Guide</option>
                    <option value="document">Document</option>
                    <option value="zip">ZIP Download</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">File Size Display</label>
                  <input
                    type="text"
                    required
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">Resource Address URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/... or cloud storage URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                {submitting ? 'Registering...' : 'Add Resource'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Control Filter Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-4 text-xs font-medium text-slate-700">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Filtering:</span>
        </div>

        {/* Filter per Course */}
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none w-full md:w-56"
        >
          <option value="all">All Mapped Courses ({courses.length})</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>

        {/* Filter per File Type */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none w-full md:w-40"
        >
          <option value="all">All Resource Types</option>
          <option value="video">Videos</option>
          <option value="audio">Audios</option>
          <option value="image">Images</option>
          <option value="pdf">PDFs</option>
          <option value="document">Documents</option>
          <option value="zip">ZIP Packages</option>
        </select>

        {/* Search media */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources by name or URL path..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3.5 py-1.5 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of items */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
          <span>Retrieving curriculum assets...</span>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <HardDrive className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-800 text-sm">No Assets Registered</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create content blocks containing media elements, or register file paths manually using the Add button.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map((media) => {
            const course = courses.find((c) => c.id === media.courseId);
            return (
              <div
                key={media.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-slate-100">
                      {getMediaIcon(media.fileType)}
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase">
                      {media.fileSize || 'N/A'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1" title={media.name}>
                      {media.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 block font-mono mt-0.5 truncate">
                      {media.url}
                    </span>
                  </div>

                  {course && (
                    <div className="pt-2 border-t border-slate-100 flex items-center space-x-1.5">
                      <Info className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] text-slate-500 font-medium truncate">
                        Mapped to: {course.title}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-slate-400">
                    {new Date(media.createdAt || Date.now()).toLocaleDateString()}
                  </span>

                  <div className="flex space-x-1.5">
                    <a
                      href={media.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded-md transition-colors"
                    >
                      Open Link
                    </a>
                    <button
                      onClick={() => handleDeleteMedia(media.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

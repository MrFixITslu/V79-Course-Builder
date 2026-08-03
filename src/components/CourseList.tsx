import React, { useState } from 'react';
import { Course } from '../types';
import { BookOpen, Search, Filter, Plus, Edit, Play, Download, Trash2, Globe, Clock, User, Copy, Archive, ChevronLeft, ChevronRight } from 'lucide-react';

interface CourseListProps {
  courses: Course[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedAppCategory: string;
  onSelectCourse: (course: Course) => void;
  onPreviewCourse: (course: Course) => void;
  onExportCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onNewCourse: () => void;
  onRefreshCourses?: () => void;
}

export function CourseList({
  courses,
  searchQuery,
  setSearchQuery,
  selectedAppCategory,
  onSelectCourse,
  onPreviewCourse,
  onExportCourse,
  onDeleteCourse,
  onNewCourse,
  onRefreshCourses
}: CourseListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  const safeCourses = Array.isArray(courses) ? courses : [];

  // Filtering Logic
  const filteredCourses = safeCourses.filter((course) => {
    if (!course) return false;
    const matchesSearch =
      (course.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.shortDescription || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.instructor || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedAppCategory === 'All Applications' || course.category === selectedAppCategory;

    const matchesStatus = statusFilter === 'All' || course.status === statusFilter;
    const matchesDifficulty = difficultyFilter === 'All' || course.difficultyLevel === difficultyFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesDifficulty;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDuplicateCourse = async (course: Course) => {
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${course.title} (Copy)`,
          shortDescription: course.shortDescription,
          fullDescription: course.fullDescription,
          category: course.category,
          difficultyLevel: course.difficultyLevel,
          instructor: course.instructor,
          courseVersion: course.courseVersion,
          thumbnail: course.thumbnail,
          estimatedDuration: course.estimatedDuration,
          prerequisites: course.prerequisites || [],
          learning_objectives: course.learningObjectives || [],
          status: 'Draft',
          pricingType: course.pricingType || 'free',
          price: course.price || 0
        })
      });

      if (res.ok) {
        if (onRefreshCourses) onRefreshCourses();
      } else {
        alert('Failed to duplicate course.');
      }
    } catch (e) {
      console.error(e);
      alert('Error duplicating course.');
    }
  };

  const handleArchiveCourse = async (courseId: string) => {
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Archived' })
      });

      if (res.ok) {
        if (onRefreshCourses) onRefreshCourses();
      } else {
        alert('Failed to archive course.');
      }
    } catch (e) {
      console.error(e);
      alert('Error archiving course.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Draft':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Draft</span>;
      case 'Review':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">In Review</span>;
      case 'Ready for Upload':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Ready for Upload</span>;
      case 'Uploaded':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">Uploaded</span>;
      case 'Imported':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">Imported</span>;
      case 'Published':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Published</span>;
      case 'Archived':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">Archived</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Course Catalog</h2>
          <p className="text-xs text-slate-500">
            {selectedAppCategory === 'All Applications' ? 'Showing all V79 Academy courses' : `Showing courses for ${selectedAppCategory}`}
          </p>
        </div>
        <button
          onClick={onNewCourse}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 shadow-md transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Course</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600 uppercase">Filters:</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="All">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Review">In Review</option>
          <option value="Ready for Upload">Ready for Upload</option>
          <option value="Uploaded">Uploaded</option>
          <option value="Imported">Imported</option>
          <option value="Published">Published</option>
          <option value="Archived">Archived</option>
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) => {
            setDifficultyFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="All">All Difficulties</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        {/* Local Search input within filter bar */}
        <div className="relative flex-1 min-w-[180px] max-w-xs md:ml-4">
          <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search catalog courses..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="ml-auto text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{filteredCourses.length}</span> courses
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
          >
            <div className="relative h-44 overflow-hidden bg-slate-100">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                {getStatusBadge(course.status)}
              </div>
              <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                {course.category}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                  <span className="flex items-center"><Clock className="w-3 mr-1" /> {course.estimatedDuration}</span>
                  <span>•</span>
                  <span className="flex items-center font-medium"><User className="w-3 mr-1" /> {course.instructor}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {course.shortDescription}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onSelectCourse(course)}
                    className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                    title="Edit Course"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onPreviewCourse(course)}
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                    title="Student Preview"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onExportCourse(course)}
                    className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                    title="Export Package"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicateCourse(course)}
                    className="p-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                    title="Duplicate Course"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {course.status !== 'Archived' && (
                    <button
                      onClick={() => handleArchiveCourse(course.id)}
                      className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Archive Course"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${course.title}"?`)) {
                      onDeleteCourse(course.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">No courses found</h4>
          <p className="text-xs text-slate-500">Try adjusting your search query or application filter.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs font-semibold text-slate-600">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

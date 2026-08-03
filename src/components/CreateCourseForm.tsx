import React, { useState } from 'react';
import { Course, AppCategory, DifficultyLevel, CourseStatus, PricingType } from '../types';
import { PlusCircle, ArrowLeft, Image as ImageIcon, Sparkles, BookOpen, Clock, Award, ShieldCheck } from 'lucide-react';

interface CreateCourseFormProps {
  onBack: () => void;
  onCourseCreated: (course: Course) => void;
  selectedAppCategory: string;
}

export function CreateCourseForm({ onBack, onCourseCreated, selectedAppCategory }: CreateCourseFormProps) {
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [category, setCategory] = useState<AppCategory>(
    (selectedAppCategory !== 'All Applications' ? selectedAppCategory : 'Fire Finance Pro (FFPRO2)') as AppCategory
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Intermediate');
  const [instructor, setInstructor] = useState('V79 Academy Lead Author');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80');
  const [duration, setDuration] = useState('4.0 hours');
  const [prerequisitesText, setPrerequisitesText] = useState('Basic V79 Application Knowledge');
  const [objectivesText, setObjectivesText] = useState('Understand core workflows\nExecute advanced configuration tasks');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Course title is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    const prerequisites = prerequisitesText
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const learningObjectives = objectivesText
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          shortDescription: shortDescription.trim() || 'Enter course short description here...',
          fullDescription: fullDescription.trim() || 'Enter comprehensive course overview here...',
          category,
          difficultyLevel: difficulty,
          instructor,
          courseVersion: '1.0.0',
          thumbnail,
          estimatedDuration: duration,
          prerequisites,
          learning_objectives: learningObjectives,
          status: 'Draft',
          pricingType: 'free',
          price: 0
        })
      });

      if (!res.ok) {
        throw new Error('Failed to create course. Please try again.');
      }

      const createdCourse = await res.json();
      onCourseCreated(createdCourse);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Create New Course</h2>
            <p className="text-xs text-slate-500">Design a premium training curriculum for the V79 platform</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <BookOpen className="w-5 h-5" />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Core Fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Course Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Advanced Portfolio Optimization in SIWM"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Application Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AppCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Fire Finance Pro (FFPRO2)">Fire Finance Pro (FFPRO2)</option>
                  <option value="SIWM">SIWM</option>
                  <option value="Tiquet">Tiquet</option>
                  <option value="KashDash">KashDash</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Instructor Name</label>
                <input
                  type="text"
                  required
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Estimated Duration</label>
                <input
                  type="text"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 4.5 hours"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Course Thumbnail URL</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <ImageIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="url"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setThumbnail(`https://images.unsplash.com/photo-${['1516321318423-f06f85e504b3', '1551836022-d5d88e9218df', '1522202176988-66273c2fd55f'][Math.floor(Math.random() * 3)]}?auto=format&fit=crop&w=800&q=80`)}
                  className="px-3 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-all shrink-0"
                >
                  Roll Image
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Descriptions & Objectives */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Short Summary</label>
              <textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="A high-level summary of the course displayed on the card..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Learning Objectives (one per line)</label>
              <textarea
                value={objectivesText}
                onChange={(e) => setObjectivesText(e.target.value)}
                placeholder="Enter core takeaways that students will master..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Prerequisites (one per line)</label>
              <textarea
                value={prerequisitesText}
                onChange={(e) => setPrerequisitesText(e.target.value)}
                placeholder="Enter prerequisite experience or coursework..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Full Overview */}
        <div className="space-y-1.5 pt-2">
          <label className="block text-xs font-semibold text-slate-700">Full Course Description & Overview</label>
          <textarea
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            placeholder="Introduce the training curriculum in-depth..."
            rows={4}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/10 transition-all flex items-center space-x-2"
          >
            <span>{submitting ? 'Creating Course...' : 'Create Course'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

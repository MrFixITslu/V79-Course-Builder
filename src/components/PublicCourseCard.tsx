import React from 'react';
import { Course } from '../types';
import { Clock, User, Award, BookOpen, ChevronRight, Lock, CheckCircle2 } from 'lucide-react';

interface PublicCourseCardProps {
  key?: React.Key;
  course: Course;
  isEnrolled?: boolean;
  onViewDetails: (course: Course) => void;
  onEnrollOrContinue: (course: Course) => void;
  moduleCount?: number;
  lessonCount?: number;
}

export function PublicCourseCard({
  course,
  isEnrolled = false,
  onViewDetails,
  onEnrollOrContinue,
  moduleCount,
  lessonCount
}: PublicCourseCardProps) {
  const isPaid = course.pricingType === 'premium' || (typeof course.price === 'number' && course.price > 0);
  const priceDisplay = isPaid ? `$${(course.price || 49.99).toFixed(2)}` : 'FREE';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1">
      {/* Card Header Image */}
      <div 
        className="relative h-48 overflow-hidden bg-slate-900 cursor-pointer"
        onClick={() => onViewDetails(course)}
      >
        <img
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span className="bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-xs">
            {course.category}
          </span>
          <span className="bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] font-semibold px-2 py-1 rounded-md">
            {course.difficultyLevel || 'Intermediate'}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          {isEnrolled ? (
            <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
              <span>Enrolled</span>
            </span>
          ) : (
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm ${
              isPaid 
                ? 'bg-amber-500 text-slate-950' 
                : 'bg-emerald-500 text-white'
            }`}>
              {priceDisplay}
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white/90 text-[11px] font-medium">
          <span className="flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded text-[10px]">
            <Clock className="w-3 h-3 text-indigo-300" />
            {course.estimatedDuration || '3.5 hours'}
          </span>
          {(moduleCount !== undefined || lessonCount !== undefined) && (
            <span className="flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded text-[10px]">
              <BookOpen className="w-3 h-3 text-indigo-300" />
              {moduleCount ? `${moduleCount} modules` : ''} {lessonCount ? `• ${lessonCount} lessons` : ''}
            </span>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center font-medium text-slate-600">
              <User className="w-3 h-3 mr-1 text-slate-400" /> {course.instructor || 'V79 Academy Instructor'}
            </span>
            <span className="text-[10px] text-slate-400">v{course.courseVersion || '1.0'}</span>
          </div>

          <h3 
            onClick={() => onViewDetails(course)}
            className="font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer"
          >
            {course.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {course.shortDescription || 'Master key concepts with structured video lessons, practical assignments, and interactive assessments.'}
          </p>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={() => onViewDetails(course)}
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
          >
            <span>Course Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onEnrollOrContinue(course)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
              isEnrolled
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                : 'bg-slate-900 hover:bg-indigo-600 text-white'
            }`}
          >
            {isEnrolled ? (
              <>
                <span>Continue Course</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>{isPaid ? `Enroll (${priceDisplay})` : 'Start Learning'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

import { CourseStatus as OriginalCourseStatus, PricingType } from '../types';

// Extend course statuses to support: 'Draft' | 'Imported' | 'Review' | 'Published' | 'Archived'
// For backward compatibility, we can map old 'Uploaded' and 'Ready for Upload' to 'Published' or treat them as valid strings
export type CourseBuilderStatus = 'Draft' | 'Imported' | 'Review' | 'Published' | 'Archived';

export type ContentBlockType =
  | 'Video'
  | 'Markdown'
  | 'Rich Text'
  | 'Image'
  | 'Audio'
  | 'PDF'
  | 'Download'
  | 'Quiz'
  | 'Assignment'
  | 'Code'
  | 'Checklist'
  | 'Divider'
  | 'Callout';

export interface ContentBlock {
  id: string;
  lessonId: string;
  type: ContentBlockType;
  orderNumber: number;
  contentData: any; // Block specific fields
  createdAt: string;
  updatedAt: string;
}

// Media schema definition
export interface Media {
  id: string;
  courseId: string;
  name: string;
  fileType: string; // e.g., 'video', 'audio', 'image', 'pdf', 'document', 'zip'
  url: string;
  fileSize: string;
  createdAt: string;
}

// Assignment schema definition
export interface Assignment {
  id: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  title: string;
  description: string;
  maxPoints: number;
  submissionType: 'file' | 'text' | 'url' | 'none';
  createdAt: string;
  updatedAt: string;
}

// Download schema definition
export interface Download {
  id: string;
  courseId: string;
  lessonId?: string;
  name: string;
  fileType: string;
  url: string;
  fileSize: string;
  createdAt: string;
}

// Import History schema definition
export interface ImportHistory {
  id: string;
  importedBy: string;
  sourceFileName: string;
  status: 'Pending' | 'Success' | 'Failed';
  errorMessage?: string;
  importedCourseId?: string;
  importedAt: string;
}

// Course Version schema definition
export interface CourseVersion {
  id: string; // Serial/unique string
  courseId: string;
  versionNumber: string;
  changelog: string;
  snapshot: {
    course: any;
    modules: any[];
    lessons: any[];
    contentBlocks: any[];
    quizzes: any[];
    assignments: any[];
    downloads: any[];
  };
  exportedBy: string;
  exportedAt: string;
}

// Content Block Data Payload definitions
export interface VideoBlockData {
  videoUrl: string;
  title?: string;
  duration?: string;
  thumbnailUrl?: string;
  provider?: 'w3c' | 'youtube' | 'vimeo' | 'custom';
}

export interface MarkdownBlockData {
  markdown: string;
}

export interface RichTextBlockData {
  html: string;
}

export interface ImageBlockData {
  imageUrl: string;
  altText?: string;
  caption?: string;
}

export interface AudioBlockData {
  audioUrl: string;
  title?: string;
  duration?: string;
}

export interface PDFBlockData {
  pdfUrl: string;
  title?: string;
  fileSize?: string;
}

export interface DownloadBlockData {
  downloadId: string; // Reference to a Download entity
  name: string;
  url: string;
  fileSize?: string;
}

export interface QuizBlockData {
  quizId: string; // Reference to a Quiz entity
  title: string;
}

export interface AssignmentBlockData {
  assignmentId: string; // Reference to an Assignment entity
  title: string;
  maxPoints: number;
}

export interface CodeBlockData {
  code: string;
  language: string;
  lineNumbers?: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface ChecklistBlockData {
  items: ChecklistItem[];
}

export interface DividerBlockData {
  style: 'solid' | 'dashed' | 'dotted';
  color?: string;
}

export interface CalloutBlockData {
  text: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title?: string;
}

export interface PublishingLog {
  id: string;
  courseId: string;
  courseTitle: string;
  event: string; // e.g., 'Status Changed', 'Published Sync', 'Restore Point Rollback', 'Course Duplicated', 'Draft Deleted'
  fromStatus: string;
  toStatus: string;
  performedBy: 'Admin' | 'Instructor' | 'Student';
  timestamp: string;
  details?: string;
}


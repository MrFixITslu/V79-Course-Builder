import fs from 'fs';
import path from 'path';
import {
  ContentBlock,
  Media,
  Assignment,
  Download,
  ImportHistory,
  CourseVersion,
  CourseBuilderStatus,
  ContentBlockType,
  PublishingLog
} from '../types/course-builder-v2';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Interface representing our full Database shape inside store.json
export interface StoreSchema {
  courses: any[];
  modules: any[];
  lessons: any[];
  quizzes: any[];
  assets: any[]; // Old assets collection (retained for full backward compatibility)
  contentBlocks: ContentBlock[];
  media: Media[];
  assignments: Assignment[];
  downloads: Download[];
  courseVersions: CourseVersion[];
  importHistories: ImportHistory[];
  publishingLogs: PublishingLog[];
}

// ---------------------------------------------------------------------------
// 1. Database Migrations & Initializer
// ---------------------------------------------------------------------------
export function initAndMigrateDb(): StoreSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let db: any = {};
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      db = JSON.parse(raw);
    } catch (e) {
      console.error('[Migrations] Failed to read store.json, creating a new one', e);
    }
  }

  // Define defaults for all required tables to ensure full schema alignment
  let migrated = false;

  const ensureArray = (key: keyof StoreSchema) => {
    if (!Array.isArray(db[key])) {
      db[key] = [];
      migrated = true;
    }
  };

  ensureArray('courses');
  ensureArray('modules');
  ensureArray('lessons');
  ensureArray('quizzes');
  ensureArray('assets');
  ensureArray('contentBlocks');
  ensureArray('media');
  ensureArray('assignments');
  ensureArray('downloads');
  ensureArray('courseVersions');
  ensureArray('importHistories');
  ensureArray('publishingLogs');

  // Convert old statuses to modern statuses if necessary for backward compatibility
  db.courses.forEach((course: any) => {
    if (!course.status) {
      course.status = 'Draft';
      migrated = true;
    } else if (course.status === 'Uploaded' || course.status === 'Ready for Upload') {
      // Retain or align with Published or standard status safely
      // Let's keep existing statuses and allow additional 'Imported' | 'Published' | 'Archived'
    }
    if (!course.courseVersion) {
      course.courseVersion = '1.0.0';
      migrated = true;
    }
  });

  if (migrated || !fs.existsSync(DATA_FILE)) {
    saveDb(db as StoreSchema);
    console.log('[Migrations] Database migrated and synchronized successfully.');
  }

  return db as StoreSchema;
}

export function saveDb(data: StoreSchema) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Database] Failed to save DB to file:', e);
  }
}

// Load DB helper
export function loadDb(): StoreSchema {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as StoreSchema;
    }
  } catch (e) {
    console.error('[Database] Failed to read DB file:', e);
  }
  return initAndMigrateDb();
}

// ---------------------------------------------------------------------------
// 2. Repositories
// ---------------------------------------------------------------------------

export class CourseRepository {
  static findAll(): any[] {
    return loadDb().courses;
  }

  static findById(id: string): any | null {
    const db = loadDb();
    return db.courses.find((c) => c.id === id) || null;
  }

  static create(course: any): any {
    const db = loadDb();
    db.courses.push(course);
    saveDb(db);
    return course;
  }

  static update(id: string, updates: Partial<any>): any | null {
    const db = loadDb();
    const idx = db.courses.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    db.courses[idx] = {
      ...db.courses[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveDb(db);
    return db.courses[idx];
  }

  static delete(id: string): boolean {
    const db = loadDb();
    const originalLength = db.courses.length;
    db.courses = db.courses.filter((c) => c.id !== id);
    if (db.courses.length === originalLength) return false;
    saveDb(db);
    return true;
  }
}

export class ModuleRepository {
  static findAllByCourseId(courseId: string): any[] {
    const db = loadDb();
    return db.modules
      .filter((m) => m.courseId === courseId)
      .sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0));
  }

  static findById(id: string): any | null {
    const db = loadDb();
    return db.modules.find((m) => m.id === id) || null;
  }

  static create(mod: any): any {
    const db = loadDb();
    db.modules.push(mod);
    saveDb(db);
    return mod;
  }

  static update(id: string, updates: Partial<any>): any | null {
    const db = loadDb();
    const idx = db.modules.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    db.modules[idx] = { ...db.modules[idx], ...updates };
    saveDb(db);
    return db.modules[idx];
  }

  static delete(id: string): boolean {
    const db = loadDb();
    const originalLength = db.modules.length;
    db.modules = db.modules.filter((m) => m.id !== id);
    if (db.modules.length === originalLength) return false;
    saveDb(db);
    return true;
  }
}

export class LessonRepository {
  static findAllByModuleId(moduleId: string): any[] {
    const db = loadDb();
    return db.lessons
      .filter((l) => l.moduleId === moduleId)
      .sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0));
  }

  static findAllByCourseId(courseId: string): any[] {
    const db = loadDb();
    return db.lessons.filter((l) => l.courseId === courseId);
  }

  static findById(id: string): any | null {
    const db = loadDb();
    return db.lessons.find((l) => l.id === id) || null;
  }

  static create(lesson: any): any {
    const db = loadDb();
    db.lessons.push(lesson);
    saveDb(db);
    return lesson;
  }

  static update(id: string, updates: Partial<any>): any | null {
    const db = loadDb();
    const idx = db.lessons.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    db.lessons[idx] = { ...db.lessons[idx], ...updates };
    saveDb(db);
    return db.lessons[idx];
  }

  static delete(id: string): boolean {
    const db = loadDb();
    const originalLength = db.lessons.length;
    db.lessons = db.lessons.filter((l) => l.id !== id);
    if (db.lessons.length === originalLength) return false;
    saveDb(db);
    return true;
  }
}

export class ContentBlockRepository {
  static findAllByLessonId(lessonId: string): ContentBlock[] {
    const db = loadDb();
    return db.contentBlocks
      .filter((cb) => cb.lessonId === lessonId)
      .sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0));
  }

  static findById(id: string): ContentBlock | null {
    const db = loadDb();
    return db.contentBlocks.find((cb) => cb.id === id) || null;
  }

  static create(block: ContentBlock): ContentBlock {
    const db = loadDb();
    db.contentBlocks.push(block);
    saveDb(db);
    return block;
  }

  static update(id: string, updates: Partial<ContentBlock>): ContentBlock | null {
    const db = loadDb();
    const idx = db.contentBlocks.findIndex((cb) => cb.id === id);
    if (idx === -1) return null;
    db.contentBlocks[idx] = {
      ...db.contentBlocks[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveDb(db);
    return db.contentBlocks[idx];
  }

  static delete(id: string): boolean {
    const db = loadDb();
    const originalLength = db.contentBlocks.length;
    db.contentBlocks = db.contentBlocks.filter((cb) => cb.id !== id);
    if (db.contentBlocks.length === originalLength) return false;
    saveDb(db);
    return true;
  }

  static deleteByLessonId(lessonId: string): void {
    const db = loadDb();
    db.contentBlocks = db.contentBlocks.filter((cb) => cb.lessonId !== lessonId);
    saveDb(db);
  }
}

export class MediaRepository {
  static findAllByCourseId(courseId: string): Media[] {
    const db = loadDb();
    return db.media.filter((m) => m.courseId === courseId);
  }

  static findById(id: string): Media | null {
    const db = loadDb();
    return db.media.find((m) => m.id === id) || null;
  }

  static create(media: Media): Media {
    const db = loadDb();
    db.media.push(media);
    saveDb(db);
    return media;
  }

  static delete(id: string): boolean {
    const db = loadDb();
    const originalLength = db.media.length;
    db.media = db.media.filter((m) => m.id !== id);
    if (db.media.length === originalLength) return false;
    saveDb(db);
    return true;
  }
}

export class QuizRepository {
  static findAllByLessonId(lessonId: string): any[] {
    const db = loadDb();
    return db.quizzes.filter((q) => q.lessonId === lessonId);
  }

  static findById(id: string): any | null {
    const db = loadDb();
    return db.quizzes.find((q) => q.id === id) || null;
  }

  static create(quiz: any): any {
    const db = loadDb();
    db.quizzes.push(quiz);
    saveDb(db);
    return quiz;
  }

  static update(id: string, updates: Partial<any>): any | null {
    const db = loadDb();
    const idx = db.quizzes.findIndex((q) => q.id === id);
    if (idx === -1) return null;
    db.quizzes[idx] = { ...db.quizzes[idx], ...updates };
    saveDb(db);
    return db.quizzes[idx];
  }

  static delete(id: string): boolean {
    const db = loadDb();
    const originalLength = db.quizzes.length;
    db.quizzes = db.quizzes.filter((q) => q.id !== id);
    if (db.quizzes.length === originalLength) return false;
    saveDb(db);
    return true;
  }
}

export class AssignmentRepository {
  static findAllByCourseId(courseId: string): Assignment[] {
    const db = loadDb();
    return db.assignments.filter((a) => a.courseId === courseId);
  }

  static findById(id: string): Assignment | null {
    const db = loadDb();
    return db.assignments.find((a) => a.id === id) || null;
  }

  static create(assignment: Assignment): Assignment {
    const db = loadDb();
    db.assignments.push(assignment);
    saveDb(db);
    return assignment;
  }

  static update(id: string, updates: Partial<Assignment>): Assignment | null {
    const db = loadDb();
    const idx = db.assignments.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    db.assignments[idx] = {
      ...db.assignments[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveDb(db);
    return db.assignments[idx];
  }

  static delete(id: string): boolean {
    const db = loadDb();
    const originalLength = db.assignments.length;
    db.assignments = db.assignments.filter((a) => a.id !== id);
    if (db.assignments.length === originalLength) return false;
    saveDb(db);
    return true;
  }
}

export class DownloadRepository {
  static findAllByCourseId(courseId: string): Download[] {
    const db = loadDb();
    return db.downloads.filter((d) => d.courseId === courseId);
  }

  static findById(id: string): Download | null {
    const db = loadDb();
    return db.downloads.find((d) => d.id === id) || null;
  }

  static create(download: Download): Download {
    const db = loadDb();
    db.downloads.push(download);
    saveDb(db);
    return download;
  }

  static update(id: string, updates: Partial<Download>): Download | null {
    const db = loadDb();
    const idx = db.downloads.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    db.downloads[idx] = { ...db.downloads[idx], ...updates };
    saveDb(db);
    return db.downloads[idx];
  }

  static delete(id: string): boolean {
    const db = loadDb();
    const originalLength = db.downloads.length;
    db.downloads = db.downloads.filter((d) => d.id !== id);
    if (db.downloads.length === originalLength) return false;
    saveDb(db);
    return true;
  }
}

export class CourseVersionRepository {
  static findAllByCourseId(courseId: string): CourseVersion[] {
    const db = loadDb();
    return db.courseVersions
      .filter((cv) => cv.courseId === courseId)
      .sort((a, b) => new Date(b.exportedAt).getTime() - new Date(a.exportedAt).getTime());
  }

  static findById(id: string): CourseVersion | null {
    const db = loadDb();
    return db.courseVersions.find((cv) => cv.id === id) || null;
  }

  static create(cv: CourseVersion): CourseVersion {
    const db = loadDb();
    db.courseVersions.push(cv);
    saveDb(db);
    return cv;
  }
}

export class ImportHistoryRepository {
  static findAll(): ImportHistory[] {
    const db = loadDb();
    return db.importHistories.sort(
      (a, b) => new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime()
    );
  }

  static findById(id: string): ImportHistory | null {
    const db = loadDb();
    return db.importHistories.find((ih) => ih.id === id) || null;
  }

  static create(history: ImportHistory): ImportHistory {
    const db = loadDb();
    db.importHistories.push(history);
    saveDb(db);
    return history;
  }

  static update(id: string, updates: Partial<ImportHistory>): ImportHistory | null {
    const db = loadDb();
    const idx = db.importHistories.findIndex((ih) => ih.id === id);
    if (idx === -1) return null;
    db.importHistories[idx] = { ...db.importHistories[idx], ...updates };
    saveDb(db);
    return db.importHistories[idx];
  }
}

// ---------------------------------------------------------------------------
// 3. Service Layer
// ---------------------------------------------------------------------------

export class CourseBuilderService {
  /**
   * Snapshot a course and persist as a new Version record.
   */
  static createVersion(courseId: string, versionNumber: string, changelog: string, exportedBy: string): CourseVersion {
    const course = CourseRepository.findById(courseId);
    if (!course) throw new Error('Course not found');

    const db = loadDb();
    const modules = db.modules.filter((m) => m.courseId === courseId);
    const lessons = db.lessons.filter((l) => l.courseId === courseId);
    const lessonIds = lessons.map((l) => l.id);

    const contentBlocks = db.contentBlocks.filter((cb) => lessonIds.includes(cb.lessonId));
    const quizzes = db.quizzes.filter((q) => lessonIds.includes(q.lessonId));
    const assignments = db.assignments.filter((a) => a.courseId === courseId);
    const downloads = db.downloads.filter((d) => d.courseId === courseId);

    const snapshot = {
      course: JSON.parse(JSON.stringify(course)),
      modules: JSON.parse(JSON.stringify(modules)),
      lessons: JSON.parse(JSON.stringify(lessons)),
      contentBlocks: JSON.parse(JSON.stringify(contentBlocks)),
      quizzes: JSON.parse(JSON.stringify(quizzes)),
      assignments: JSON.parse(JSON.stringify(assignments)),
      downloads: JSON.parse(JSON.stringify(downloads))
    };

    const newVersion: CourseVersion = {
      id: `ver-${Date.now()}`,
      courseId,
      versionNumber,
      changelog,
      snapshot,
      exportedBy: exportedBy || 'Administrator',
      exportedAt: new Date().toISOString()
    };

    // Update the course's own version attribute
    CourseRepository.update(courseId, { courseVersion: versionNumber });

    return CourseVersionRepository.create(newVersion);
  }

  /**
   * Rollback a course to its snapshot version.
   */
  static rollbackToVersion(courseId: string, versionId: string): any {
    const cv = CourseVersionRepository.findById(versionId);
    if (!cv || cv.courseId !== courseId) throw new Error('Version snapshot not found');

    const db = loadDb();

    // 1. Remove current elements
    db.courses = db.courses.filter((c) => c.id !== courseId);
    db.modules = db.modules.filter((m) => m.courseId !== courseId);
    db.lessons = db.lessons.filter((l) => l.courseId !== courseId);

    const lessonIds = cv.snapshot.lessons.map((l) => l.id);
    db.contentBlocks = db.contentBlocks.filter((cb) => !lessonIds.includes(cb.lessonId));
    db.quizzes = db.quizzes.filter((q) => !lessonIds.includes(q.lessonId));
    db.assignments = db.assignments.filter((a) => a.courseId !== courseId);
    db.downloads = db.downloads.filter((d) => d.courseId !== courseId);

    // 2. Re-insert snapshots
    db.courses.push(cv.snapshot.course);
    db.modules.push(...cv.snapshot.modules);
    db.lessons.push(...cv.snapshot.lessons);
    db.contentBlocks.push(...cv.snapshot.contentBlocks);
    db.quizzes.push(...cv.snapshot.quizzes);
    db.assignments.push(...cv.snapshot.assignments);
    db.downloads.push(...cv.snapshot.downloads);

    // Sync back version string in the course
    const targetIdx = db.courses.findIndex((c) => c.id === courseId);
    if (targetIdx !== -1) {
      db.courses[targetIdx].courseVersion = cv.versionNumber;
    }

    saveDb(db);
    return cv.snapshot.course;
  }

  /**
   * Create content block with automatic order_number
   */
  static addContentBlock(lessonId: string, type: ContentBlockType, contentData: any): ContentBlock {
    const existing = ContentBlockRepository.findAllByLessonId(lessonId);
    const orderNumber = existing.length > 0 ? Math.max(...existing.map((e) => e.orderNumber)) + 1 : 1;

    const block: ContentBlock = {
      id: `cb-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      lessonId,
      type,
      orderNumber,
      contentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return ContentBlockRepository.create(block);
  }

  /**
   * Reorder block list within a lesson
   */
  static reorderContentBlocks(lessonId: string, blockIdsInOrder: string[]): ContentBlock[] {
    const db = loadDb();
    let updatedCount = 0;

    db.contentBlocks.forEach((block) => {
      if (block.lessonId === lessonId) {
        const idx = blockIdsInOrder.indexOf(block.id);
        if (idx !== -1) {
          block.orderNumber = idx + 1;
          block.updatedAt = new Date().toISOString();
          updatedCount++;
        }
      }
    });

    if (updatedCount > 0) {
      saveDb(db);
    }

    return ContentBlockRepository.findAllByLessonId(lessonId);
  }

  /**
   * Complete Course JSON Package import with historical logging
   */
  static importCoursePackage(packageData: any, importedBy: string, sourceFileName: string): ImportHistory {
    const historyId = `imp-${Date.now()}`;
    const initialHistory: ImportHistory = {
      id: historyId,
      importedBy,
      sourceFileName,
      status: 'Pending',
      importedAt: new Date().toISOString()
    };

    ImportHistoryRepository.create(initialHistory);

    try {
      const courseObj = packageData.course || packageData['course.json'];
      if (!courseObj || !courseObj.title) {
        throw new Error('Invalid course package: Course metadata block missing or corrupted');
      }

      const db = loadDb();

      // Ensure unique course ID
      const courseId = courseObj.id || `course-${Date.now()}`;
      courseObj.id = courseId;
      courseObj.status = 'Imported'; // Required Course Status on successful imports

      // Wipe previous course footprint to cleanly replace
      db.courses = db.courses.filter((c) => c.id !== courseId);
      db.modules = db.modules.filter((m) => m.courseId !== courseId);
      db.lessons = db.lessons.filter((l) => l.courseId !== courseId);
      db.assignments = db.assignments.filter((a) => a.courseId !== courseId);
      db.downloads = db.downloads.filter((d) => d.courseId !== courseId);

      db.courses.push(courseObj);

      // Import Modules & Lessons cleanly
      const packageModules = packageData.modules || [];
      packageModules.forEach((mod: any, mIdx: number) => {
        const modId = mod.id || `mod-${Date.now()}-${mIdx}`;
        const lessonsInMod = mod.lessons || [];

        // Save module
        const cleanMod = {
          id: modId,
          courseId,
          title: mod.title || `Module ${mIdx + 1}`,
          description: mod.description || '',
          orderNumber: mod.orderNumber ?? (mIdx + 1)
        };
        db.modules.push(cleanMod);

        lessonsInMod.forEach((les: any, lIdx: number) => {
          const lesId = les.id || `les-${Date.now()}-${mIdx}-${lIdx}`;
          const cleanLesson = {
            id: lesId,
            moduleId: modId,
            courseId,
            title: les.title || `Lesson ${lIdx + 1}`,
            description: les.description || '',
            learning_objectives: les.learning_objectives || les.learningObjectives || [],
            estimatedTime: les.estimatedTime || '20 mins',
            lessonContent: les.lessonContent || les.lesson_content || '',
            videoUrl: les.videoUrl || '',
            audioUrl: les.audioUrl || '',
            imageUrls: les.imageUrls || [],
            downloads: les.downloads || [],
            exercisePrompt: les.exercisePrompt || '',
            orderNumber: les.orderNumber ?? (lIdx + 1)
          };
          db.lessons.push(cleanLesson);

          // If content blocks exist, push them
          if (Array.isArray(les.contentBlocks)) {
            db.contentBlocks = db.contentBlocks.filter((cb) => cb.lessonId !== lesId);
            les.contentBlocks.forEach((cb: any, cbIdx: number) => {
              db.contentBlocks.push({
                id: cb.id || `cb-${Date.now()}-${mIdx}-${lIdx}-${cbIdx}`,
                lessonId: lesId,
                type: cb.type,
                orderNumber: cb.orderNumber ?? (cbIdx + 1),
                contentData: cb.contentData,
                createdAt: cb.createdAt || new Date().toISOString(),
                updatedAt: cb.updatedAt || new Date().toISOString()
              });
            });
          }
        });
      });

      // Import standalone Quizzes if present
      const packageQuizzes = packageData.quizzes || [];
      packageQuizzes.forEach((quiz: any) => {
        const quizId = quiz.id || `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        db.quizzes = db.quizzes.filter((q) => q.id !== quizId && q.lessonId !== quiz.lessonId);
        db.quizzes.push({
          id: quizId,
          lessonId: quiz.lessonId,
          title: quiz.title || 'Lesson Assessment',
          passingScore: quiz.passingScore || 80,
          questions: quiz.questions || []
        });
      });

      // Import standalone Assignments if present
      const packageAssignments = packageData.assignments || [];
      packageAssignments.forEach((assign: any, aIdx: number) => {
        db.assignments.push({
          id: assign.id || `assign-${Date.now()}-${aIdx}`,
          courseId,
          moduleId: assign.moduleId,
          lessonId: assign.lessonId,
          title: assign.title || 'New Assignment',
          description: assign.description || '',
          maxPoints: assign.maxPoints || 100,
          submissionType: assign.submissionType || 'file',
          createdAt: assign.createdAt || new Date().toISOString(),
          updatedAt: assign.updatedAt || new Date().toISOString()
        });
      });

      // Import standalone Downloads if present
      const packageDownloads = packageData.downloads || [];
      packageDownloads.forEach((dl: any, dIdx: number) => {
        db.downloads.push({
          id: dl.id || `dl-${Date.now()}-${dIdx}`,
          courseId,
          lessonId: dl.lessonId,
          name: dl.name || 'Resource File',
          fileType: dl.fileType || 'pdf',
          url: dl.url || '#',
          fileSize: dl.fileSize || '1.0 MB',
          createdAt: dl.createdAt || new Date().toISOString()
        });
      });

      saveDb(db);

      // Log success in history record
      const updatedHistory = ImportHistoryRepository.update(historyId, {
        status: 'Success',
        importedCourseId: courseId
      });

      return updatedHistory!;
    } catch (err: any) {
      console.error('[Import] Failed to import package:', err);
      const updatedHistory = ImportHistoryRepository.update(historyId, {
        status: 'Failed',
        errorMessage: err.message || 'Unknown import parsing error'
      });
      return updatedHistory!;
    }
  }
}

export class PublishingLogRepository {
  static findAll(): PublishingLog[] {
    const db = loadDb();
    return (db.publishingLogs || []).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static findAllByCourseId(courseId: string): PublishingLog[] {
    const db = loadDb();
    return (db.publishingLogs || [])
      .filter((log) => log.courseId === courseId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static create(log: Omit<PublishingLog, 'id' | 'timestamp'>): PublishingLog {
    const db = loadDb();
    const newLog: PublishingLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString()
    };
    if (!db.publishingLogs) {
      db.publishingLogs = [];
    }
    db.publishingLogs.push(newLog);
    saveDb(db);
    return newLog;
  }
}


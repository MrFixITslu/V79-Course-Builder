export type AppCategory = 'Fire Finance Pro (FFPRO2)' | 'SIWM' | 'Tiquet' | 'KashDash' | 'General';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type CourseStatus = 'Draft' | 'Review' | 'Ready for Upload' | 'Uploaded';

export interface Course {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: AppCategory;
  difficultyLevel: DifficultyLevel;
  instructor: string;
  courseVersion: string;
  thumbnail: string;
  estimatedDuration: string; // e.g. "4.5 hours"
  prerequisites: string[];
  learningObjectives: string[];
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  orderNumber: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  learningObjectives: string[];
  estimatedTime: string; // e.g. "25 mins"
  lessonContent: string; // Markdown / HTML content
  videoUrl?: string;
  audioUrl?: string;
  imageUrls?: string[];
  downloads?: { name: string; url: string; size: string; type: string }[];
  exercisePrompt?: string;
  orderNumber: number;
}

export type QuestionType = 'multiple_choice' | 'true_false';

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  questionType: QuestionType;
  options: string[]; // For multiple choice
  correctAnswer: string | number; // Index or text
  explanation: string;
  orderNumber: number;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  passingScore: number; // percentage e.g. 80
  questions: QuizQuestion[];
}

export interface Asset {
  id: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  name: string;
  fileType: 'video' | 'audio' | 'image' | 'pdf' | 'document' | 'download';
  url: string;
  fileSize: string;
  uploadedAt: string;
}

export interface CoursePackageStructure {
  'course.json': Course;
  'README.md': string;
  modules: {
    [moduleFolder: string]: {
      'module.json': Module;
      lessons: {
        [lessonFolder: string]: {
          'content.json': Lesson;
          assets?: string[];
        };
      };
    };
  };
  quizzes: {
    [quizId: string]: Quiz;
  };
  downloads: string[];
  images: string[];
}

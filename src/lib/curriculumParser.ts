import JSZip from 'jszip';

export interface ValidationError {
  type: 'warning' | 'error';
  path: string; // e.g. "Course", "Module 1", "Lesson 1.1", "Quiz 1.1.1"
  message: string;
}

export interface ParsedQuestion {
  questionText: string;
  questionType: 'multiple_choice' | 'true_false';
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ParsedQuiz {
  title: string;
  passingScore?: number;
  questions: ParsedQuestion[];
}

export interface ParsedAssignment {
  title: string;
  description: string;
  maxPoints: number;
  submissionType: 'file' | 'text' | 'url' | 'none';
}

export interface ParsedLesson {
  title: string;
  description: string;
  estimatedTime?: string;
  learningObjectives: string[];
  videoUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  downloads: { name: string; url: string; size: string; type: string }[];
  assignments: ParsedAssignment[];
  quizzes: ParsedQuiz[];
}

export interface ParsedModule {
  title: string;
  description: string;
  lessons: ParsedLesson[];
}

export interface ParsedCourse {
  title: string;
  shortDescription: string;
  fullDescription: string;
  estimatedDuration: string;
  learningObjectives: string[];
  prerequisites: string[];
  modules: ParsedModule[];
  validationErrors: ValidationError[];
}

// ---------------------------------------------------------------------------
// Base Parser Interface
// ---------------------------------------------------------------------------
export interface BaseParser {
  parse(content: string): ParsedCourse;
}

// ---------------------------------------------------------------------------
// Unified Curriculum Content Extractor and Parser (Modular & Extensible)
// ---------------------------------------------------------------------------
export class UnifiedCurriculumParser implements BaseParser {
  parse(content: string): ParsedCourse {
    const course: ParsedCourse = {
      title: '',
      shortDescription: '',
      fullDescription: '',
      estimatedDuration: '',
      learningObjectives: [],
      prerequisites: [],
      modules: [],
      validationErrors: []
    };

    const lines = content.split(/\r?\n/);
    let currentSection: 'course' | 'module' | 'lesson' | 'quiz' | 'assignment' | 'question' | null = null;
    let currentModule: ParsedModule | null = null;
    let currentLesson: ParsedLesson | null = null;
    let currentQuiz: ParsedQuiz | null = null;
    let currentQuestion: ParsedQuestion | null = null;
    let currentAssignment: ParsedAssignment | null = null;

    let textBuffer: string[] = [];

    const flushTextBuffer = () => {
      if (textBuffer.length === 0) return '';
      const text = textBuffer.join(' ').trim();
      textBuffer = [];
      return text;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') continue;

      // Detect Headings (Markdown `#` or explicit markers)
      const courseMatch = line.match(/^#\s+(.+)$/i) || line.match(/^Course:\s*(.+)$/i) || line.match(/^\[Course\]\s*(.+)$/i);
      const moduleMatch = line.match(/^##\s+(.+)$/i) || line.match(/^Module(?:\s+\d+)?:\s*(.+)$/i) || line.match(/^\[Module\]\s*(.+)$/i);
      const lessonMatch = line.match(/^###\s+(.+)$/i) || line.match(/^Lesson(?:\s+[\d\.]+)?:\s*(.+)$/i) || line.match(/^\[Lesson\]\s*(.+)$/i);

      if (courseMatch) {
        // Close previous entities
        flushTextBuffer();
        course.title = this.stripPrefixes(courseMatch[1]);
        currentSection = 'course';
        continue;
      }

      if (moduleMatch) {
        flushTextBuffer();
        const modTitle = this.stripPrefixes(moduleMatch[1]);
        currentModule = {
          title: modTitle,
          description: '',
          lessons: []
        };
        course.modules.push(currentModule);
        currentLesson = null;
        currentQuiz = null;
        currentAssignment = null;
        currentQuestion = null;
        currentSection = 'module';
        continue;
      }

      if (lessonMatch) {
        flushTextBuffer();
        const lesTitle = this.stripPrefixes(lessonMatch[1]);
        if (!currentModule) {
          // Auto-create module if missing
          currentModule = {
            title: 'Module 1: Getting Started',
            description: 'Automatically created module',
            lessons: []
          };
          course.modules.push(currentModule);
        }
        currentLesson = {
          title: lesTitle,
          description: '',
          learningObjectives: [],
          downloads: [],
          assignments: [],
          quizzes: []
        };
        currentModule.lessons.push(currentLesson);
        currentQuiz = null;
        currentAssignment = null;
        currentQuestion = null;
        currentSection = 'lesson';
        continue;
      }

      // Special resource block detections: [Video], [Audio], [PDF], [Download], [Quiz], [Assignment]
      const videoMatch = line.match(/^\[Video\]\s*(?:([^:]+):)?\s*(https?:\/\/\S+)$/i);
      const audioMatch = line.match(/^\[Audio\]\s*(?:([^:]+):)?\s*(https?:\/\/\S+)$/i);
      const pdfMatch = line.match(/^\[PDF\]\s*(?:([^:]+):)?\s*(https?:\/\/\S+)$/i);
      const downloadMatch = line.match(/^\[Download\]\s*(?:([^:]+):)?\s*(https?:\/\/\S+)$/i);

      if (videoMatch) {
        if (currentLesson) {
          currentLesson.videoUrl = videoMatch[2].trim();
        } else {
          course.validationErrors.push({
            type: 'warning',
            path: 'File Structure',
            message: `Video URL found without associated Lesson context on line ${i + 1}: ${line}`
          });
        }
        continue;
      }

      if (audioMatch) {
        if (currentLesson) {
          currentLesson.audioUrl = audioMatch[2].trim();
        } else {
          course.validationErrors.push({
            type: 'warning',
            path: 'File Structure',
            message: `Audio URL found without associated Lesson context on line ${i + 1}: ${line}`
          });
        }
        continue;
      }

      if (pdfMatch) {
        if (currentLesson) {
          currentLesson.pdfUrl = pdfMatch[2].trim();
        } else {
          course.validationErrors.push({
            type: 'warning',
            path: 'File Structure',
            message: `PDF URL found without associated Lesson context on line ${i + 1}: ${line}`
          });
        }
        continue;
      }

      if (downloadMatch) {
        if (currentLesson) {
          const name = (downloadMatch[1] || 'Supplemental Guide').trim();
          currentLesson.downloads.push({
            name,
            url: downloadMatch[2].trim(),
            size: 'N/A',
            type: 'zip'
          });
        } else {
          course.validationErrors.push({
            type: 'warning',
            path: 'File Structure',
            message: `Download resource found without associated Lesson context on line ${i + 1}: ${line}`
          });
        }
        continue;
      }

      // Check for Assignment start
      const assignMatch = line.match(/^\[Assignment\]\s*(.+)$/i);
      if (assignMatch) {
        if (!currentLesson) {
          course.validationErrors.push({
            type: 'error',
            path: 'File Structure',
            message: `Assignment defined on line ${i + 1} without a Lesson context.`
          });
          continue;
        }
        currentAssignment = {
          title: assignMatch[1].trim(),
          description: '',
          maxPoints: 100,
          submissionType: 'file'
        };
        currentLesson.assignments.push(currentAssignment);
        currentQuiz = null;
        currentQuestion = null;
        currentSection = 'assignment';
        continue;
      }

      // Check for Quiz start
      const quizMatch = line.match(/^\[Quiz\]\s*(.+)$/i);
      if (quizMatch) {
        if (!currentLesson) {
          course.validationErrors.push({
            type: 'error',
            path: 'File Structure',
            message: `Quiz defined on line ${i + 1} without a Lesson context.`
          });
          continue;
        }
        currentQuiz = {
          title: quizMatch[1].trim(),
          passingScore: 80,
          questions: []
        };
        currentLesson.quizzes.push(currentQuiz);
        currentAssignment = null;
        currentQuestion = null;
        currentSection = 'quiz';
        continue;
      }

      // Metadata parse (Description, Duration, Objectives, Prerequisites, Passing Score, Max Points, Options, Correct Answer, Explanation)
      const descMatch = line.match(/^(?:Description|Summary|Overview):\s*(.+)$/i);
      if (descMatch) {
        const val = descMatch[1].trim();
        if (currentSection === 'course') course.shortDescription = val;
        else if (currentSection === 'module' && currentModule) currentModule.description = val;
        else if (currentSection === 'lesson' && currentLesson) currentLesson.description = val;
        else if (currentSection === 'assignment' && currentAssignment) currentAssignment.description = val;
        continue;
      }

      const durMatch = line.match(/^(?:Duration|Estimated\s*Duration|Time|Estimated\s*Time):\s*(.+)$/i);
      if (durMatch) {
        const val = durMatch[1].trim();
        if (currentSection === 'course') course.estimatedDuration = val;
        else if (currentSection === 'lesson' && currentLesson) currentLesson.estimatedTime = val;
        continue;
      }

      const objMatch = line.match(/^(?:Objectives|Learning\s*Objectives):\s*(.+)$/i);
      if (objMatch) {
        const val = objMatch[1].trim();
        const list = val.split(/,|\n/).map(s => s.trim()).filter(Boolean);
        if (currentSection === 'course') course.learningObjectives.push(...list);
        else if (currentSection === 'lesson' && currentLesson) currentLesson.learningObjectives.push(...list);
        continue;
      }

      const prereqMatch = line.match(/^(?:Prerequisites|Prerequisite):\s*(.+)$/i);
      if (prereqMatch) {
        const val = prereqMatch[1].trim();
        const list = val.split(/,|\n/).map(s => s.trim()).filter(Boolean);
        course.prerequisites.push(...list);
        continue;
      }

      // Quiz Metadata: Question, Type, Option, Correct, Explanation
      const qTextMatch = line.match(/^(?:Question|Q\d+):\s*(.+)$/i);
      if (qTextMatch) {
        if (!currentQuiz) {
          course.validationErrors.push({
            type: 'error',
            path: 'Quiz Structure',
            message: `Question defined on line ${i + 1} outside of any [Quiz] scope.`
          });
          continue;
        }
        currentQuestion = {
          questionText: qTextMatch[1].trim(),
          questionType: 'multiple_choice',
          options: [],
          correctAnswer: '',
          explanation: ''
        };
        currentQuiz.questions.push(currentQuestion);
        currentSection = 'question';
        continue;
      }

      const qTypeMatch = line.match(/^(?:Type|Question\s*Type):\s*(.+)$/i);
      if (qTypeMatch && currentQuestion) {
        const val = qTypeMatch[1].trim().toLowerCase();
        currentQuestion.questionType = val.includes('true') || val.includes('tf') ? 'true_false' : 'multiple_choice';
        continue;
      }

      const optMatch = line.match(/^(?:Option\s*[A-Z]|Option|-)\s*:\s*(.+)$/i);
      const optLetterMatch = line.match(/^[A-F]\.\s*(.+)$/i);
      if ((optMatch || optLetterMatch) && currentQuestion) {
        const val = (optMatch ? optMatch[1] : optLetterMatch![1]).trim();
        currentQuestion.options.push(val);
        continue;
      }

      const correctMatch = line.match(/^(?:Correct|Answer|Correct\s*Answer):\s*(.+)$/i);
      if (correctMatch && currentQuestion) {
        currentQuestion.correctAnswer = correctMatch[1].trim();
        continue;
      }

      const explanationMatch = line.match(/^(?:Explanation|Exp):\s*(.+)$/i);
      if (explanationMatch && currentQuestion) {
        currentQuestion.explanation = explanationMatch[1].trim();
        continue;
      }

      const passScoreMatch = line.match(/^(?:Passing\s*Score|Passing):\s*(\d+)%?$/i);
      if (passScoreMatch && currentQuiz) {
        currentQuiz.passingScore = parseInt(passScoreMatch[1], 10);
        continue;
      }

      // Assignment specific metadata: Max Points, Submission Type
      const maxPtsMatch = line.match(/^(?:Max\s*Points|Points):\s*(\d+)$/i);
      if (maxPtsMatch && currentAssignment) {
        currentAssignment.maxPoints = parseInt(maxPtsMatch[1], 10);
        continue;
      }

      const submitTypeMatch = line.match(/^(?:Submission\s*Type|Submission):\s*(.+)$/i);
      if (submitTypeMatch && currentAssignment) {
        const val = submitTypeMatch[1].trim().toLowerCase();
        if (val.includes('file') || val.includes('upload')) {
          currentAssignment.submissionType = 'file';
        } else if (val.includes('text') || val.includes('written')) {
          currentAssignment.submissionType = 'text';
        } else if (val.includes('url') || val.includes('link')) {
          currentAssignment.submissionType = 'url';
        } else {
          currentAssignment.submissionType = 'none';
        }
        continue;
      }

      // Standard list parsing or multi-line paragraphs
      if (line.startsWith('-') || line.startsWith('*')) {
        const listText = line.substring(1).trim();
        if (currentSection === 'course') {
          course.learningObjectives.push(listText);
        } else if (currentSection === 'lesson' && currentLesson) {
          currentLesson.learningObjectives.push(listText);
        }
        continue;
      }

      // Handle normal free text appending
      if (currentSection === 'course') {
        if (!course.fullDescription) course.fullDescription = line;
        else course.fullDescription += ' ' + line;
      } else if (currentSection === 'module' && currentModule) {
        if (!currentModule.description) currentModule.description = line;
        else currentModule.description += ' ' + line;
      } else if (currentSection === 'lesson' && currentLesson) {
        if (!currentLesson.description) currentLesson.description = line;
        else currentLesson.description += ' ' + line;
      } else if (currentSection === 'assignment' && currentAssignment) {
        if (!currentAssignment.description) currentAssignment.description = line;
        else currentAssignment.description += ' ' + line;
      }
    }

    this.validate(course);
    return course;
  }

  // Helper method for validating course structures
  private validate(course: ParsedCourse) {
    if (!course.title) {
      course.validationErrors.push({
        type: 'error',
        path: 'Course',
        message: 'Course title is missing. Include a line like "Course: Title Name".'
      });
    }

    if (course.modules.length === 0) {
      course.validationErrors.push({
        type: 'warning',
        path: 'Course Structure',
        message: 'No modules detected in this document. Add modules with "## Module: [Name]".'
      });
    }

    course.modules.forEach((mod, modIdx) => {
      const modName = mod.title || `Module ${modIdx + 1}`;
      if (mod.lessons.length === 0) {
        course.validationErrors.push({
          type: 'warning',
          path: `Module: ${modName}`,
          message: `Module "${modName}" has no lessons.`
        });
      }

      mod.lessons.forEach((les, lesIdx) => {
        const lesName = les.title || `Lesson ${modIdx + 1}.${lesIdx + 1}`;
        if (!les.description) {
          course.validationErrors.push({
            type: 'warning',
            path: `Lesson: ${lesName}`,
            message: `Lesson "${lesName}" is missing a description.`
          });
        }

        // Validate quizzes
        les.quizzes.forEach((quiz, quizIdx) => {
          const quizName = quiz.title || `Quiz ${quizIdx + 1}`;
          if (quiz.questions.length === 0) {
            course.validationErrors.push({
              type: 'error',
              path: `Quiz: ${lesName} > ${quizName}`,
              message: `Quiz "${quizName}" has no questions.`
            });
          }

          quiz.questions.forEach((q, qIdx) => {
            const pathName = `${lesName} > Quiz: ${quizName} > Q${qIdx + 1}`;
            if (!q.questionText) {
              course.validationErrors.push({
                type: 'error',
                path: pathName,
                message: `Question ${qIdx + 1} text is empty.`
              });
            }
            if (q.questionType === 'multiple_choice') {
              if (q.options.length < 2) {
                course.validationErrors.push({
                  type: 'error',
                  path: pathName,
                  message: 'Multiple choice question must have at least 2 options.'
                });
              }
              if (q.correctAnswer) {
                const cleanAns = q.correctAnswer.toLowerCase();
                // Check if correct answer represents Option A/B/C or matches text directly
                const optionMatch = cleanAns.match(/^(?:option\s+)?([a-f])$/i);
                if (optionMatch) {
                  const idx = optionMatch[1].toUpperCase().charCodeAt(0) - 65;
                  if (idx >= q.options.length) {
                    course.validationErrors.push({
                      type: 'error',
                      path: pathName,
                      message: `Correct answer mapping "${q.correctAnswer}" points to option ${optionMatch[1].toUpperCase()}, but only ${q.options.length} options are provided.`
                    });
                  }
                } else {
                  // Text match verification
                  const hasMatch = q.options.some(opt => opt.toLowerCase().includes(cleanAns) || cleanAns.includes(opt.toLowerCase()));
                  if (!hasMatch) {
                    course.validationErrors.push({
                      type: 'warning',
                      path: pathName,
                      message: `Correct answer text "${q.correctAnswer}" does not match any of the provided options: ${q.options.join(', ')}.`
                    });
                  }
                }
              } else {
                course.validationErrors.push({
                  type: 'error',
                  path: pathName,
                  message: 'Correct answer is not defined.'
                });
              }
            } else if (q.questionType === 'true_false') {
              const ans = q.correctAnswer.toLowerCase();
              if (ans !== 'true' && ans !== 'false') {
                course.validationErrors.push({
                  type: 'error',
                  path: pathName,
                  message: `True/False correct answer must be 'True' or 'False', found: "${q.correctAnswer}".`
                });
              }
            }
          });
        });
      });
    });
  }

  private stripPrefixes(raw: string): string {
    return raw
      .replace(/^#+\s*/, '') // Strip markdown header marks
      .replace(/^Course\s*:\s*/i, '')
      .replace(/^Module\s*\d+\s*:\s*/i, '')
      .replace(/^Module\s*:\s*/i, '')
      .replace(/^Lesson\s*[\d\.]+\s*:\s*/i, '')
      .replace(/^Lesson\s*:\s*/i, '')
      .replace(/^\[(?:Course|Module|Lesson)\]\s*/i, '')
      .trim();
  }
}

// ---------------------------------------------------------------------------
// DOCX XML Text Extractor (Pure JSZip + Tag parser, no environment limits)
// ---------------------------------------------------------------------------
export async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const docXmlFile = zip.file('word/document.xml');
  if (!docXmlFile) {
    throw new Error('Invalid DOCX format: word/document.xml missing inside the package.');
  }
  const content = await docXmlFile.async('text');

  // Regex based robust parsing for both DOM & Node environments
  const paragraphs = content.split(/<\/w:p>/);
  const textLines: string[] = [];

  for (const p of paragraphs) {
    // Find all <w:t> tags in the paragraph
    const tMatches = p.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (tMatches) {
      const pText = tMatches
        .map((m) => {
          const match = m.match(/<w:t[^>]*>([^<]*)<\/w:t>/);
          return match ? match[1] : '';
        })
        .join('');
      textLines.push(pText);
    }
  }

  return textLines.join('\n');
}

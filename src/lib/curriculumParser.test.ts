import { UnifiedCurriculumParser, extractTextFromDocx } from './curriculumParser';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runParserTests() {
  console.log('--- RUNNING CURRICULUM IMPORT PARSER TESTS ---');

  // Test 1: Markdown Curriculum Parsing
  const mdInput = `
# Course: Introduction to SIWM
Description: A beginner's guide to SIWM.
Duration: 5 hours
Objectives:
- Learn SIWM interface
- Perform trade inputs

## Module 1: SIWM Basics
Description: Setting up SIWM.

### Lesson 1: Your First Trade
Objectives:
- Create a trade
Duration: 30 minutes
Description: Learn how to input a basic buy trade.

[Video] Demo Video: https://example.com/video.mp4
[Audio] Pronunciation Guide: https://example.com/audio.mp3
[PDF] Cheat Sheet: https://example.com/cheatsheet.pdf
[Download] Exercises: https://example.com/exercise.zip

[Assignment] Trade Summary Assignment
Max Points: 50
Submission Type: text
Description: Outline the trade parameters.

[Quiz] SIWM First Steps
Passing Score: 85%

Question: What does SIWM stand for?
Type: multiple_choice
Option A: Smart Investment Wealth Manager
Option B: System of Internal Wealth Management
Correct: A
Explanation: SIWM stands for Smart Investment Wealth Manager.

Question: True or False: SIWM is only for buy orders.
Type: true_false
Correct: False
Explanation: SIWM supports sell orders as well.
`;

  const parser = new UnifiedCurriculumParser();
  const parsed = parser.parse(mdInput);

  console.log('Parsed Course Title:', parsed.title);
  assert(parsed.title === 'Introduction to SIWM', 'Course title should match');
  assert(parsed.shortDescription === "A beginner's guide to SIWM.", 'Course short description should match');
  assert(parsed.estimatedDuration === '5 hours', 'Course duration should match');
  assert(parsed.modules.length === 1, 'Should parse exactly 1 module');
  assert(parsed.modules[0].title === 'SIWM Basics', 'Module title should match');
  assert(parsed.modules[0].lessons.length === 1, 'Should parse exactly 1 lesson');

  const lesson = parsed.modules[0].lessons[0];
  assert(lesson.title === 'Your First Trade', 'Lesson title should match');
  assert(lesson.estimatedTime === '30 minutes', 'Lesson duration should match');
  assert(lesson.videoUrl === 'https://example.com/video.mp4', 'Lesson video URL should match');
  assert(lesson.audioUrl === 'https://example.com/audio.mp3', 'Lesson audio URL should match');
  assert(lesson.pdfUrl === 'https://example.com/cheatsheet.pdf', 'Lesson pdfUrl should handle matching pdf tag');
  assert(lesson.downloads.length === 1 && lesson.downloads[0].url === 'https://example.com/exercise.zip', 'Should parse downloads');

  // Validate quiz
  assert(lesson.quizzes.length === 1, 'Should have exactly 1 quiz');
  const quiz = lesson.quizzes[0];
  assert(quiz.title === 'SIWM First Steps', 'Quiz title should match');
  assert(quiz.passingScore === 85, 'Quiz passing score should match');
  assert(quiz.questions.length === 2, 'Quiz should have exactly 2 questions');

  const q1 = quiz.questions[0];
  assert(q1.questionText === 'What does SIWM stand for?', 'Q1 text should match');
  assert(q1.questionType === 'multiple_choice', 'Q1 type should match');
  assert(q1.options.length === 2, 'Q1 options count should match');
  assert(q1.correctAnswer === 'A', 'Q1 correct answer should match');

  const q2 = quiz.questions[1];
  assert(q2.questionText === 'True or False: SIWM is only for buy orders.', 'Q2 text should match');
  assert(q2.questionType === 'true_false', 'Q2 type should match');
  assert(q2.correctAnswer === 'False', 'Q2 correct answer should match');

  // Validate assignments
  assert(lesson.assignments.length === 1, 'Should have exactly 1 assignment');
  const assignment = lesson.assignments[0];
  assert(assignment.title === 'Trade Summary Assignment', 'Assignment title should match');
  assert(assignment.maxPoints === 50, 'Assignment maxPoints should match');
  assert(assignment.submissionType === 'text', 'Assignment submissionType should match');

  // Test 2: Validation Warnings/Errors Check
  const invalidInput = `
# Course: Missing Modules Course
`;
  const parsedInvalid = parser.parse(invalidInput);
  assert(parsedInvalid.validationErrors.length > 0, 'Should have validation warnings/errors');
  const hasModWarning = parsedInvalid.validationErrors.some(e => e.message.includes('No modules detected'));
  assert(hasModWarning, 'Should warn about missing modules');

  console.log('✓ All parser unit tests passed successfully!');
}

// Automatically execute if run directly via tsx
if (import.meta.url.endsWith('curriculumParser.test.ts') || process.argv[1]?.includes('curriculumParser.test.ts')) {
  runParserTests();
}

export function requiresSubscription(course: any): boolean {
  return ['subscription', 'premium', 'free_trial'].includes(course.pricingType);
}
export function hasMembership(user: any, now = Date.now()): boolean {
  return Boolean(user && user.membershipStatus === 'active' && Date.parse(user.membershipExpiresAt) > now);
}
export function canReadCourse(course: any, user: any, admin = false): boolean {
  return admin || !requiresSubscription(course) || hasMembership(user);
}
export function courseSummary(course: any, db: any, access: boolean) {
  const { programme, websiteAppId, ...metadata } = course;
  return { ...metadata, learningObjectives: course.learningObjectives || course.learning_objectives || [], hasProgramme: Boolean(programme), ...(access && programme ? { programme: { ...programme, finalExam: { ...programme.finalExam, questions: programme.finalExam.questions.map((q: any) => ({ ...q, correctAnswer: '' })) } } } : {}), hasAccess: access,
    moduleCount: db.modules.filter((m: any) => m.courseId === course.id).length,
    lessonCount: db.lessons.filter((l: any) => l.courseId === course.id).length };
}
export function lessonSummary(lesson: any) {
  return { id: lesson.id, courseId: lesson.courseId, moduleId: lesson.moduleId, title: lesson.title,
    description: '', estimatedTime: lesson.estimatedTime, orderNumber: lesson.orderNumber, locked: true };
}
export function deleteCourseRecords(db: any, courseId: string) {
  const lessonIds = new Set(db.lessons.filter((l: any) => l.courseId === courseId).map((l: any) => l.id));
  db.courses = db.courses.filter((c: any) => c.id !== courseId);
  for (const key of ['modules', 'lessons', 'assets', 'media', 'assignments', 'downloads', 'courseVersions']) {
    db[key] = (db[key] || []).filter((row: any) => row.courseId !== courseId && !lessonIds.has(row.lessonId));
  }
  for (const key of ['quizzes', 'contentBlocks']) db[key] = (db[key] || []).filter((row: any) => !lessonIds.has(row.lessonId));
  // Keep seed markers and audit logs so a deliberately deleted seed never reappears.
}

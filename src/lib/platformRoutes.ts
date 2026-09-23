import express from "express";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { loadDb } from "./courseBuilderDb";
import { hasMembership } from "./academyAccess";

const router = express.Router();
const learnersFile = path.join(process.cwd(), "data", "learners.json");
const MAX_SKEW_MS = 5 * 60 * 1000;

function readLearners(): any[] {
  if (!fs.existsSync(learnersFile)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(learnersFile, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function canonicalMessage(req: express.Request, timestamp: string) {
  const pathname = new URL(req.originalUrl, "http://v79.internal").pathname;
  const bodyHash = crypto.createHash("sha256").update("").digest("hex");
  return [req.method.toUpperCase(), pathname, timestamp, bodyHash].join("\n");
}

function safeEqualHex(a: string, b: string) {
  try {
    const left = Buffer.from(a, "hex");
    const right = Buffer.from(b, "hex");
    return left.length === right.length && crypto.timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

router.use((req, res, next) => {
  const secret = String(process.env.V79_PLATFORM_SHARED_SECRET || "");
  const timestamp = String(req.get("x-v79-timestamp") || "");
  const signature = String(req.get("x-v79-signature") || "");
  const serviceId = String(req.get("x-v79-service-id") || "");

  if (secret.length < 32) {
    return res.status(503).json({ error: "V79 platform integration is not configured." });
  }
  if (serviceId !== "v79-hub" || !timestamp || !signature) {
    return res.status(401).json({ error: "Invalid V79 platform credentials." });
  }

  const when = Number(timestamp);
  if (!Number.isFinite(when) || Math.abs(Date.now() - when) > MAX_SKEW_MS) {
    return res.status(401).json({ error: "Expired V79 platform request." });
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(canonicalMessage(req, timestamp))
    .digest("hex");

  if (!safeEqualHex(expected, signature)) {
    return res.status(401).json({ error: "Invalid V79 platform signature." });
  }
  next();
});

router.get("/summary/:subject", (req, res) => {
  const subject = String(req.params.subject || "").trim();
  if (!subject || subject.length > 254 || subject.includes("/")) {
    return res.status(400).json({ error: "Invalid Academy learner identifier." });
  }

  const learners = readLearners();
  const normalized = subject.toLowerCase();
  const user = learners.find((item: any) =>
    String(item.id || "") === subject || String(item.email || "").toLowerCase() === normalized
  );
  if (!user) return res.status(404).json({ error: "Academy learner not found." });

  const db = loadDb();
  const publishedCourses = (db.courses || []).filter((course: any) =>
    ["Published", "Uploaded"].includes(course.status)
  );
  const enrolledIds = Array.isArray(user.enrolledCourseIds) ? user.enrolledCourseIds : [];
  const courseProgress = enrolledIds.map((courseId: string) => {
    const course = publishedCourses.find((item: any) => item.id === courseId);
    const lessons = (db.lessons || []).filter((lesson: any) => lesson.courseId === courseId);
    const progress = user.progress?.[courseId] || {};
    const completed = Object.values(progress.completedLessons || {}).filter(Boolean).length;
    const attempts = progress.programmeState?.examAttempts || [];
    return {
      courseId,
      title: course?.title || courseId,
      completedLessons: completed,
      totalLessons: lessons.length,
      percentComplete: lessons.length ? Math.round((completed / lessons.length) * 100) : 0,
      examPassed: attempts.some((attempt: any) => attempt?.passed === true),
      certificateIssued: Boolean(progress.certificate?.id || progress.programmeState?.certificateId),
      updatedAt: progress.updatedAt || null,
    };
  });

  const completedLessons = courseProgress.reduce((sum: number, item: any) => sum + item.completedLessons, 0);
  const totalLessons = courseProgress.reduce((sum: number, item: any) => sum + item.totalLessons, 0);
  const certificates = courseProgress.filter((item: any) => item.certificateIssued).length;

  res.json({
    product: "academy",
    subjectId: user.id,
    learner: {
      name: user.name,
      email: user.email,
      membershipStatus: hasMembership(user) ? "active" : "inactive",
      membershipExpiresAt: user.membershipExpiresAt || null,
    },
    metrics: {
      publishedCourses: publishedCourses.length,
      enrolledCourses: enrolledIds.length,
      completedLessons,
      totalLessons,
      overallProgressPercent: totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0,
      certificates,
    },
    courses: courseProgress.slice(0, 12),
    generatedAt: new Date().toISOString(),
  });
});

export default router;

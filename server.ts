import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { UnifiedCurriculumParser } from "./src/lib/curriculumParser";
import {
  initAndMigrateDb,
  loadDb,
  saveDb,
  CourseRepository,
  ModuleRepository,
  LessonRepository,
  ContentBlockRepository,
  MediaRepository,
  QuizRepository,
  AssignmentRepository,
  DownloadRepository,
  CourseVersionRepository,
  ImportHistoryRepository,
  CourseBuilderService,
  PublishingLogRepository
} from "./src/lib/courseBuilderDb";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Data storage file path
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// Admin authentication
// ---------------------------------------------------------------------------
// This app previously had no login at all - anyone who could reach it could
// create/edit/delete courses and trigger a real publish to the live website.
// It now requires a password, using the same persisted-hash + forced
// one-time-password-change pattern as the website's own admin panel.
const cleanEnvValue = (val: any): string => {
  if (!val) return "";
  let clean = val.toString().trim();
  if (clean.startsWith('"') && clean.endsWith('"')) clean = clean.substring(1, clean.length - 1);
  if (clean.startsWith("'") && clean.endsWith("'")) clean = clean.substring(1, clean.length - 1);
  return clean.trim();
};

const ADMIN_AUTH_PATH = path.join(DATA_DIR, ".admin_auth.json");

interface AdminAuthRecord {
  salt: string;
  hash: string;
  mustChangePassword: boolean;
  updatedAt: string;
}

function hashAdminPassword(password: string, salt?: string): { salt: string; hash: string } {
  const useSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, useSalt, 64).toString("hex");
  return { salt: useSalt, hash };
}

function verifyAdminPassword(password: string, record: AdminAuthRecord): boolean {
  const { hash } = hashAdminPassword(password, record.salt);
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(record.hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function saveAdminAuth(record: AdminAuthRecord) {
  fs.writeFileSync(ADMIN_AUTH_PATH, JSON.stringify(record, null, 2), { mode: 0o600 });
}

function loadOrCreateAdminAuth(): AdminAuthRecord {
  try {
    if (fs.existsSync(ADMIN_AUTH_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(ADMIN_AUTH_PATH, "utf-8"));
      if (parsed && typeof parsed.salt === "string" && typeof parsed.hash === "string") {
        return parsed as AdminAuthRecord;
      }
    }
  } catch (e) {
    console.error("[Authentication] Failed to read persisted admin credential, regenerating:", e);
  }

  const initialPassword = cleanEnvValue(process.env.ADMIN_PASSWORD) || "V79Academy2026!";
  const { salt, hash } = hashAdminPassword(initialPassword);
  const record: AdminAuthRecord = { salt, hash, mustChangePassword: true, updatedAt: new Date().toISOString() };
  saveAdminAuth(record);
  console.warn("=".repeat(70));
  console.warn("[Authentication] Admin credential (re)initialized.");
  console.warn(`[Authentication] Initial admin password: ${initialPassword}`);
  console.warn("[Authentication] This password MUST be changed immediately after login - the next");
  console.warn("[Authentication] successful login will be required to set a new permanent password");
  console.warn("[Authentication] before any other action in this app is permitted.");
  console.warn("=".repeat(70));
  return record;
}

let adminAuth: AdminAuthRecord = loadOrCreateAdminAuth();

// Reset Recovery Token setup
const ADMIN_RESET_TOKEN_PATH = path.join(DATA_DIR, ".admin_reset_token.txt");

function loadOrCreateResetToken(): string {
  try {
    if (fs.existsSync(ADMIN_RESET_TOKEN_PATH)) {
      const existing = fs.readFileSync(ADMIN_RESET_TOKEN_PATH, "utf-8").trim();
      if (existing) return existing;
    }
  } catch (e) {
    console.error("[Authentication] Failed to read reset token file:", e);
  }

  const token = cleanEnvValue(process.env.ADMIN_RESET_TOKEN) || "V79-RECOVERY-KEY-2026";
  try {
    fs.writeFileSync(ADMIN_RESET_TOKEN_PATH, token, { mode: 0o600 });
  } catch (e) {
    console.error("[Authentication] Failed to write reset token file:", e);
  }
  return token;
}

let adminResetToken: string = loadOrCreateResetToken();
console.warn(`[Authentication] Master Recovery Reset Token: ${adminResetToken}`);

const SESSION_COOKIE_NAME = "cb_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

interface AdminSession {
  expiry: number;
  mustChangePassword: boolean;
}
const adminSessions = new Map<string, AdminSession>();

function issueSession(mustChangePassword: boolean): string {
  const token = crypto.randomBytes(32).toString("hex");
  adminSessions.set(token, { expiry: Date.now() + SESSION_TTL_MS, mustChangePassword });
  return token;
}

function getSession(token: string | undefined | null): AdminSession | null {
  if (!token) return null;
  const session = adminSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiry) {
    adminSessions.delete(token);
    return null;
  }
  return session;
}

function invalidateAllSessions() {
  adminSessions.clear();
}

setInterval(() => {
  const now = Date.now();
  for (const [token, session] of adminSessions.entries()) {
    if (now > session.expiry) adminSessions.delete(token);
  }
}, 60 * 60 * 1000).unref();

function parseCookies(req: express.Request): Record<string, string> {
  const header = req.headers.cookie;
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(val);
  }
  return out;
}

function setSessionCookie(res: express.Response, token: string) {
  const maxAgeSec = Math.floor(SESSION_TTL_MS / 1000);
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${maxAgeSec}; SameSite=None; Secure`
  );
}

function clearSessionCookie(res: express.Response) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure`);
}

app.post("/api/admin/login", (req, res) => {
  const submitted = cleanEnvValue(req.body?.password);
  if (submitted.length > 0 && verifyAdminPassword(submitted, adminAuth)) {
    const token = issueSession(adminAuth.mustChangePassword);
    setSessionCookie(res, token);
    return res.json({ success: true, mustChangePassword: adminAuth.mustChangePassword });
  }
  return res.status(401).json({ error: "Incorrect password." });
});

app.post("/api/admin/logout", (req, res) => {
  const token = parseCookies(req)[SESSION_COOKIE_NAME];
  if (token) adminSessions.delete(token);
  clearSessionCookie(res);
  res.json({ success: true });
});

// Lets the frontend silently check "am I still logged in?" on page load
// without needing to hit a real data endpoint first.
app.get("/api/admin/session", (req, res) => {
  const session = getSession(parseCookies(req)[SESSION_COOKIE_NAME]);
  if (!session) return res.json({ authenticated: false });
  res.json({ authenticated: true, mustChangePassword: session.mustChangePassword });
});

app.post("/api/admin/change-password", (req, res) => {
  const session = getSession(parseCookies(req)[SESSION_COOKIE_NAME]);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized: a valid session is required." });
  }

  const current = cleanEnvValue(req.body?.currentPassword);
  const next = cleanEnvValue(req.body?.newPassword);

  if (!verifyAdminPassword(current, adminAuth)) {
    return res.status(401).json({ error: "Current password is incorrect." });
  }
  if (next.length < 12) {
    return res.status(400).json({ error: "New password must be at least 12 characters long." });
  }
  if (verifyAdminPassword(next, adminAuth)) {
    return res.status(400).json({ error: "New password must be different from the current password." });
  }

  const { salt, hash } = hashAdminPassword(next);
  adminAuth = { salt, hash, mustChangePassword: false, updatedAt: new Date().toISOString() };
  saveAdminAuth(adminAuth);

  invalidateAllSessions();
  const newToken = issueSession(false);
  setSessionCookie(res, newToken);

  res.json({ success: true });
});

// Provides recovery hint / token presence info to the frontend
app.get("/api/admin/recovery-info", (req, res) => {
  res.json({
    hasResetToken: true,
    defaultTokenHint: adminResetToken === "V79-RECOVERY-KEY-2026" ? "V79-RECOVERY-KEY-2026" : "Custom token configured"
  });
});

// Unauthenticated endpoint to reset admin password using the secure recovery token
app.post("/api/admin/reset-password", (req, res) => {
  const submittedToken = cleanEnvValue(req.body?.token);
  const newPassword = cleanEnvValue(req.body?.newPassword);

  if (!submittedToken) {
    return res.status(400).json({ error: "Recovery token is required." });
  }

  // Safe timing comparison
  const tokenA = Buffer.from(submittedToken);
  const tokenB = Buffer.from(adminResetToken);
  const tokensMatch = tokenA.length === tokenB.length && crypto.timingSafeEqual(tokenA, tokenB);

  if (!tokensMatch) {
    return res.status(401).json({ error: "Invalid recovery token. Please check your token and try again." });
  }

  if (newPassword.length < 12) {
    return res.status(400).json({ error: "New password must be at least 12 characters long." });
  }

  const { salt, hash } = hashAdminPassword(newPassword);
  adminAuth = { salt, hash, mustChangePassword: false, updatedAt: new Date().toISOString() };
  saveAdminAuth(adminAuth);

  invalidateAllSessions();

  console.warn("[Authentication] Password was successfully reset using recovery token.");
  return res.json({
    success: true,
    message: "Password reset successfully! You can now sign in with your new password."
  });
});

// ---------------------------------------------------------------------------
// Public student endpoints (Exempt from Admin authentication checks)
// ---------------------------------------------------------------------------
app.get("/api/public/courses", (req, res) => {
  try {
    const data = loadDb();
    const publicCourses = (data.courses || []).filter(
      (c: any) => c.status === "Published" || c.status === "Uploaded"
    );
    res.json(publicCourses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/public/courses/by-slug/:slug", (req, res) => {
  try {
    const data = loadDb();
    const slug = req.params.slug.toLowerCase().trim();
    
    const matchesSlug = (course: any, s: string): boolean => {
      if (!course) return false;
      if (course.id.toLowerCase() === s) return true;
      const titleSlug = course.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      if (titleSlug === s) return true;
      const categorySlug = (course.category || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      if (categorySlug === s) return true;
      
      if (s === "fire-finance-pro" || s === "ffpro" || s === "ffpro2") {
        const titleLower = course.title.toLowerCase();
        const catLower = (course.category || "").toLowerCase();
        if (titleLower.includes("fire finance pro") || titleLower.includes("ffpro") ||
            catLower.includes("fire finance pro") || catLower.includes("ffpro")) {
          return true;
        }
      }
      
      if (course.slug && course.slug.toLowerCase().trim() === s) return true;
      return false;
    };

    const course = (data.courses || []).find((c: any) => {
      const isPublished = c.status === "Published" || c.status === "Uploaded";
      return isPublished && matchesSlug(c, slug);
    });

    if (!course) {
      return res.status(404).json({ error: "Published course not found for slug: " + slug });
    }
    res.json(course);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/public/courses/:courseId/modules", (req, res) => {
  try {
    const data = loadDb();
    const course = (data.courses || []).find((c: any) => c.id === req.params.courseId);
    if (!course || (course.status !== "Published" && course.status !== "Uploaded")) {
      return res.status(404).json({ error: "Course not found or not published" });
    }
    const modules = (data.modules || []).filter((m: any) => m.courseId === req.params.courseId);
    modules.sort((a: any, b: any) => (a.orderNumber || 0) - (b.orderNumber || 0));
    res.json(modules);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/public/modules/:moduleId/lessons", (req, res) => {
  try {
    const data = loadDb();
    const mod = (data.modules || []).find((m: any) => m.id === req.params.moduleId);
    if (!mod) return res.status(404).json({ error: "Module not found" });
    const course = (data.courses || []).find((c: any) => c.id === mod.courseId);
    if (!course || (course.status !== "Published" && course.status !== "Uploaded")) {
      return res.status(404).json({ error: "Course not found or not published" });
    }
    const lessons = (data.lessons || []).filter((l: any) => l.moduleId === req.params.moduleId);
    lessons.sort((a: any, b: any) => (a.orderNumber || 0) - (b.orderNumber || 0));
    res.json(lessons);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/public/lessons/:lessonId/content-blocks", (req, res) => {
  try {
    const data = loadDb();
    const lesson = (data.lessons || []).find((l: any) => l.id === req.params.lessonId);
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });
    const course = (data.courses || []).find((c: any) => c.id === lesson.courseId);
    if (!course || (course.status !== "Published" && course.status !== "Uploaded")) {
      return res.status(404).json({ error: "Course not found or not published" });
    }
    const blocks = (data.contentBlocks || []).filter((cb: any) => cb.lessonId === req.params.lessonId);
    blocks.sort((a: any, b: any) => (a.orderNumber || 0) - (b.orderNumber || 0));
    res.json(blocks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/public/lessons/:lessonId/quiz", (req, res) => {
  try {
    const data = loadDb();
    const lesson = (data.lessons || []).find((l: any) => l.id === req.params.lessonId);
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });
    const course = (data.courses || []).find((c: any) => c.id === lesson.courseId);
    if (!course || (course.status !== "Published" && course.status !== "Uploaded")) {
      return res.status(404).json({ error: "Course not found or not published" });
    }
    const quiz = (data.quizzes || []).find((q: any) => q.lessonId === req.params.lessonId);
    res.json(quiz || null);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/public/courses/:courseId/assignments", (req, res) => {
  try {
    const data = loadDb();
    const course = (data.courses || []).find((c: any) => c.id === req.params.courseId);
    if (!course || (course.status !== "Published" && course.status !== "Uploaded")) {
      return res.status(404).json({ error: "Course not found or not published" });
    }
    const assignments = (data.assignments || []).filter((a: any) => a.courseId === req.params.courseId);
    res.json(assignments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/public/courses/:courseId/downloads", (req, res) => {
  try {
    const data = loadDb();
    const course = (data.courses || []).find((c: any) => c.id === req.params.courseId);
    if (!course || (course.status !== "Published" && course.status !== "Uploaded")) {
      return res.status(404).json({ error: "Course not found or not published" });
    }
    const downloads = (data.downloads || []).filter((d: any) => d.courseId === req.params.courseId);
    res.json(downloads);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Everything under /api except the unauthenticated auth routes above requires a valid,
// fully-activated (non-password-pending) session.
app.use("/api", (req, res, next) => {
  const session = getSession(parseCookies(req)[SESSION_COOKIE_NAME]);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized: please log in." });
  }
  if (session.mustChangePassword) {
    return res.status(403).json({ error: "You must set a new password before continuing.", code: "PASSWORD_CHANGE_REQUIRED" });
  }
  next();
});

const initialData = {
  courses: [
    {
      id: "course-ffpro-01",
      title: "Fire Finance Pro Masterclass: Advanced Portfolio Architecture",
      shortDescription: "Master corporate treasury planning, multi-currency cash flow modeling, and liquidity optimization.",
      fullDescription: "Fire Finance Pro (FFPRO2) empowers senior financial analysts and enterprise treasurers to build robust predictive cash models. This comprehensive masterclass covers automated treasury sweeps, capital reserve forecasting, interest rate risk hedging, and real-time ledger auditing across international subsidiaries.",
      category: "Fire Finance Pro (FFPRO2)",
      difficultyLevel: "Advanced",
      instructor: "Elena Vance, CFA",
      courseVersion: "2.1.0",
      thumbnail: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
      estimatedDuration: "6.5 hours",
      prerequisites: ["Intermediate Corporate Finance", "Excel/SQL Financial Modeling Proficiency"],
      learning_objectives: [
        "Design multi-currency treasury cash pools",
        "Implement automated liquidity sweep rules",
        "Execute dynamic interest rate hedging strategies",
        "Perform real-time compliance audits on global ledgers"
      ],
      status: "Ready for Upload",
      pricingType: "free",
      price: 0,
      createdAt: "2026-01-15T10:00:00Z",
      updatedAt: "2026-07-20T14:30:00Z"
    },
    {
      id: "course-siwm-02",
      title: "SIWM Enterprise Identity & Access Management",
      shortDescription: "Secure zero-trust cloud infrastructures and automated credential provisioning workflows.",
      fullDescription: "SIWM (Secure Identity & Workforce Management) provides end-to-end security governance. Learn how to configure adaptive multi-factor authentication, role-based access control (RBAC), OAuth2/OIDC integration, and automated lifecycle de-provisioning for enterprise scale.",
      category: "SIWM",
      difficultyLevel: "Intermediate",
      instructor: "Marcus Brody, CISSP",
      courseVersion: "1.4.2",
      thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
      estimatedDuration: "4.0 hours",
      prerequisites: ["Basic Cloud Networking", "IAM Fundamentals"],
      learning_objectives: [
        "Configure Zero-Trust continuous verification policies",
        "Integrate SSO with SAML 2.0 and OIDC providers",
        "Audit privileged access management logs",
        "Automate offboarding security handshakes"
      ],
      status: "Draft",
      pricingType: "free",
      price: 0,
      createdAt: "2026-02-10T09:15:00Z",
      updatedAt: "2026-07-22T11:20:00Z"
    },
    {
      id: "course-tiquet-03",
      title: "Tiquet Service Desk Operations & Incident Swarm",
      shortDescription: "Accelerate resolution times with AI-assisted ticket triage and automated SLA escalation.",
      fullDescription: "Designed for support operations leads and tier-3 incident managers, Tiquet streamlines customer service workflows. Master smart routing algorithms, customer sentiment analysis, root-cause tagging, and post-mortem reporting.",
      category: "Tiquet",
      difficultyLevel: "Beginner",
      instructor: "Sarah Jenkins",
      courseVersion: "1.0.0",
      thumbnail: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
      estimatedDuration: "3.0 hours",
      prerequisites: ["Customer Support Experience"],
      learning_objectives: [
        "Setup AI triage queues and auto-tagging rules",
        "Configure SLA breach notification webhooks",
        "Run incident swarm war rooms effectively",
        "Analyze CSAT and First Response Time metrics"
      ],
      status: "Review",
      pricingType: "free",
      price: 0,
      createdAt: "2026-03-05T14:00:00Z",
      updatedAt: "2026-07-19T16:45:00Z"
    },
    {
      id: "course-kashdash-04",
      title: "KashDash Real-Time Merchant Analytics & Payouts",
      shortDescription: "Optimize interchange fees, instant settlement routing, and fraud detection models.",
      fullDescription: "KashDash empowers fintech operators to manage high-velocity payment processing. Explore cross-border payout routing, dynamic fee structures, chargeback mitigation, and real-time anomaly detection pipelines.",
      category: "KashDash",
      difficultyLevel: "Advanced",
      instructor: "David K. Vance",
      courseVersion: "3.0.1",
      thumbnail: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
      estimatedDuration: "5.5 hours",
      prerequisites: ["Payment Gateway Basics", "API Integration Knowledge"],
      learning_objectives: [
        "Configure least-cost merchant acquirer routing",
        "Build machine learning fraud scoring triggers",
        "Reconcile multi-currency settlement ledgers",
        "Handle PSD2 and PCI-DSS compliance requirements"
      ],
      status: "Ready for Upload",
      pricingType: "free",
      price: 0,
      createdAt: "2025-11-20T08:00:00Z",
      updatedAt: "2026-06-10T09:00:00Z"
    }
  ],
  modules: [
    {
      id: "mod-01",
      courseId: "course-ffpro-01",
      title: "Module 1: Treasury Architecture & Cash Pools",
      description: "Foundational concepts of global cash pooling and liquidity visibility across bank accounts.",
      orderNumber: 1
    },
    {
      id: "mod-02",
      courseId: "course-ffpro-01",
      title: "Module 2: Automated Liquidity Sweeps",
      description: "Setting up zero-balance accounts (ZBA) and target balance sweeps.",
      orderNumber: 2
    },
    {
      id: "mod-03",
      courseId: "course-siwm-02",
      title: "Module 1: Zero-Trust Identity Principles",
      description: "Core tenets of verifying every user, device, and request.",
      orderNumber: 1
    }
  ],
  lessons: [
    {
      id: "les-01",
      moduleId: "mod-01",
      courseId: "course-ffpro-01",
      title: "Introduction to Global Cash Pooling",
      description: "Understanding physical vs. notional pooling mechanisms.",
      learning_objectives: ["Compare notional and physical pooling", "Identify currency conversion friction costs"],
      estimatedTime: "30 mins",
      lesson_content: `# Introduction to Global Cash Pooling\n\nGlobal cash pooling allows multinational corporations to consolidate liquidity across multiple banks and geographies. \n\n## Key Mechanisms\n1. **Physical Pooling (ZBA)**: Actual physical transfers of funds into a master concentration account at end-of-day.\n2. **Notional Pooling**: Interest offset calculation without physical fund movement, subject to local banking regulations.\n\n> **Pro-Tip**: Always account for withholding taxes and cross-border repatriation limits when structuring international cash pools.`,
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      audioUrl: "",
      imageUrls: ["https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80"],
      downloads: [
        { name: "Cash_Pooling_Architecture_Template.pdf", url: "#", size: "2.4 MB", type: "pdf" },
        { name: "Global_Subsidiary_Matrix.xlsx", url: "#", size: "1.1 MB", type: "spreadsheet" }
      ],
      exercisePrompt: "Draft a sample cash concentration flowchart for a European subsidiary network with EUR and GBP accounts.",
      orderNumber: 1
    },
    {
      id: "les-02",
      moduleId: "mod-01",
      courseId: "course-ffpro-01",
      title: "Regulatory Compliance in Cross-Border Sweeps",
      description: "Navigating central bank restrictions and exchange controls.",
      learning_objectives: ["Identify exchange controls in emerging markets", "Mitigate repatriation delays"],
      estimatedTime: "45 mins",
      lesson_content: `# Regulatory Compliance & Exchange Controls\n\nOperating automated sweeps across restrictive jurisdictions requires deep understanding of local central bank mandates.\n\n## Core Areas of Focus\n- **Blocked Currencies**: Managing funds that cannot be freely converted.\n- **Thin Capitalization Rules**: Debt-to-equity ratio constraints.\n- **Transfer Pricing Documentation**: Ensuring arm's-length interest allocations.`,
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      downloads: [
        { name: "Compliance_Checklist_2026.pdf", url: "#", size: "850 KB", type: "pdf" }
      ],
      exercisePrompt: "Review the sample compliance log and identify 3 potential regulatory violations.",
      orderNumber: 2
    }
  ],
  quizzes: [
    {
      id: "quiz-01",
      lessonId: "les-01",
      title: "Cash Pooling Fundamentals Assessment",
      passingScore: 80,
      questions: [
        {
          id: "q-01",
          quizId: "quiz-01",
          questionText: "What is the primary difference between physical and notional cash pooling?",
          questionType: "multiple_choice",
          options: [
            "Physical pooling involves actual fund transfers, while notional pooling calculates interest without moving funds.",
            "Notional pooling is illegal in all EU jurisdictions.",
            "Physical pooling eliminates currency risk completely.",
            "There is no operational difference."
          ],
          correctAnswer: "Physical pooling involves actual fund transfers, while notional pooling calculates interest without moving funds.",
          explanation: "Physical pooling moves funds into a concentration account (ZBA), whereas notional pooling aggregates balances mathematically for interest calculation only.",
          orderNumber: 1
        },
        {
          id: "q-02",
          quizId: "quiz-01",
          questionText: "True or False: Notional pooling requires zero regulatory oversight regarding cross-border interest compensation.",
          questionType: "true_false",
          options: ["True", "False"],
          correctAnswer: "False",
          explanation: "Notional pooling faces stringent anti-churning and cross-guarantee regulations in most banking jurisdictions.",
          orderNumber: 2
        }
      ]
    }
  ],
  assets: [
    {
      id: "ast-01",
      courseId: "course-ffpro-01",
      moduleId: "mod-01",
      lessonId: "les-01",
      name: "Cash_Pooling_Architecture_Template.pdf",
      fileType: "pdf",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      fileSize: "2.4 MB",
      uploadedAt: "2026-07-15T12:00:00Z"
    },
    {
      id: "ast-02",
      courseId: "course-ffpro-01",
      moduleId: "mod-01",
      lessonId: "les-01",
      name: "Global_Subsidiary_Matrix.xlsx",
      fileType: "document",
      url: "#",
      fileSize: "1.1 MB",
      uploadedAt: "2026-07-15T12:05:00Z"
    }
  ]
};

function loadData() {
  return loadDb() as any;
}

function saveData(data: any) {
  saveDb(data);
}

let db = initAndMigrateDb() as any;

// API Endpoints - Courses
app.get("/api/courses", (req, res) => {
  db = loadData();
  res.json(db.courses);
});

app.post("/api/courses", (req, res) => {
  db = loadData();
  const newCourse = {
    id: `course-${Date.now()}`,
    title: req.body.title || "Untitled Course",
    shortDescription: req.body.shortDescription || "",
    fullDescription: req.body.fullDescription || "",
    category: req.body.category || "General",
    difficultyLevel: req.body.difficultyLevel || "Beginner",
    instructor: req.body.instructor || "V79 Academy Instructor",
    courseVersion: req.body.courseVersion || "1.0.0",
    thumbnail: req.body.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    estimatedDuration: req.body.estimatedDuration || "2.0 hours",
    prerequisites: req.body.prerequisites || [],
    learning_objectives: req.body.learning_objectives || [],
    status: req.body.status || "Draft",
    pricingType: req.body.pricingType || "free",
    price: typeof req.body.price === "number" ? req.body.price : 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.courses.push(newCourse);
  saveData(db);
  res.status(201).json(newCourse);
});

app.get("/api/courses/:id", (req, res) => {
  db = loadData();
  const course = db.courses.find((c: any) => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });
  res.json(course);
});

app.put("/api/courses/:id", (req, res) => {
  db = loadData();
  const index = db.courses.findIndex((c: any) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Course not found" });

  const originalCourse = db.courses[index];
  const targetStatus = req.body.status;
  const userRole = req.headers["x-user-role"] || req.body.userRole || "Admin";

  // Enforce role permission: Only Admin may publish
  if (targetStatus && targetStatus === "Published") {
    if (userRole !== "Admin") {
      return res.status(403).json({ error: "Permissions Error: Only Admins can set status to Published." });
    }
  }

  db.courses[index] = {
    ...db.courses[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  saveData(db);

  // Log status change events
  if (targetStatus && originalCourse.status !== targetStatus) {
    PublishingLogRepository.create({
      courseId: originalCourse.id,
      courseTitle: originalCourse.title,
      event: "Status Changed",
      fromStatus: originalCourse.status,
      toStatus: targetStatus,
      performedBy: userRole as any,
      details: `Status updated from ${originalCourse.status} to ${targetStatus}`
    });
  }

  res.json(db.courses[index]);
});

app.delete("/api/courses/:id", (req, res) => {
  db = loadData();
  const courseId = req.params.id;
  const course = db.courses.find((c: any) => c.id === courseId);
  const userRole = req.headers["x-user-role"] || req.query.userRole || "Admin";

  if (course) {
    PublishingLogRepository.create({
      courseId: course.id,
      courseTitle: course.title,
      event: course.status === "Draft" ? "Draft Deleted" : "Course Deleted",
      fromStatus: course.status,
      toStatus: "None",
      performedBy: userRole as any,
      details: `Course "${course.title}" was permanently deleted with all child curriculum items.`
    });
  }

  db.courses = db.courses.filter((c: any) => c.id !== courseId);
  db.modules = db.modules.filter((m: any) => m.courseId !== courseId);
  db.lessons = db.lessons.filter((l: any) => l.courseId !== courseId);
  db.assets = db.assets.filter((a: any) => a.courseId !== courseId);
  saveData(db);
  res.json({ success: true });
});

// Modules
app.get("/api/courses/:courseId/modules", (req, res) => {
  db = loadData();
  const modules = db.modules.filter((m: any) => m.courseId === req.params.courseId);
  modules.sort((a: any, b: any) => a.orderNumber - b.orderNumber);
  res.json(modules);
});

app.post("/api/courses/:courseId/modules", (req, res) => {
  db = loadData();
  const courseId = req.params.courseId;
  const courseModules = db.modules.filter((m: any) => m.courseId === courseId);
  const newModule = {
    id: `mod-${Date.now()}`,
    courseId,
    title: req.body.title || "New Module",
    description: req.body.description || "",
    orderNumber: req.body.orderNumber ?? (courseModules.length + 1)
  };
  db.modules.push(newModule);
  saveData(db);
  res.status(201).json(newModule);
});

app.put("/api/modules/:id", (req, res) => {
  db = loadData();
  const index = db.modules.findIndex((m: any) => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Module not found" });
  db.modules[index] = { ...db.modules[index], ...req.body };
  saveData(db);
  res.json(db.modules[index]);
});

app.delete("/api/modules/:id", (req, res) => {
  db = loadData();
  const modId = req.params.id;
  db.modules = db.modules.filter((m: any) => m.id !== modId);
  db.lessons = db.lessons.filter((l: any) => l.moduleId !== modId);
  saveData(db);
  res.json({ success: true });
});

app.post("/api/courses/:courseId/modules/reorder", (req, res) => {
  db = loadData();
  const { moduleIds } = req.body;
  if (!Array.isArray(moduleIds)) return res.status(400).json({ error: "moduleIds array required" });
  db.modules.forEach((m: any) => {
    if (m.courseId === req.params.courseId) {
      const idx = moduleIds.indexOf(m.id);
      if (idx !== -1) {
        m.orderNumber = idx + 1;
      }
    }
  });
  saveData(db);
  res.json({ success: true });
});

app.post("/api/modules/:id/duplicate", (req, res) => {
  db = loadData();
  const modId = req.params.id;
  const originalMod = db.modules.find((m: any) => m.id === modId);
  if (!originalMod) return res.status(404).json({ error: "Module not found" });

  const courseId = originalMod.courseId;
  const courseModules = db.modules.filter((m: any) => m.courseId === courseId);
  const newModId = `mod-${Date.now()}`;
  const duplicatedMod = {
    ...originalMod,
    id: newModId,
    title: `${originalMod.title} (Copy)`,
    orderNumber: courseModules.length + 1
  };
  db.modules.push(duplicatedMod);

  // Now duplicate lessons inside this module
  const originalLessons = db.lessons.filter((l: any) => l.moduleId === modId);
  originalLessons.forEach((l: any, idx: number) => {
    const newLesId = `les-${Date.now()}-${idx}`;
    const duplicatedLesson = {
      ...l,
      id: newLesId,
      moduleId: newModId,
      orderNumber: l.orderNumber
    };
    db.lessons.push(duplicatedLesson);

    // Duplicate content blocks for this lesson
    const originalBlocks = db.contentBlocks.filter((cb: any) => cb.lessonId === l.id);
    originalBlocks.forEach((cb: any, cbIdx: number) => {
      db.contentBlocks.push({
        ...cb,
        id: `cb-${Date.now()}-${idx}-${cbIdx}`,
        lessonId: newLesId
      });
    });

    // Duplicate quizzes for this lesson
    const originalQuiz = db.quizzes.find((q: any) => q.lessonId === l.id);
    if (originalQuiz) {
      db.quizzes.push({
        ...originalQuiz,
        id: `quiz-${Date.now()}-${idx}`,
        lessonId: newLesId
      });
    }
  });

  saveData(db);
  res.status(201).json(duplicatedMod);
});

// Lessons
app.get("/api/modules/:moduleId/lessons", (req, res) => {
  db = loadData();
  const lessons = db.lessons.filter((l: any) => l.moduleId === req.params.moduleId);
  lessons.sort((a: any, b: any) => a.orderNumber - b.orderNumber);
  res.json(lessons);
});

app.post("/api/modules/:moduleId/lessons", (req, res) => {
  db = loadData();
  const moduleId = req.params.moduleId;
  const mod = db.modules.find((m: any) => m.id === moduleId);
  if (!mod) return res.status(404).json({ error: "Module not found" });

  const modLessons = db.lessons.filter((l: any) => l.moduleId === moduleId);
  const newLesson = {
    id: `les-${Date.now()}`,
    moduleId,
    courseId: mod.courseId,
    title: req.body.title || "New Lesson",
    description: req.body.description || "",
    learning_objectives: req.body.learning_objectives || [],
    estimatedTime: req.body.estimatedTime || "20 mins",
    lessonContent: req.body.lessonContent || "# Lesson Content\n\nAdd content here...",
    videoUrl: req.body.videoUrl || "",
    audioUrl: req.body.audioUrl || "",
    imageUrls: req.body.imageUrls || [],
    downloads: req.body.downloads || [],
    exercisePrompt: req.body.exercisePrompt || "",
    orderNumber: req.body.orderNumber ?? (modLessons.length + 1)
  };
  db.lessons.push(newLesson);
  saveData(db);
  res.status(201).json(newLesson);
});

app.get("/api/lessons/:id", (req, res) => {
  db = loadData();
  const lesson = db.lessons.find((l: any) => l.id === req.params.id);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });
  res.json(lesson);
});

app.put("/api/lessons/:id", (req, res) => {
  db = loadData();
  const index = db.lessons.findIndex((l: any) => l.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Lesson not found" });
  db.lessons[index] = { ...db.lessons[index], ...req.body };
  saveData(db);
  res.json(db.lessons[index]);
});

app.delete("/api/lessons/:id", (req, res) => {
  db = loadData();
  const lesId = req.params.id;
  db.lessons = db.lessons.filter((l: any) => l.id !== lesId);
  db.quizzes = db.quizzes.filter((q: any) => q.lessonId !== lesId);
  saveData(db);
  res.json({ success: true });
});

app.post("/api/modules/:moduleId/lessons/reorder", (req, res) => {
  db = loadData();
  const { lessonIds } = req.body;
  if (!Array.isArray(lessonIds)) return res.status(400).json({ error: "lessonIds array required" });
  db.lessons.forEach((l: any) => {
    const idx = lessonIds.indexOf(l.id);
    if (idx !== -1) {
      l.moduleId = req.params.moduleId;
      l.orderNumber = idx + 1;
    }
  });
  saveData(db);
  res.json({ success: true });
});

app.post("/api/lessons/:id/duplicate", (req, res) => {
  db = loadData();
  const lesId = req.params.id;
  const originalLesson = db.lessons.find((l: any) => l.id === lesId);
  if (!originalLesson) return res.status(404).json({ error: "Lesson not found" });

  const moduleId = originalLesson.moduleId;
  const modLessons = db.lessons.filter((l: any) => l.moduleId === moduleId);
  const newLesId = `les-${Date.now()}`;
  const duplicatedLesson = {
    ...originalLesson,
    id: newLesId,
    title: `${originalLesson.title} (Copy)`,
    orderNumber: modLessons.length + 1
  };
  db.lessons.push(duplicatedLesson);

  // Duplicate content blocks
  const originalBlocks = db.contentBlocks.filter((cb: any) => cb.lessonId === lesId);
  originalBlocks.forEach((cb: any, cbIdx: number) => {
    db.contentBlocks.push({
      ...cb,
      id: `cb-${Date.now()}-${cbIdx}`,
      lessonId: newLesId
    });
  });

  // Duplicate quizzes
  const originalQuiz = db.quizzes.find((q: any) => q.lessonId === lesId);
  if (originalQuiz) {
    db.quizzes.push({
      ...originalQuiz,
      id: `quiz-${Date.now()}`,
      lessonId: newLesId
    });
  }

  saveData(db);
  res.status(201).json(duplicatedLesson);
});

// Quizzes
app.get("/api/lessons/:lessonId/quiz", (req, res) => {
  db = loadData();
  const quiz = db.quizzes.find((q: any) => q.lessonId === req.params.lessonId);
  res.json(quiz || null);
});

app.post("/api/lessons/:lessonId/quiz", (req, res) => {
  db = loadData();
  const lessonId = req.params.lessonId;
  // Check if exists
  let quiz = db.quizzes.find((q: any) => q.lessonId === lessonId);
  if (quiz) {
    quiz.title = req.body.title || quiz.title;
    quiz.passingScore = req.body.passingScore ?? quiz.passingScore;
    quiz.questions = req.body.questions || quiz.questions;
  } else {
    quiz = {
      id: `quiz-${Date.now()}`,
      lessonId,
      title: req.body.title || "Lesson Assessment",
      passingScore: req.body.passingScore || 80,
      questions: req.body.questions || []
    };
    db.quizzes.push(quiz);
  }
  saveData(db);
  res.json(quiz);
});

// Assets
app.get("/api/courses/:courseId/assets", (req, res) => {
  db = loadData();
  const assets = db.assets.filter((a: any) => a.courseId === req.params.courseId);
  res.json(assets);
});

app.post("/api/courses/:courseId/assets", (req, res) => {
  db = loadData();
  const courseId = req.params.courseId;
  const newAsset = {
    id: `ast-${Date.now()}`,
    courseId,
    moduleId: req.body.moduleId || null,
    lessonId: req.body.lessonId || null,
    name: req.body.name || "Asset File",
    fileType: req.body.fileType || "pdf",
    url: req.body.url || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileSize: req.body.fileSize || "1.2 MB",
    uploadedAt: new Date().toISOString()
  };
  db.assets.push(newAsset);
  saveData(db);
  res.status(201).json(newAsset);
});

app.delete("/api/assets/:id", (req, res) => {
  db = loadData();
  db.assets = db.assets.filter((a: any) => a.id !== req.params.id);
  saveData(db);
  res.json({ success: true });
});

// Course Export Package Generator
app.get("/api/courses/:id/export-package", (req, res) => {
  db = loadData();
  const courseId = req.params.id;
  const course = db.courses.find((c: any) => c.id === courseId);
  if (!course) return res.status(404).json({ error: "Course not found" });

  const modules = db.modules.filter((m: any) => m.courseId === courseId);
  const lessons = db.lessons.filter((l: any) => l.courseId === courseId);
  const assets = db.assets.filter((a: any) => a.courseId === courseId);
  const quizzes = db.quizzes.filter((q: any) => lessons.some((l: any) => l.id === q.lessonId));

  const pkg = {
    "course.json": course,
    "README.md": `# ${course.title}\n\n${course.fullDescription}\n\nExported from V79 Academy Course Builder on ${new Date().toISOString()}`,
    modules: modules.map((m: any) => ({
      ...m,
      lessons: lessons.filter((l: any) => l.moduleId === m.id)
    })),
    quizzes,
    assets
  };

  res.json(pkg);
});

// ---------------------------------------------------------------------------
// Publish to Website (real sync, replacing the old cosmetic "Uploaded" status)
// ---------------------------------------------------------------------------
// Setting a course's status to "Uploaded" used to be a plain dropdown value
// with no effect beyond the label - nothing was ever actually sent anywhere.
// This endpoint does the real work: it transforms the course into the shape
// the website (website2026 / VISION79 marketplace) expects for a "courses"
// catalog entry, logs into that site's admin API, and creates or updates the
// corresponding entry there. Only on a confirmed successful response from
// the website does the course get marked "Uploaded" here.
const WEBSITE_SYNC_URL = (process.env.WEBSITE_SYNC_URL || "").trim().replace(/\/+$/, "");
const WEBSITE_ADMIN_PASSWORD = process.env.WEBSITE_ADMIN_PASSWORD || "";

let cachedWebsiteToken: { token: string; expiresAt: number } | null = null;

async function getWebsiteAdminToken(): Promise<string> {
  if (!WEBSITE_SYNC_URL || !WEBSITE_ADMIN_PASSWORD) {
    throw new Error(
      "Publishing isn't configured yet. Set WEBSITE_SYNC_URL (e.g. https://your-site.example.com) " +
      "and WEBSITE_ADMIN_PASSWORD in this app's environment first."
    );
  }

  if (cachedWebsiteToken && cachedWebsiteToken.expiresAt > Date.now()) {
    return cachedWebsiteToken.token;
  }

  const res = await fetch(`${WEBSITE_SYNC_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: WEBSITE_ADMIN_PASSWORD })
  });
  const data: any = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Website login failed (HTTP ${res.status}).`);
  }
  if (data.mustChangePassword) {
    throw new Error(
      "The website's admin account still has a one-time password pending. Log into the website's " +
      "/admin panel once to set a permanent password, then try publishing again."
    );
  }

  // Cache for slightly less than the website's 12-hour session TTL.
  cachedWebsiteToken = { token: data.token, expiresAt: Date.now() + 11 * 60 * 60 * 1000 };
  return data.token;
}

function slugify(title: string): string {
  return (title || "course")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "course";
}

// Resolve a quiz's correctAnswer (which may be stored as text or as an
// index, depending on how it was authored) to the numeric index the
// website's exam format requires.
function resolveCorrectAnswerIndex(options: string[], correctAnswer: string | number): number {
  if (typeof correctAnswer === "number") return correctAnswer;
  const idx = options.findIndex((o) => o === correctAnswer);
  return idx >= 0 ? idx : 0;
}

function buildWebsitePayload(course: any, modules: any[], lessons: any[], quizzes: any[]) {
  const sortedModules = [...modules].sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0));

  const chapters = sortedModules.map((mod) => {
    const moduleLessons = lessons
      .filter((l) => l.moduleId === mod.id)
      .sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0));

    return {
      title: mod.title,
      lectures: moduleLessons.map((les, idx) => ({
        id: les.id,
        title: les.title,
        duration: les.estimatedTime || "",
        freePreview: idx === 0 && sortedModules[0]?.id === mod.id,
        videoUrl: les.videoUrl || undefined,
        audioUrl: les.audioUrl || undefined,
        readingMaterial: les.lessonContent || undefined
      }))
    };
  });

  const totalLessons = lessons.length;

  const examQuestions = quizzes.flatMap((quiz: any) =>
    (quiz.questions || []).map((q: any) => ({
      question: q.questionText,
      options: q.options || [],
      correctAnswer: resolveCorrectAnswerIndex(q.options || [], q.correctAnswer)
    }))
  );

  return {
    name: course.title,
    subtitle: course.shortDescription,
    description: course.fullDescription,
    category: "courses",
    pricingType: course.pricingType || "free",
    price: course.pricingType === "premium" ? Number(course.price) || 0 : 0,
    logoUrl: course.thumbnail || "lucide:GraduationCap",
    accessUrl: `/course/${slugify(course.title)}`,
    instructor: course.instructor || "",
    duration: course.estimatedDuration || "",
    lessonsCount: totalLessons,
    curriculum: JSON.stringify(chapters),
    exam: JSON.stringify(examQuestions)
  };
}

function validateCourseForPublishing(course: any, modules: any[], lessons: any[]): string[] {
  const errors: string[] = [];
  if (!course.title || course.title.trim() === "") {
    errors.push("Course Title is required.");
  }
  if (!course.shortDescription || course.shortDescription.trim().length < 10) {
    errors.push("Course Short Description must be at least 10 characters long.");
  }
  if (!course.fullDescription || course.fullDescription.trim().length < 30) {
    errors.push("Course Full Description must be at least 30 characters long.");
  }
  if (!course.instructor || course.instructor.trim() === "") {
    errors.push("Course Instructor name is required.");
  }
  if (modules.length === 0) {
    errors.push("Course must contain at least one module.");
  }

  // Duplicate Module Title Detection
  const seenModuleTitles = new Set<string>();
  modules.forEach((mod) => {
    const normTitle = (mod.title || "").trim().toLowerCase();
    if (normTitle) {
      if (seenModuleTitles.has(normTitle)) {
        errors.push(`Duplicate Module Warning: Multiple modules are named "${mod.title}".`);
      }
      seenModuleTitles.add(normTitle);
    }
  });

  const isValidUrl = (str: string) => {
    if (!str || str.trim() === "") return true; // optional fields are fine if empty
    try {
      const url = new URL(str);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  modules.forEach((mod) => {
    const modLessons = lessons.filter((l) => l.moduleId === mod.id);
    if (modLessons.length === 0) {
      errors.push(`Module "${mod.title}" must contain at least one lesson.`);
    }

    // Duplicate Lesson Title Detection within the same module
    const seenLessonTitles = new Set<string>();

    modLessons.forEach((les) => {
      const normTitle = (les.title || "").trim().toLowerCase();
      if (normTitle) {
        if (seenLessonTitles.has(normTitle)) {
          errors.push(`Duplicate Lesson Warning: Multiple lessons in Module "${mod.title}" are named "${les.title}".`);
        }
        seenLessonTitles.add(normTitle);
      }

      if (!les.title || les.title.trim() === "") {
        errors.push(`Lesson in Module "${mod.title}" has an empty title.`);
      }
      if (!les.description || les.description.trim() === "") {
        errors.push(`Lesson "${les.title || "Untitled"}" in Module "${mod.title}" has an empty description.`);
      }

      // Link Validation checks
      if (les.videoUrl && !isValidUrl(les.videoUrl)) {
        errors.push(`Broken Link Warning: Video URL "${les.videoUrl}" in Lesson "${les.title}" has an invalid web format (must start with http:// or https://).`);
      }
      if (les.audioUrl && !isValidUrl(les.audioUrl)) {
        errors.push(`Broken Link Warning: Audio URL "${les.audioUrl}" in Lesson "${les.title}" has an invalid web format (must start with http:// or https://).`);
      }
      if (les.imageUrls && Array.isArray(les.imageUrls)) {
        les.imageUrls.forEach((img: string) => {
          if (img && !isValidUrl(img)) {
            errors.push(`Broken Link Warning: Image URL "${img}" in Lesson "${les.title}" has an invalid web format (must start with http:// or https://).`);
          }
        });
      }
      if (les.downloads && Array.isArray(les.downloads)) {
        les.downloads.forEach((dl: any) => {
          if (dl && dl.url && !isValidUrl(dl.url)) {
            errors.push(`Broken Link Warning: Download Link "${dl.url}" ("${dl.name || "Resource"}") in Lesson "${les.title}" has an invalid web format (must start with http:// or https://).`);
          }
        });
      }
    });
  });

  return errors;
}

app.post("/api/courses/:id/publish", async (req, res) => {
  db = loadData();
  const courseId = req.params.id;
  const courseIndex = db.courses.findIndex((c: any) => c.id === courseId);
  if (courseIndex === -1) return res.status(404).json({ error: "Course not found" });

  const course = db.courses[courseIndex];
  const modules = db.modules.filter((m: any) => m.courseId === courseId);
  const lessons = db.lessons.filter((l: any) => l.courseId === courseId);
  const quizzes = db.quizzes.filter((q: any) => lessons.some((l: any) => l.id === q.lessonId));

  // 1. Check Permissions: Only Admin may Publish
  const userRole = req.headers["x-user-role"] || req.body.userRole || "Admin";
  if (userRole !== "Admin") {
    return res.status(403).json({
      error: "Permissions Error: Only Admins are authorized to publish courses to the live catalog."
    });
  }

  // 2. Validate Curriculum: Prevent publishing when validation errors exist
  const validationErrors = validateCourseForPublishing(course, modules, lessons);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      error: "Validation failed before publishing. Please resolve all warnings.",
      details: validationErrors
    });
  }

  try {
    const token = await getWebsiteAdminToken();
    const payload = buildWebsitePayload(course, modules, lessons, quizzes);

    let websiteResponse: Response;
    if (course.websiteAppId) {
      websiteResponse = await fetch(`${WEBSITE_SYNC_URL}/api/apps/${course.websiteAppId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      // The remote app may have been deleted since we last published - fall
      // back to creating a new one rather than failing outright.
      if (websiteResponse.status === 404) {
        websiteResponse = await fetch(`${WEBSITE_SYNC_URL}/api/apps`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      }
    } else {
      websiteResponse = await fetch(`${WEBSITE_SYNC_URL}/api/apps`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
    }

    const websiteData: any = await websiteResponse.json().catch(() => ({}));
    if (!websiteResponse.ok) {
      throw new Error(websiteData.error || `Website rejected the publish request (HTTP ${websiteResponse.status}).`);
    }

    const now = new Date().toISOString();
    const originalStatus = course.status;
    db.courses[courseIndex] = {
      ...course,
      status: "Published", // Set status strictly to Published on success
      websiteAppId: websiteData.id,
      websitePublishedAt: now,
      updatedAt: now
    };
    saveData(db);

    // 3. Log publishing event successfully
    PublishingLogRepository.create({
      courseId: course.id,
      courseTitle: course.title,
      event: "Published Sync",
      fromStatus: originalStatus,
      toStatus: "Published",
      performedBy: userRole as any,
      details: `Successfully synchronized and published course curriculum with website. Website App ID: ${websiteData.id}`
    });

    res.json({ success: true, course: db.courses[courseIndex], websiteAppId: websiteData.id });
  } catch (err: any) {
    console.error("[Publish] Failed to sync course to website:", err);
    res.status(502).json({ error: err.message || "Failed to publish course to the website." });
  }
});

// ===========================================================================
// V79 Course Builder Phase 1 - Database Architecture APIs
// ===========================================================================

// 1. Content Blocks APIs
app.get("/api/lessons/:lessonId/content-blocks", (req, res) => {
  try {
    const blocks = ContentBlockRepository.findAllByLessonId(req.params.lessonId);
    res.json(blocks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/lessons/:lessonId/content-blocks", (req, res) => {
  try {
    const block = CourseBuilderService.addContentBlock(
      req.params.lessonId,
      req.body.type,
      req.body.contentData || {}
    );
    res.status(201).json(block);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/content-blocks/:id", (req, res) => {
  try {
    const block = ContentBlockRepository.update(req.params.id, req.body);
    if (!block) return res.status(404).json({ error: "Content block not found" });
    res.json(block);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/content-blocks/:id", (req, res) => {
  try {
    const success = ContentBlockRepository.delete(req.params.id);
    if (!success) return res.status(404).json({ error: "Content block not found" });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/lessons/:lessonId/content-blocks/reorder", (req, res) => {
  try {
    const { blockIds } = req.body;
    if (!Array.isArray(blockIds)) {
      return res.status(400).json({ error: "blockIds array is required" });
    }
    const blocks = CourseBuilderService.reorderContentBlocks(req.params.lessonId, blockIds);
    res.json(blocks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Assignments APIs
app.get("/api/courses/:courseId/assignments", (req, res) => {
  try {
    const assignments = AssignmentRepository.findAllByCourseId(req.params.courseId);
    res.json(assignments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/courses/:courseId/assignments", (req, res) => {
  try {
    const assignment = AssignmentRepository.create({
      id: `assign-${Date.now()}`,
      courseId: req.params.courseId,
      moduleId: req.body.moduleId,
      lessonId: req.body.lessonId,
      title: req.body.title || "Untitled Assignment",
      description: req.body.description || "",
      maxPoints: req.body.maxPoints ?? 100,
      submissionType: req.body.submissionType || "file",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    res.status(201).json(assignment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/assignments/:id", (req, res) => {
  try {
    const assignment = AssignmentRepository.update(req.params.id, req.body);
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });
    res.json(assignment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/assignments/:id", (req, res) => {
  try {
    const success = AssignmentRepository.delete(req.params.id);
    if (!success) return res.status(404).json({ error: "Assignment not found" });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Downloads APIs
app.get("/api/courses/:courseId/downloads", (req, res) => {
  try {
    const downloads = DownloadRepository.findAllByCourseId(req.params.courseId);
    res.json(downloads);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/courses/:courseId/downloads", (req, res) => {
  try {
    const download = DownloadRepository.create({
      id: `dl-${Date.now()}`,
      courseId: req.params.courseId,
      lessonId: req.body.lessonId,
      name: req.body.name || "Resource Attachment",
      fileType: req.body.fileType || "pdf",
      url: req.body.url || "#",
      fileSize: req.body.fileSize || "1.0 MB",
      createdAt: new Date().toISOString()
    });
    res.status(201).json(download);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/downloads/:id", (req, res) => {
  try {
    const download = DownloadRepository.update(req.params.id, req.body);
    if (!download) return res.status(404).json({ error: "Download not found" });
    res.json(download);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/downloads/:id", (req, res) => {
  try {
    const success = DownloadRepository.delete(req.params.id);
    if (!success) return res.status(404).json({ error: "Download not found" });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Media APIs
app.get("/api/courses/:courseId/media", (req, res) => {
  try {
    const media = MediaRepository.findAllByCourseId(req.params.courseId);
    res.json(media);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/courses/:courseId/media", (req, res) => {
  try {
    const media = MediaRepository.create({
      id: `med-${Date.now()}`,
      courseId: req.params.courseId,
      name: req.body.name || "Media File",
      fileType: req.body.fileType || "image",
      url: req.body.url || "",
      fileSize: req.body.fileSize || "1.0 MB",
      createdAt: new Date().toISOString()
    });
    res.status(201).json(media);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/media/:id", (req, res) => {
  try {
    const success = MediaRepository.delete(req.params.id);
    if (!success) return res.status(404).json({ error: "Media not found" });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Versioning APIs
app.get("/api/courses/:courseId/versions", (req, res) => {
  try {
    const versions = CourseVersionRepository.findAllByCourseId(req.params.courseId);
    res.json(versions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/courses/:courseId/versions", (req, res) => {
  try {
    const { versionNumber, changelog, exportedBy } = req.body;
    const userRole = req.headers["x-user-role"] || req.body.userRole || "Admin";
    if (!versionNumber) return res.status(400).json({ error: "versionNumber is required" });
    const version = CourseBuilderService.createVersion(
      req.params.courseId,
      versionNumber,
      changelog || "",
      exportedBy || "Administrator"
    );

    // Fetch the course title
    const course = db.courses.find((c: any) => c.id === req.params.courseId);
    PublishingLogRepository.create({
      courseId: req.params.courseId,
      courseTitle: course ? course.title : "Unknown Course",
      event: "Version Snapshot Created",
      fromStatus: course ? course.status : "Draft",
      toStatus: course ? course.status : "Draft",
      performedBy: userRole as any,
      details: `Created version snapshot ${versionNumber}. Changelog: "${changelog || "No details provided"}"`
    });

    res.status(201).json(version);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/courses/:courseId/versions/:versionId/rollback", (req, res) => {
  try {
    const userRole = req.headers["x-user-role"] || req.body.userRole || "Admin";
    const course = CourseBuilderService.rollbackToVersion(req.params.courseId, req.params.versionId);
    
    // Log rollback action
    PublishingLogRepository.create({
      courseId: req.params.courseId,
      courseTitle: course ? course.title : "Unknown Course",
      event: "Restore Point Rollback",
      fromStatus: course ? course.status : "Draft",
      toStatus: course ? course.status : "Draft",
      performedBy: userRole as any,
      details: `Rolled back course curriculum to version snapshot ${req.params.versionId}.`
    });

    res.json({ success: true, course });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Import History APIs
app.get("/api/import-histories", (req, res) => {
  try {
    const histories = ImportHistoryRepository.findAll();
    res.json(histories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/courses/import", (req, res) => {
  try {
    const { packageData, importedBy, sourceFileName } = req.body;
    const userRole = req.headers["x-user-role"] || req.body.userRole || "Admin";
    if (!packageData) return res.status(400).json({ error: "packageData is required" });
    const log = CourseBuilderService.importCoursePackage(
      packageData,
      importedBy || "Administrator",
      sourceFileName || "imported_package.json"
    );

    // Log the import event
    PublishingLogRepository.create({
      courseId: log.importedCourseId || "new-import",
      courseTitle: packageData.course?.title || "Imported Course",
      event: "Imported",
      fromStatus: "None",
      toStatus: "Imported",
      performedBy: userRole as any,
      details: `Course curriculum package imported from ${sourceFileName || "file"}. Status: ${log.status}`
    });

    res.json(log);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Course Duplication API
app.post("/api/courses/:id/duplicate", (req, res) => {
  try {
    db = loadData();
    const courseId = req.params.id;
    const originalCourse = db.courses.find((c: any) => c.id === courseId);
    if (!originalCourse) return res.status(404).json({ error: "Course not found" });

    const userRole = req.headers["x-user-role"] || req.body.userRole || "Admin";
    const newCourseId = `course-dup-${Date.now()}`;
    const now = new Date().toISOString();

    const duplicatedCourse = {
      ...originalCourse,
      id: newCourseId,
      title: `${originalCourse.title} (Copy)`,
      status: "Draft", // Always duplicate as Draft
      websiteAppId: undefined, // Reset website link
      websitePublishedAt: undefined,
      createdAt: now,
      updatedAt: now
    };

    db.courses.push(duplicatedCourse);

    // Duplicate Modules
    const originalModules = db.modules.filter((m: any) => m.courseId === courseId);
    const moduleMap = new Map<string, string>();

    originalModules.forEach((mod: any) => {
      const newModuleId = `mod-dup-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      moduleMap.set(mod.id, newModuleId);
      db.modules.push({
        ...mod,
        id: newModuleId,
        courseId: newCourseId,
        title: mod.title
      });
    });

    // Duplicate Lessons, Content Blocks, Quizzes
    const originalLessons = db.lessons.filter((l: any) => l.courseId === courseId);
    originalLessons.forEach((les: any, lIdx: number) => {
      const newLessonId = `les-dup-${Date.now()}-${lIdx}`;
      const newModuleId = les.moduleId ? moduleMap.get(les.moduleId) : undefined;

      db.lessons.push({
        ...les,
        id: newLessonId,
        courseId: newCourseId,
        moduleId: newModuleId || "",
        title: les.title
      });

      // Duplicate content blocks
      const originalBlocks = db.contentBlocks.filter((cb: any) => cb.lessonId === les.id);
      originalBlocks.forEach((cb: any, cbIdx: number) => {
        db.contentBlocks.push({
          ...cb,
          id: `cb-dup-${Date.now()}-${lIdx}-${cbIdx}`,
          lessonId: newLessonId
        });
      });

      // Duplicate quizzes
      const originalQuiz = db.quizzes.find((q: any) => q.lessonId === les.id);
      if (originalQuiz) {
        db.quizzes.push({
          ...originalQuiz,
          id: `quiz-dup-${Date.now()}-${lIdx}`,
          lessonId: newLessonId
        });
      }
    });

    // Duplicate standalone assignments, downloads
    const originalAssignments = db.assignments.filter((as: any) => as.courseId === courseId);
    originalAssignments.forEach((as: any, asIdx: number) => {
      const newLessonId = as.lessonId ? db.lessons.find((l: any) => l.courseId === newCourseId && l.title === db.lessons.find((ol: any) => ol.id === as.lessonId)?.title)?.id : undefined;
      db.assignments.push({
        ...as,
        id: `assign-dup-${Date.now()}-${asIdx}`,
        courseId: newCourseId,
        lessonId: newLessonId,
        moduleId: as.moduleId ? moduleMap.get(as.moduleId) : undefined
      });
    });

    const originalDownloads = db.downloads.filter((dl: any) => dl.courseId === courseId);
    originalDownloads.forEach((dl: any, dlIdx: number) => {
      const newLessonId = dl.lessonId ? db.lessons.find((l: any) => l.courseId === newCourseId && l.title === db.lessons.find((ol: any) => ol.id === dl.lessonId)?.title)?.id : undefined;
      db.downloads.push({
        ...dl,
        id: `dl-dup-${Date.now()}-${dlIdx}`,
        courseId: newCourseId,
        lessonId: newLessonId
      });
    });

    const originalMedia = db.media.filter((m: any) => m.courseId === courseId);
    originalMedia.forEach((m: any, mIdx: number) => {
      db.media.push({
        ...m,
        id: `media-dup-${Date.now()}-${mIdx}`,
        courseId: newCourseId
      });
    });

    // Log course duplication event
    PublishingLogRepository.create({
      courseId: originalCourse.id,
      courseTitle: originalCourse.title,
      event: "Course Duplicated",
      fromStatus: originalCourse.status,
      toStatus: "Draft",
      performedBy: userRole as any,
      details: `Course duplicated. New Course: "${duplicatedCourse.title}" (ID: ${newCourseId})`
    });

    saveData(db);
    res.status(201).json(duplicatedCourse);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Publishing & Event Logs APIs
app.get("/api/publishing-logs", (req, res) => {
  try {
    const logs = PublishingLogRepository.findAll();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/courses/:courseId/publishing-logs", (req, res) => {
  try {
    const logs = PublishingLogRepository.findAllByCourseId(req.params.courseId);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/courses/parse-curriculum", (req, res) => {
  try {
    const { text } = req.body;
    if (typeof text !== "string") {
      return res.status(400).json({ error: "text content is required" });
    }
    const parser = new UnifiedCurriculumParser();
    const parsedCourse = parser.parse(text);
    res.json(parsedCourse);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Gemini AI Assistant Endpoint
app.post("/api/gemini/assist", async (req, res) => {
  try {
    const { prompt, type } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: "Gemini API key not configured. Please add GEMINI_API_KEY in Secrets." });
    }

    const ai = new GoogleGenAI({ apiKey });

    let systemInstruction = "You are an expert instructional designer and senior curriculum architect for V79 Academy applications (Fire Finance Pro, SIWM, Tiquet, KashDash). Provide precise, professional, educational content in JSON or Markdown format as requested.";
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Gemini AI error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI content" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`V79 Academy Course Builder running on http://localhost:${PORT}`);
  });
}

startServer();

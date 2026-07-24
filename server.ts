import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Data storage file path
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

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
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error loading data:", e);
  }
  saveData(initialData);
  return initialData;
}

function saveData(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving data:", e);
  }
}

let db = loadData();

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

  db.courses[index] = {
    ...db.courses[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  saveData(db);
  res.json(db.courses[index]);
});

app.delete("/api/courses/:id", (req, res) => {
  db = loadData();
  const courseId = req.params.id;
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

app.post("/api/courses/:id/publish", async (req, res) => {
  db = loadData();
  const courseId = req.params.id;
  const courseIndex = db.courses.findIndex((c: any) => c.id === courseId);
  if (courseIndex === -1) return res.status(404).json({ error: "Course not found" });

  const course = db.courses[courseIndex];
  const modules = db.modules.filter((m: any) => m.courseId === courseId);
  const lessons = db.lessons.filter((l: any) => l.courseId === courseId);
  const quizzes = db.quizzes.filter((q: any) => lessons.some((l: any) => l.id === q.lessonId));

  if (modules.length === 0 || lessons.length === 0) {
    return res.status(400).json({ error: "Add at least one module with a lesson before publishing." });
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
    db.courses[courseIndex] = {
      ...course,
      status: "Uploaded",
      websiteAppId: websiteData.id,
      websitePublishedAt: now,
      updatedAt: now
    };
    saveData(db);

    res.json({ success: true, course: db.courses[courseIndex], websiteAppId: websiteData.id });
  } catch (err: any) {
    console.error("[Publish] Failed to sync course to website:", err);
    res.status(502).json({ error: err.message || "Failed to publish course to the website." });
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
      model: "gemini-3.6-flash",
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

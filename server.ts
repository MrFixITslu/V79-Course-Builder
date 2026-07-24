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

// No fabricated demo courses are seeded. A production deployment should
// start with a genuinely empty catalog; real courses are authored through
// this app's editor. (Previously this contained fake instructor personas
// such as "Elena Vance, CFA" and dummy lesson content pointing at a public
// stock sample video - that has been removed.)
const initialData = {
  courses: [],
  modules: [],
  lessons: [],
  quizzes: [],
  assets: []
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

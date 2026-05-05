import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { prisma } from "./db";
import authRoutes from "./auth/authRoutes";
import { authenticateToken } from "./middleware/authenticate";
import { verifyAuthToken, signAuthToken } from "./lib/jwt";
import { CORS_ORIGIN } from "./config";
import { setAuthCookie } from "./lib/cookies";
import { sendEmail } from "./lib/mailer";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

const uploadsRoot = path.join(process.cwd(), "uploads");
const resumesDir = path.join(uploadsRoot, "resumes");
const logosDir = path.join(uploadsRoot, "logos");
const jobMediaStoreFile = path.join(uploadsRoot, "job-media.json");
fs.mkdirSync(resumesDir, { recursive: true });
fs.mkdirSync(logosDir, { recursive: true });
if (!fs.existsSync(jobMediaStoreFile)) {
  fs.writeFileSync(jobMediaStoreFile, "{}", "utf8");
}
app.use("/uploads", express.static(uploadsRoot));

type JobTheme = "peach" | "mint" | "lavender" | "sky" | "pink" | "cream";
type JobMedia = { organizationLogoUrl?: string; cardTheme?: JobTheme };

const allowedThemes = new Set<JobTheme>(["peach", "mint", "lavender", "sky", "pink", "cream"]);

const HR_WRITE_ROLES = new Set(["HR", "ADMIN_HR", "ADMIN"]);
const HR_VIEW_ROLES = new Set(["HR", "ADMIN_HR", "SUB_HR", "ADMIN"]);
const ADMIN_ROLES = new Set(["ADMIN"]);
const APPLICATION_STATUSES = ["PENDING", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED", "HIRED"];

function renderTemplate(source: string, data: Record<string, string>) {
  return source.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_match, key) => data[key] || "");
}

function normalizeTheme(value: unknown): JobTheme | undefined {
  const raw = String(value || "").toLowerCase() as JobTheme;
  return allowedThemes.has(raw) ? raw : undefined;
}

function readJobMediaStore(): Record<string, JobMedia> {
  try {
    const raw = fs.readFileSync(jobMediaStoreFile, "utf8");
    const parsed = JSON.parse(raw || "{}");
    if (parsed && typeof parsed === "object") return parsed;
    return {};
  } catch {
    return {};
  }
}

function writeJobMediaStore(data: Record<string, JobMedia>) {
  fs.writeFileSync(jobMediaStoreFile, JSON.stringify(data, null, 2), "utf8");
}

function upsertJobMedia(jobId: string, patch: JobMedia) {
  const store = readJobMediaStore();
  const current = store[jobId] || {};
  store[jobId] = { ...current, ...patch };
  writeJobMediaStore(store);
}

function enrichJobWithMedia(job: any) {
  const media = readJobMediaStore()[String(job?.id || "")] || {};
  return { ...job, organizationLogoUrl: media.organizationLogoUrl || "", cardTheme: media.cardTheme || "" };
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req: any, _file: any, cb: any) => cb(null, resumesDir),
    filename: (_req: any, file: any, cb: any) => {
      const safeName = file.originalname.replace(/\s+/g, "-");
      cb(null, `${Date.now()}-${safeName}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req: any, file: any, cb: any) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF resumes are allowed"));
      return;
    }
    cb(null, true);
  },
});

const uploadJobLogo = multer({
  storage: multer.diskStorage({
    destination: (_req: any, _file: any, cb: any) => cb(null, logosDir),
    filename: (_req: any, file: any, cb: any) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      const safeExt = ext || ".png";
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e8)}${safeExt}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req: any, file: any, cb: any) => {
    if (!String(file.mimetype || "").startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});

// ── API Routes ────────────────────────────
app.use("/api/auth", authRoutes);

// DEBUG: Verify engine sees new columns
app.get("/api/debug/jobs", async (_req: any, res: any) => {
  try {
    const rows: any[] = await prisma.$queryRaw`SELECT id, organizationName, workplaceType, seniorityLevel, jobFunction, industry, experienceYears, requiredSkills, applicationMode, applicationEmail, requireResume, externalApplyUrl FROM "Job" LIMIT 5`;
    res.json({ engine: "raw", rows });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 4. Jobs: Get all jobs
app.get("/api/jobs", async (req: any, res: any) => {
  try {
    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader && String(authHeader).split(" ")[1];
    const cookieToken = req.cookies?.univhire_token;
    const token = bearerToken || cookieToken;
    const wantsAll = String(req.query.includeClosed || "") === "1";

    let viewerRole = "";
    let viewerId = "";
    if (token) {
      try {
        const decoded = verifyAuthToken(token);
        viewerRole = String(decoded?.role || "").toUpperCase();
        viewerId = String(decoded?.id || "");
      } catch {
        viewerRole = "";
      }
    }

    const canSeeClosed = wantsAll && HR_VIEW_ROLES.has(viewerRole);
    const filters: any[] = [];
    if (!canSeeClosed) filters.push({ status: "OPEN" });

    if (viewerRole === "HR" || viewerRole === "ADMIN_HR") {
      filters.push({ hrId: viewerId });
    } else if (viewerRole === "SUB_HR" && viewerId) {
      const viewer = await prisma.user.findUnique({ where: { id: viewerId }, select: { university: true } });
      if (viewer?.university) {
        filters.push({ hr: { university: viewer.university } });
      }
    }

    const where = filters.length ? { AND: filters } : undefined;

    const jobs = await prisma.job.findMany({
      where,
      include: { hr: { select: { name: true, email: true, university: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs.map(enrichJobWithMedia));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// 4b. Jobs: Get single job by id
app.get("/api/jobs/:id", async (req: any, res: any) => {
  try {
    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader && String(authHeader).split(" ")[1];
    const cookieToken = req.cookies?.univhire_token;
    const token = bearerToken || cookieToken;

    let viewer: { id?: string; role?: string } = {};
    if (token) {
      try {
        const decoded = verifyAuthToken(token);
        viewer = { id: decoded?.id, role: String(decoded?.role || "").toUpperCase() };
      } catch {
        viewer = {};
      }
    }

    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { hr: { select: { id: true, name: true, email: true, university: true } } },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const isOwnerHr = (viewer.role === "HR" || viewer.role === "ADMIN_HR") && viewer.id === job.hrId;
    const isAdmin = viewer.role === "ADMIN";
    let isSubHr = false;
    if (viewer.role === "SUB_HR" && viewer.id) {
      const viewerUser = await prisma.user.findUnique({ where: { id: viewer.id }, select: { university: true } });
      isSubHr = Boolean(viewerUser?.university && viewerUser.university === job.hr?.university);
    }

    if (job.status !== "OPEN" && !isOwnerHr && !isAdmin && !isSubHr) {
      return res.status(404).json({ error: "Job not found" });
    }

    return res.json(enrichJobWithMedia(job));
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch job" });
  }
});

// 5. Jobs: Create a job (HR Only)
app.post("/api/jobs", authenticateToken, async (req: any, res: any) => {
  try {
    if (!HR_WRITE_ROLES.has(String(req.user.role || "").toUpperCase())) {
      return res.status(403).json({ error: "Forbidden. HR access required." });
    }

    const {
      title, organizationName, universityName, description, location,
      jobType, workplaceType, seniorityLevel,
      jobFunction, industry, experienceYears,
      salary, requiredSkills, screeningQuestions,
      applicantMode, applicantEmail, requireResume, externalUrl,
      cardTheme,
    } = req.body;

    const hrUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, role: true, name: true, email: true, university: true },
    });

    if (!hrUser) {
      return res.status(401).json({ error: "Session is invalid. Please login again." });
    }

    if (!HR_WRITE_ROLES.has(String(hrUser.role || "").toUpperCase())) {
      return res.status(403).json({ error: "Your account does not have HR access." });
    }

    const computedOrganizationName =
      (organizationName || universityName || hrUser?.university || hrUser?.name || "").trim();

    const computedApplicationMode = applicantMode === "external" ? "EXTERNAL" : "PLATFORM";
    const computedApplicationEmail =
      (applicantEmail || (computedApplicationMode === "PLATFORM" ? hrUser?.email : "") || "").trim();

    if (!title || !description || !location || !jobType) {
      return res.status(400).json({ error: "title, description, location and jobType are required" });
    }

    const jobData: any = {
      title,
      organizationName: computedOrganizationName,
      description,
      location,
      jobType: jobType || "FULL_TIME",
      hrId: req.user.id,
    };

    // Extended fields (added via migration) — include only if present
    if (workplaceType) jobData.workplaceType = workplaceType;
    if (seniorityLevel) jobData.seniorityLevel = seniorityLevel;
    if (jobFunction !== undefined) {
      jobData.jobFunction = Array.isArray(jobFunction)
        ? jobFunction.join(",")
        : (jobFunction || "");
    }
    if (industry !== undefined) {
      jobData.industry = Array.isArray(industry)
        ? industry.join(",")
        : (industry || "");
    }
    if (experienceYears !== undefined) jobData.experienceYears = Number(experienceYears) || 0;
    if (salary !== undefined) jobData.salary = String(salary || "").trim();
    if (requiredSkills !== undefined) {
      jobData.requiredSkills = Array.isArray(requiredSkills)
        ? requiredSkills.join(",")
        : (requiredSkills || "");
    }
    if (screeningQuestions !== undefined) {
      jobData.screeningQuestions = Array.isArray(screeningQuestions)
        ? JSON.stringify(screeningQuestions) : (screeningQuestions || "[]");
    }
    if (applicantMode !== undefined) jobData.applicationMode = computedApplicationMode;
    if (applicantEmail !== undefined || computedApplicationMode === "PLATFORM") {
      jobData.applicationEmail = computedApplicationEmail;
    }
    if (requireResume !== undefined) jobData.requireResume = Boolean(requireResume);
    if (externalUrl !== undefined) jobData.externalApplyUrl = externalUrl || "";

    let job: any;
    try {
      job = await prisma.job.create({ data: jobData });
    } catch (innerErr: any) {
      // If extended fields not yet known by client, fall back to basic create
      console.warn("Extended create failed, falling back to basic:", innerErr?.message);
      job = await prisma.job.create({
        data: { title, description, location, jobType: jobType || "FULL_TIME", hrId: req.user.id },
      });
    }

    const normalizedTheme = normalizeTheme(cardTheme);
    if (normalizedTheme) {
      upsertJobMedia(String(job.id), { cardTheme: normalizedTheme });
    }

    res.status(201).json(enrichJobWithMedia(job));
  } catch (error: any) {
    console.error("CREATE JOB ERROR:", error);

    if (error?.code === "P2003") {
      return res.status(401).json({ error: "Session is invalid or expired. Please login again." });
    }

    res.status(500).json({ error: "Failed to create job", detail: String(error) });
  }
});

// 5b. Jobs: Update a job (HR/Admin, owner for HR)
app.patch("/api/jobs/:id", authenticateToken, async (req: any, res: any) => {
  try {
    const role = String(req.user.role || "").toUpperCase();
    if (!HR_WRITE_ROLES.has(role)) {
      return res.status(403).json({ error: "Forbidden. HR access required." });
    }

    const existingJob = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!existingJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    if ((role === "HR" || role === "ADMIN_HR") && existingJob.hrId !== req.user.id) {
      return res.status(403).json({ error: "You can only update your own jobs." });
    }

    const data: Record<string, any> = {};

    if ("title" in req.body) data.title = String(req.body.title || "").trim();
    if ("organizationName" in req.body) data.organizationName = String(req.body.organizationName || "").trim();
    if ("description" in req.body) data.description = String(req.body.description || "").trim();
    if ("location" in req.body) data.location = String(req.body.location || "").trim();
    if ("jobType" in req.body) data.jobType = String(req.body.jobType || "").trim() || existingJob.jobType;
    if ("workplaceType" in req.body) data.workplaceType = String(req.body.workplaceType || "").trim() || existingJob.workplaceType;
    if ("seniorityLevel" in req.body) data.seniorityLevel = String(req.body.seniorityLevel || "").trim() || existingJob.seniorityLevel;
    if ("jobFunction" in req.body) data.jobFunction = Array.isArray(req.body.jobFunction) ? req.body.jobFunction.join(",") : String(req.body.jobFunction || "");
    if ("industry" in req.body) data.industry = Array.isArray(req.body.industry) ? req.body.industry.join(",") : String(req.body.industry || "");
    if ("experienceYears" in req.body) data.experienceYears = Number(req.body.experienceYears) || 0;
    if ("salary" in req.body) data.salary = String(req.body.salary || "").trim();
    if ("requiredSkills" in req.body) data.requiredSkills = Array.isArray(req.body.requiredSkills) ? req.body.requiredSkills.join(",") : String(req.body.requiredSkills || "");
    if ("screeningQuestions" in req.body) {
      data.screeningQuestions = Array.isArray(req.body.screeningQuestions)
        ? JSON.stringify(req.body.screeningQuestions)
        : String(req.body.screeningQuestions || "[]");
    }
    if ("applicationMode" in req.body) data.applicationMode = String(req.body.applicationMode || "").trim() || existingJob.applicationMode;
    if ("applicationEmail" in req.body) data.applicationEmail = String(req.body.applicationEmail || "").trim();
    if ("requireResume" in req.body) data.requireResume = Boolean(req.body.requireResume);
    if ("externalApplyUrl" in req.body) data.externalApplyUrl = String(req.body.externalApplyUrl || "").trim();

    if ("status" in req.body) {
      const nextStatus = String(req.body.status || "").toUpperCase();
      if (!["OPEN", "CLOSED"].includes(nextStatus)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      data.status = nextStatus;
    }

    if (!Object.keys(data).length && !("cardTheme" in req.body)) {
      return res.status(400).json({ error: "No valid fields provided" });
    }

    const updated = Object.keys(data).length
      ? await prisma.job.update({ where: { id: req.params.id }, data })
      : existingJob;

    if ("cardTheme" in req.body) {
      const normalizedTheme = normalizeTheme(req.body.cardTheme);
      if (normalizedTheme) {
        upsertJobMedia(String(req.params.id), { cardTheme: normalizedTheme });
      }
    }

    return res.json(enrichJobWithMedia(updated));
  } catch {
    return res.status(500).json({ error: "Failed to update job" });
  }
});

app.post("/api/jobs/:id/logo", authenticateToken, uploadJobLogo.single("logo"), async (req: any, res: any) => {
  try {
    const role = String(req.user.role || "").toUpperCase();
    if (!HR_WRITE_ROLES.has(role)) {
      return res.status(403).json({ error: "Forbidden. HR access required." });
    }

    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      select: { id: true, hrId: true },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (role !== "ADMIN" && job.hrId !== req.user.id) {
      return res.status(403).json({ error: "You can upload logos only for your own jobs" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Logo file is required" });
    }

    const logoUrl = `/uploads/logos/${req.file.filename}`;
    upsertJobMedia(String(job.id), { organizationLogoUrl: logoUrl });

    return res.json({ ok: true, logoUrl });
  } catch (error) {
    return res.status(500).json({ error: "Failed to upload logo" });
  }
});

// 6. Applications: Apply for a job (Candidate Only)
app.post("/api/applications", authenticateToken, upload.single("resume"), async (req: any, res: any) => {
  try {
    if (req.user.role !== "CANDIDATE") {
      return res.status(403).json({ error: "Forbidden. Candidate access required." });
    }

    const { jobId, candidatePhone, address, currentLocation } = req.body;
    const resumeUrl = req.file ? `/uploads/resumes/${req.file.filename}` : null;

    if (!jobId) {
      return res.status(400).json({ error: "jobId is required" });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId }, select: { id: true, status: true } });
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    if (String(job.status || "").toUpperCase() !== "OPEN") {
      return res.status(400).json({ error: "This job is not accepting applications right now." });
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId: req.user.id,
        candidatePhone: candidatePhone || null,
        candidateAddress: address || null,
        currentLocation: currentLocation || null,
        resumeUrl,
      }
    });

    res.status(201).json(application);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "You have already applied to this job." });
    }
    res.status(500).json({ error: "Failed to submit application" });
  }
});

// 6b. Applications: List applications for current user
app.get("/api/applications", authenticateToken, async (req: any, res: any) => {
  try {
    if (req.user.role === "CANDIDATE") {
      const applications = await prisma.application.findMany({
        where: { candidateId: req.user.id },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              jobType: true,
              hr: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { appliedAt: "desc" },
      });
      return res.json(applications);
    }

    const role = String(req.user.role || "").toUpperCase();
    if (HR_VIEW_ROLES.has(role) && role !== "ADMIN") {
      const q = String(req.query.q || "").trim();
      const status = String(req.query.status || "").toUpperCase();
      const jobType = String(req.query.jobType || "").trim();
      const savedOnly = String(req.query.saved || "") === "1";

      const filters: any[] = [];
      if (role === "HR" || role === "ADMIN_HR") {
        filters.push({ job: { hrId: req.user.id } });
      } else if (role === "SUB_HR") {
        const viewer = await prisma.user.findUnique({ where: { id: req.user.id }, select: { university: true } });
        if (viewer?.university) {
          filters.push({ job: { hr: { university: viewer.university } } });
        }
      }

      if (APPLICATION_STATUSES.includes(status)) {
        filters.push({ status });
      }

      if (jobType) {
        filters.push({ job: { jobType } });
      }

      if (savedOnly) {
        filters.push({ hrSaves: { some: { hrId: req.user.id } } });
      }

      if (q) {
        filters.push({
          OR: [
            { candidate: { name: { contains: q, mode: "insensitive" } } },
            { candidate: { email: { contains: q, mode: "insensitive" } } },
            { candidate: { skills: { contains: q, mode: "insensitive" } } },
            { job: { title: { contains: q, mode: "insensitive" } } },
            { job: { jobType: { contains: q, mode: "insensitive" } } },
          ],
        });
      }

      const applications = await prisma.application.findMany({
        where: filters.length ? { AND: filters } : undefined,
        include: {
          job: { select: { id: true, title: true, location: true, jobType: true } },
          candidate: { select: { id: true, name: true, email: true, skills: true } },
          hrSaves: { where: { hrId: req.user.id }, select: { id: true } },
          _count: { select: { notes: true } },
        },
        orderBy: { appliedAt: "desc" },
      });
      return res.json(
        applications.map((app) => ({
          ...app,
          isSaved: app.hrSaves?.length > 0,
          notesCount: app._count?.notes || 0,
        }))
      );
    }

    const applications = await prisma.application.findMany({
      include: {
        job: { select: { id: true, title: true, location: true, jobType: true } },
        candidate: { select: { id: true, name: true, email: true } },
      },
      orderBy: { appliedAt: "desc" },
    });
    return res.json(applications);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// 6bb. Applications: Get one application by id
app.get("/api/applications/:id", authenticateToken, async (req: any, res: any) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            jobType: true,
            hrId: true,
            hr: { select: { id: true, university: true } },
          },
        },
        candidate: { select: { id: true, name: true, email: true, skills: true } },
        hrSaves: { where: { hrId: req.user.id }, select: { id: true } },
        notes: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (req.user.role === "CANDIDATE" && application.candidateId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const role = String(req.user.role || "").toUpperCase();
    if (role === "HR" || role === "ADMIN_HR") {
      if (application.job.hrId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }
    if (role === "SUB_HR") {
      const viewer = await prisma.user.findUnique({ where: { id: req.user.id }, select: { university: true } });
      if (!viewer?.university || viewer.university !== application.job.hr?.university) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    return res.json(application);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch application" });
  }
});

// 6c. Applications: Update status (HR/Admin)
app.patch("/api/applications/:id/status", authenticateToken, async (req: any, res: any) => {
  try {
    const role = String(req.user.role || "").toUpperCase();
    if (!HR_WRITE_ROLES.has(role)) {
      return res.status(403).json({ error: "Forbidden. HR access required." });
    }

    const nextStatus = String(req.body.status || "").toUpperCase();
    if (!APPLICATION_STATUSES.includes(nextStatus)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const existing = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { job: { select: { hrId: true } } },
    });

    if (!existing) {
      return res.status(404).json({ error: "Application not found" });
    }

    if ((role === "HR" || role === "ADMIN_HR") && existing.job.hrId !== req.user.id) {
      return res.status(403).json({ error: "You can only update applications for your jobs." });
    }

    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: { status: nextStatus },
    });

    const shouldSendEmail = Boolean(req.body?.sendEmail);
    if (shouldSendEmail) {
      const templateId = String(req.body?.templateId || "").trim();
      const appWithRelations = await prisma.application.findUnique({
        where: { id: req.params.id },
        include: { job: true, candidate: true },
      });

      if (appWithRelations?.candidate?.email) {
        const template = templateId
          ? await prisma.emailTemplate.findFirst({
              where: {
                id: templateId,
                OR: [
                  { hrId: req.user.id },
                  { hrId: appWithRelations.job?.hrId || "" },
                ],
              },
            })
          : null;

        const data = {
          candidateName: String(appWithRelations.candidate?.name || "Candidate"),
          jobTitle: String(appWithRelations.job?.title || "Job"),
          status: nextStatus,
        };

        const subject = template
          ? renderTemplate(template.subject, data)
          : `Update on your ${data.jobTitle} application`;
        const body = template
          ? renderTemplate(template.body, data)
          : `Hello ${data.candidateName},\n\nYour application status is now ${data.status}.\n\nRegards,\nUnivHire`;

        try {
          await sendEmail({ to: appWithRelations.candidate.email, subject, text: body });
        } catch (err) {
          console.error("Email send failed:", err);
        }
      }
    }

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update application status" });
  }
});

// 6d. HR: Save/unsave candidates (shortlist bucket)
app.get("/api/hr/saved-candidates", authenticateToken, async (req: any, res: any) => {
  try {
    const role = String(req.user.role || "").toUpperCase();
    if (!HR_VIEW_ROLES.has(role)) {
      return res.status(403).json({ error: "Forbidden. HR access required." });
    }

    const saved = await prisma.hRCandidateSave.findMany({
      where: { hrId: req.user.id },
      include: {
        application: {
          include: {
            job: { select: { id: true, title: true, location: true, jobType: true } },
            candidate: { select: { id: true, name: true, email: true, skills: true } },
          },
        },
      },
      orderBy: { savedAt: "desc" },
    });

    return res.json(saved.map((s) => ({ ...s.application, isSaved: true })));
  } catch {
    return res.status(500).json({ error: "Failed to fetch saved candidates" });
  }
});

app.post("/api/hr/saved-candidates", authenticateToken, async (req: any, res: any) => {
  try {
    const role = String(req.user.role || "").toUpperCase();
    if (!HR_WRITE_ROLES.has(role)) {
      return res.status(403).json({ error: "Forbidden. HR access required." });
    }

    const applicationId = String(req.body?.applicationId || "").trim();
    if (!applicationId) return res.status(400).json({ error: "applicationId is required" });

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: { select: { id: true, hrId: true } } },
    });
    if (!application) return res.status(404).json({ error: "Application not found" });
    if ((role === "HR" || role === "ADMIN_HR") && application.job.hrId !== req.user.id) {
      return res.status(403).json({ error: "You can only save candidates for your jobs." });
    }

    const saved = await prisma.hRCandidateSave.upsert({
      where: { hrId_applicationId: { hrId: req.user.id, applicationId } },
      create: {
        hrId: req.user.id,
        applicationId,
        candidateId: application.candidateId,
        jobId: application.jobId,
      },
      update: {},
    });

    return res.status(201).json(saved);
  } catch {
    return res.status(500).json({ error: "Failed to save candidate" });
  }
});

app.delete("/api/hr/saved-candidates/:applicationId", authenticateToken, async (req: any, res: any) => {
  try {
    const role = String(req.user.role || "").toUpperCase();
    if (!HR_WRITE_ROLES.has(role)) {
      return res.status(403).json({ error: "Forbidden. HR access required." });
    }
    await prisma.hRCandidateSave.delete({
      where: { hrId_applicationId: { hrId: req.user.id, applicationId: req.params.applicationId } },
    });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Failed to unsave candidate" });
  }
});

// 6e. HR: Application notes
app.post("/api/hr/applications/:id/notes", authenticateToken, async (req: any, res: any) => {
  try {
    const role = String(req.user.role || "").toUpperCase();
    if (!HR_WRITE_ROLES.has(role)) {
      return res.status(403).json({ error: "Forbidden. HR access required." });
    }
    const note = String(req.body?.note || "").trim();
    if (!note) return res.status(400).json({ error: "note is required" });

    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { job: { select: { hrId: true } } },
    });
    if (!application) return res.status(404).json({ error: "Application not found" });
    if ((role === "HR" || role === "ADMIN_HR") && application.job.hrId !== req.user.id) {
      return res.status(403).json({ error: "You can only add notes to your applications." });
    }

    const created = await prisma.applicationNote.create({
      data: { applicationId: application.id, hrId: req.user.id, note },
    });
    return res.status(201).json(created);
  } catch {
    return res.status(500).json({ error: "Failed to add note" });
  }
});

app.patch("/api/hr/notes/:id", authenticateToken, async (req: any, res: any) => {
  try {
    const role = String(req.user.role || "").toUpperCase();
    if (!HR_WRITE_ROLES.has(role)) {
      return res.status(403).json({ error: "Forbidden. HR access required." });
    }
    const note = String(req.body?.note || "").trim();
    if (!note) return res.status(400).json({ error: "note is required" });

    const existing = await prisma.applicationNote.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Note not found" });
    if (existing.hrId !== req.user.id && role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updated = await prisma.applicationNote.update({ where: { id: req.params.id }, data: { note } });
    return res.json(updated);
  } catch {
    return res.status(500).json({ error: "Failed to update note" });
  }
});

app.delete("/api/hr/notes/:id", authenticateToken, async (req: any, res: any) => {
  try {
    const role = String(req.user.role || "").toUpperCase();
    if (!HR_WRITE_ROLES.has(role)) {
      return res.status(403).json({ error: "Forbidden. HR access required." });
    }
    const existing = await prisma.applicationNote.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Note not found" });
    if (existing.hrId !== req.user.id && role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }
    await prisma.applicationNote.delete({ where: { id: req.params.id } });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Failed to delete note" });
  }
});

// 6f. HR: Bulk update status
app.post("/api/hr/applications/bulk-status", authenticateToken, async (req: any, res: any) => {
  try {
    const role = String(req.user.role || "").toUpperCase();
    if (!HR_WRITE_ROLES.has(role)) {
      return res.status(403).json({ error: "Forbidden. HR access required." });
    }

    const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(String) : [];
    const status = String(req.body?.status || "").toUpperCase();
    if (!ids.length) return res.status(400).json({ error: "ids are required" });
    if (!APPLICATION_STATUSES.includes(status)) return res.status(400).json({ error: "Invalid status" });

    const apps = await prisma.application.findMany({
      where: { id: { in: ids } },
      include: { job: { select: { hrId: true } } },
    });

    if ((role === "HR" || role === "ADMIN_HR") && apps.some((a) => a.job.hrId !== req.user.id)) {
      return res.status(403).json({ error: "Some applications are outside your jobs." });
    }

    await prisma.application.updateMany({ where: { id: { in: ids } }, data: { status } });
    return res.json({ ok: true, updated: ids.length });
  } catch {
    return res.status(500).json({ error: "Failed to update applications" });
  }
});

// 6g. HR: Email templates
app.get("/api/hr/email-templates", authenticateToken, async (req: any, res: any) => {
  try {
    const role = String(req.user.role || "").toUpperCase();
    if (!HR_VIEW_ROLES.has(role)) {
      return res.status(403).json({ error: "Forbidden. HR access required." });
    }
    const templates = await prisma.emailTemplate.findMany({ where: { hrId: req.user.id }, orderBy: { updatedAt: "desc" } });
    return res.json(templates);
  } catch {
    return res.status(500).json({ error: "Failed to fetch templates" });
  }
});

app.post("/api/hr/email-templates", authenticateToken, async (req: any, res: any) => {
  try {
    const role = String(req.user.role || "").toUpperCase();
    if (!HR_WRITE_ROLES.has(role)) {
      return res.status(403).json({ error: "Forbidden. HR access required." });
    }
    const name = String(req.body?.name || "").trim();
    const subject = String(req.body?.subject || "").trim();
    const body = String(req.body?.body || "").trim();
    const type = String(req.body?.type || "CUSTOM").trim();
    if (!name || !subject || !body) return res.status(400).json({ error: "name, subject, and body are required" });

    const created = await prisma.emailTemplate.create({
      data: { hrId: req.user.id, name, subject, body, type },
    });
    return res.status(201).json(created);
  } catch {
    return res.status(500).json({ error: "Failed to create template" });
  }
});

app.patch("/api/hr/email-templates/:id", authenticateToken, async (req: any, res: any) => {
  try {
    const role = String(req.user.role || "").toUpperCase();
    if (!HR_WRITE_ROLES.has(role)) {
      return res.status(403).json({ error: "Forbidden. HR access required." });
    }
    const template = await prisma.emailTemplate.findUnique({ where: { id: req.params.id } });
    if (!template || template.hrId !== req.user.id) {
      return res.status(404).json({ error: "Template not found" });
    }
    const data: any = {};
    if ("name" in req.body) data.name = String(req.body.name || "").trim();
    if ("subject" in req.body) data.subject = String(req.body.subject || "").trim();
    if ("body" in req.body) data.body = String(req.body.body || "").trim();
    if ("type" in req.body) data.type = String(req.body.type || "CUSTOM").trim();
    const updated = await prisma.emailTemplate.update({ where: { id: req.params.id }, data });
    return res.json(updated);
  } catch {
    return res.status(500).json({ error: "Failed to update template" });
  }
});

app.delete("/api/hr/email-templates/:id", authenticateToken, async (req: any, res: any) => {
  try {
    const role = String(req.user.role || "").toUpperCase();
    if (!HR_WRITE_ROLES.has(role)) {
      return res.status(403).json({ error: "Forbidden. HR access required." });
    }
    const template = await prisma.emailTemplate.findUnique({ where: { id: req.params.id } });
    if (!template || template.hrId !== req.user.id) {
      return res.status(404).json({ error: "Template not found" });
    }
    await prisma.emailTemplate.delete({ where: { id: req.params.id } });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Failed to delete template" });
  }
});

// 7. Jobs: Delete a job (HR/Admin, owner for HR)
app.delete("/api/jobs/:id", authenticateToken, async (req: any, res: any) => {
  try {
    const role = String(req.user.role || "").toUpperCase();
    if (!HR_WRITE_ROLES.has(role)) {
      return res.status(403).json({ error: "Forbidden. HR access required." });
    }

    const existingJob = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!existingJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    if ((role === "HR" || role === "ADMIN_HR") && existingJob.hrId !== req.user.id) {
      return res.status(403).json({ error: "You can only delete your own jobs." });
    }

    await prisma.job.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete job" });
  }
});

// ─── 8. User Profile: Get own profile ────────────────────────────────────────
app.get("/api/users/profile", authenticateToken, async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const { passwordHash: _pw, ...safe } = user as any;
    return res.json(safe);
  } catch {
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ─── 9. User Profile: Update own profile ─────────────────────────────────────
app.patch("/api/users/profile", authenticateToken, async (req: any, res: any) => {
  try {
    const allowed = [
      "name", "phone", "headline", "about", "resumeUrl", "portfolioUrl",
      "experienceLevel", "availability", "skills", "preferredRole", "location",
      "designation", "department", "university", "website", "linkedin", "bio",
      "notificationSettings", "preferences",
    ];
    const data: Record<string, any> = {};
    for (const key of allowed) {
      if (key in req.body) data[key] = req.body[key];
    }
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });
    const { passwordHash: _pw, ...safe } = updated as any;
    return res.json(safe);
  } catch {
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

// ─── 10. Security: Change password ───────────────────────────────────────────
app.post("/api/users/change-password", authenticateToken, async (req: any, res: any) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: "Invalid password data" });
    }
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.passwordHash) {
      return res.status(400).json({ error: "Password not set for this account" });
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(400).json({ error: "Current password is incorrect" });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Failed to change password" });
  }
});

// ─── 11. Saved Jobs: List saved jobs for current candidate ────────────────────
app.get("/api/saved-jobs", authenticateToken, async (req: any, res: any) => {
  try {
    if (req.user.role !== "CANDIDATE") {
      return res.status(403).json({ error: "Candidates only" });
    }
    const saved = await prisma.savedJob.findMany({
      where: { candidateId: req.user.id },
      include: { job: { include: { hr: { select: { name: true, university: true } } } } },
      orderBy: { savedAt: "desc" },
    });
    return res.json(
      saved
        .filter((s: any) => String(s?.job?.status || "").toUpperCase() === "OPEN")
        .map((s: any) => ({ ...s.job, savedAt: s.savedAt }))
    );
  } catch {
    return res.status(500).json({ error: "Failed to fetch saved jobs" });
  }
});

// ─── 12. Saved Jobs: Save a job ───────────────────────────────────────────────
app.post("/api/saved-jobs", authenticateToken, async (req: any, res: any) => {
  try {
    if (req.user.role !== "CANDIDATE") {
      return res.status(403).json({ error: "Candidates only" });
    }
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ error: "jobId is required" });

    const record = await prisma.savedJob.upsert({
      where: { candidateId_jobId: { candidateId: req.user.id, jobId } },
      create: { candidateId: req.user.id, jobId },
      update: {},
    });
    return res.status(201).json(record);
  } catch {
    return res.status(500).json({ error: "Failed to save job" });
  }
});

// ─── 13. Saved Jobs: Unsave a job ─────────────────────────────────────────────
app.delete("/api/saved-jobs/:jobId", authenticateToken, async (req: any, res: any) => {
  try {
    if (req.user.role !== "CANDIDATE") {
      return res.status(403).json({ error: "Candidates only" });
    }
    await prisma.savedJob.deleteMany({
      where: { candidateId: req.user.id, jobId: req.params.jobId },
    });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Failed to unsave job" });
  }
});

// ─── 14. Admin: Stats ────────────────────────────────────────────────────────
app.get("/api/admin/stats", authenticateToken, async (req: any, res: any) => {
  try {
    if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });
    const [totalJobs, totalApplications, totalUsers] = await Promise.all([
      prisma.job.count(),
      prisma.application.count(),
      prisma.user.count(),
    ]);
    return res.json({ totalJobs, totalApplications, totalUsers });
  } catch {
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ─── 15. Admin: List all jobs ────────────────────────────────────────────────
app.get("/api/admin/jobs", authenticateToken, async (req: any, res: any) => {
  try {
    if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });
    const jobs = await prisma.job.findMany({
      include: { hr: { select: { name: true, email: true, university: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json(jobs.map(enrichJobWithMedia));
  } catch {
    return res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// ─── 16. Admin: Toggle job verification ──────────────────────────────────────
app.patch("/api/admin/jobs/:id/verify", authenticateToken, async (req: any, res: any) => {
  try {
    if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return res.status(404).json({ error: "Job not found" });

    const updated = await prisma.job.update({
      where: { id: req.params.id },
      data: { isVerified: !job.isVerified },
    });
    return res.json(enrichJobWithMedia(updated));
  } catch {
    return res.status(500).json({ error: "Failed to update job" });
  }
});

// ─── 17. Admin: List all users ───────────────────────────────────────────────
app.get("/api/admin/users", authenticateToken, async (req: any, res: any) => {
  try {
    if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, university: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(users);
  } catch {
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ─── 18. Invites: Create invite (HR/Admin) ────────────────────────────────────
app.post("/api/invites", authenticateToken, async (req: any, res: any) => {
  try {
    const requesterRole = String(req.user.role || "").toUpperCase();
    if (!HR_WRITE_ROLES.has(requesterRole)) {
      return res.status(403).json({ error: "HR or Admin access required" });
    }
    const { email, role: inviteRole = "HR" } = req.body;
    if (!email) return res.status(400).json({ error: "email is required" });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const invite = await prisma.invite.create({
      data: { email, role: inviteRole, senderId: req.user.id, expiresAt },
    });
    return res.status(201).json(invite);
  } catch {
    return res.status(500).json({ error: "Failed to create invite" });
  }
});

// ─── 19. Invites: Validate & redeem invite ────────────────────────────────────
app.get("/api/invites/:token", async (req: any, res: any) => {
  try {
    const invite = await prisma.invite.findUnique({ where: { token: req.params.token } });
    if (!invite) return res.status(404).json({ error: "Invite not found" });
    if (invite.used) return res.status(410).json({ error: "Invite already used" });
    if (new Date() > invite.expiresAt) return res.status(410).json({ error: "Invite expired" });
    return res.json({ email: invite.email, role: invite.role });
  } catch {
    return res.status(500).json({ error: "Failed to validate invite" });
  }
});

// ─── 20. Invites: Activate account via invite ─────────────────────────────────
app.post("/api/invites/:token/activate", async (req: any, res: any) => {
  try {
    const invite = await prisma.invite.findUnique({ where: { token: req.params.token } });
    if (!invite) return res.status(404).json({ error: "Invite not found" });
    if (invite.used) return res.status(410).json({ error: "Invite already used" });
    if (new Date() > invite.expiresAt) return res.status(410).json({ error: "Invite expired" });

    const { name, university, password } = req.body;
    if (!name || !password || password.length < 8) {
      return res.status(400).json({ error: "name and password (min 8 chars) are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: invite.email } });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email: invite.email, passwordHash, name, role: invite.role, university },
    });

    await prisma.invite.update({ where: { token: req.params.token }, data: { used: true } });

    const token = signAuthToken({ id: user.id, role: user.role });
    setAuthCookie(res, token);
    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, university: user.university },
    });
  } catch {
    return res.status(500).json({ error: "Failed to activate account" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

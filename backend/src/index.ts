import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const uploadsRoot = path.join(process.cwd(), "uploads");
const resumesDir = path.join(uploadsRoot, "resumes");
fs.mkdirSync(resumesDir, { recursive: true });
app.use("/uploads", express.static(uploadsRoot));

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

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_please_change";

// ── Auth Middleware ───────────────────────
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// ── API Routes ────────────────────────────

// 1. Auth: Register
app.post("/api/auth/register", async (req: any, res: any) => {
  try {
    const { email, password, name, role, university } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already taken" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        university,
      },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, university: user.university }
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 2. Auth: Login
app.post("/api/auth/login", async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check pass
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, university: user.university }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3. Auth: Me
app.get("/api/auth/me", authenticateToken, async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.json({
      id: user.id, email: user.email, name: user.name, role: user.role, university: user.university
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// 4. Jobs: Get all jobs
app.get("/api/jobs", async (req: any, res: any) => {
  try {
    const jobs = await prisma.job.findMany({
      include: { hr: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// 4b. Jobs: Get single job by id
app.get("/api/jobs/:id", async (req: any, res: any) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { hr: { select: { id: true, name: true, email: true } } },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    return res.json(job);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch job" });
  }
});

// 5. Jobs: Create a job (HR Only)
app.post("/api/jobs", authenticateToken, async (req: any, res: any) => {
  try {
    if (req.user.role !== "HR" && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden. HR access required." });
    }

    const { title, description, location, jobType } = req.body;
    const job = await prisma.job.create({
      data: {
        title,
        description,
        location,
        jobType,
        hrId: req.user.id
      }
    });
    
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: "Failed to create job" });
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

    if (req.user.role === "HR") {
      const applications = await prisma.application.findMany({
        where: { job: { hrId: req.user.id } },
        include: {
          job: { select: { id: true, title: true, location: true, jobType: true } },
          candidate: { select: { id: true, name: true, email: true } },
        },
        orderBy: { appliedAt: "desc" },
      });
      return res.json(applications);
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
          },
        },
        candidate: { select: { id: true, name: true, email: true } },
      },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (req.user.role === "CANDIDATE" && application.candidateId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (req.user.role === "HR" && application.job.hrId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.json(application);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch application" });
  }
});

// 6c. Applications: Update status (HR/Admin)
app.patch("/api/applications/:id/status", authenticateToken, async (req: any, res: any) => {
  try {
    if (req.user.role !== "HR" && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden. HR access required." });
    }

    const allowedStatuses = ["PENDING", "SHORTLISTED", "REJECTED", "HIRED"];
    const nextStatus = String(req.body.status || "").toUpperCase();
    if (!allowedStatuses.includes(nextStatus)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const existing = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { job: { select: { hrId: true } } },
    });

    if (!existing) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (req.user.role === "HR" && existing.job.hrId !== req.user.id) {
      return res.status(403).json({ error: "You can only update applications for your jobs." });
    }

    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: { status: nextStatus },
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update application status" });
  }
});

// 7. Jobs: Delete a job (HR/Admin, owner for HR)
app.delete("/api/jobs/:id", authenticateToken, async (req: any, res: any) => {
  try {
    if (req.user.role !== "HR" && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden. HR access required." });
    }

    const existingJob = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!existingJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (req.user.role === "HR" && existingJob.hrId !== req.user.id) {
      return res.status(403).json({ error: "You can only delete your own jobs." });
    }

    await prisma.job.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete job" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

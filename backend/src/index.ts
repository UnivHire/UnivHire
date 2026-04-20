import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

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
app.post("/api/applications", authenticateToken, async (req: any, res: any) => {
  try {
    if (req.user.role !== "CANDIDATE") {
      return res.status(403).json({ error: "Forbidden. Candidate access required." });
    }

    const { jobId, resumeUrl } = req.body;
    
    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId: req.user.id,
        resumeUrl
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

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

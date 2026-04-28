import { Router } from "express";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../db";
import { GOOGLE_CLIENT_ID } from "../config";
import { setAuthCookie, clearAuthCookie } from "../lib/cookies";
import { signAuthToken } from "../lib/jwt";
import { authenticateToken, type AuthenticatedRequest } from "../middleware/authenticate";

const router = Router();
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

function toPublicUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    university: user.university,
    avatar: user.avatar || "",
  };
}

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role, university } = req.body as {
      email?: string;
      password?: string;
      name?: string;
      role?: string;
      university?: string;
    };

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        university,
      },
    });

    const token = signAuthToken({ id: user.id, role: user.role });
    setAuthCookie(res, token);

    return res.status(201).json({ token, user: toPublicUser(user) });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = signAuthToken({ id: user.id, role: user.role });
    setAuthCookie(res, token);

    return res.json({ token, user: toPublicUser(user) });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { token: idToken } = req.body as { token?: string };
    if (!idToken) {
      return res.status(400).json({ error: "Missing Google token" });
    }

    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: "Google client ID is not configured" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(400).json({ error: "Google token missing email" });
    }

    const email = payload.email;
    const name = payload.name || email.split("@")[0];
    const avatar = payload.picture || "";

    const existing = await prisma.user.findUnique({ where: { email } });

    const user = existing
      ? await prisma.user.update({
          where: { email },
          data: { name, avatar },
        })
      : await prisma.user.create({
          data: {
            email,
            name,
            avatar,
            role: "CANDIDATE",
          },
        });

    const token = signAuthToken({ id: user.id, role: user.role });
    setAuthCookie(res, token);

    return res.json({ token, user: toPublicUser(user) });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(401).json({ error: "Invalid Google token" });
  }
});

router.get("/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json(toPublicUser(user));
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  return res.json({ ok: true });
});

export default router;

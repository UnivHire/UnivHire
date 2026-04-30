import type { Request, Response, NextFunction } from "express";
import { AUTH_COOKIE_NAME } from "../lib/cookies";
import { verifyAuthToken } from "../lib/jwt";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader && String(authHeader).split(" ")[1];
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  const token = bearerToken || cookieToken;

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    req.user = verifyAuthToken(token);
    next();
  } catch {
    return res.status(403).json({ error: "Forbidden" });
  }
}

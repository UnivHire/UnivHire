import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export interface AuthTokenPayload {
  id: string;
  role: string;
}

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}

import dotenv from "dotenv";

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_please_change";
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
export const NODE_ENV = process.env.NODE_ENV || "development";

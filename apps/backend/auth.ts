import type { NextFunction, Request, Response } from "express";
import { jwtVerify, SignJWT } from "jose";

const secret = process.env.JWT_SECRET;

if (!secret) {
  console.warn("JWT_SECRET is not set. Authentication endpoints will fail until it is configured.");
}

const secretKey = new TextEncoder().encode(secret ?? "development-only-secret-change-me");

export type AuthenticatedRequest = Request & { userId?: string };

export async function createToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (!payload.sub) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

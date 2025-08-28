import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "15m";
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || "7d";

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error("JWT secrets are not set in environment variables");
}

export type JwtPayload = { sub: string; email: string; name: string };

export const signAccessToken = (payload: JwtPayload) =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES as any });

export const signRefreshToken = (payload: JwtPayload) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES as any });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, ACCESS_SECRET) as JwtPayload & { iat: number; exp: number };

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, REFRESH_SECRET) as JwtPayload & {
    iat: number;
    exp: number;
  };

import { Request, Response, NextFunction } from "express";
import {
  verifyAccessToken,
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
} from "../utils/jwt";

export interface AuthedRequest extends Request {
  user?: { id: string; email: string };
}

const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60, // 1 hour
  });
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};

export const requireAuth = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let accessToken =
      req.cookies?.access_token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    // Try to verify the access token first
    try {
      if (accessToken) {
        const payload = verifyAccessToken(accessToken);
        res.locals.user = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
        };
        return next();
      }
    } catch (accessError) {
      // Access token is invalid or expired, try to refresh
      console.log("Access token invalid/expired, attempting refresh...");
    }

    // Access token failed, try refresh token
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ message: "No valid tokens provided" });
    }

    try {
      const refreshPayload = verifyRefreshToken(refreshToken);

      // Generate new tokens
      const newAccessToken = signAccessToken({
        sub: refreshPayload.sub,
        email: refreshPayload.email,
        name: refreshPayload.name,
      });
      const newRefreshToken = signRefreshToken({
        sub: refreshPayload.sub,
        email: refreshPayload.email,
        name: refreshPayload.name,
      });

      // Set new tokens in cookies
      setAuthCookies(res, newAccessToken, newRefreshToken);

      // Also send new access token in response header for client-side storage
      res.setHeader("X-New-Access-Token", newAccessToken);

      // Set user in request
      res.locals.user = {
        id: refreshPayload.sub,
        name: refreshPayload.name,
        mail: refreshPayload.email,
      };

      console.log("Token refreshed successfully");
      return next();
    } catch (refreshError) {
      return res
        .status(401)
        .json({ message: "Invalid refresh token. Please login again." });
    }
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};

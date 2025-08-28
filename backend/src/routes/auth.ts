import { Router, Request, Response } from "express";
import { User } from "../database/models/User";
import { requireFields, isEmail } from "../utils/validation";
import { signAccessToken, signRefreshToken } from "../utils/jwt";
import cookieParser from "cookie-parser";

const router = Router();

router.use(cookieParser());

// Helpers
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

const clearAuthCookies = (res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
  });
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
  });
};

// POST /api/auth/signup
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { ok, missing } = requireFields(req.body, [
      "email",
      "name",
      "password",
    ]);
    if (!ok)
      return res
        .status(400)
        .json({ message: `Missing: ${missing.join(", ")}` });
    const { email, name, password } = req.body as {
      email: string;
      name: string;
      password: string;
    };

    if (!isEmail(email))
      return res.status(400).json({ message: "Invalid email" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password too short" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: "Email already in use" });

    const user = await User.create({ email, name, password });

    const accessToken = signAccessToken({
      sub: user.id.toString(),
      email: user.email,
      name: user.name,
    });
    const refreshToken = signRefreshToken({
      sub: user.id.toString(),
      email: user.email,
      name: user.name,
    });

    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: "User created successfully",
      user: { id: user._id, email: user.email, name: user.name },
      accessToken,
    });
  } catch (e) {
    res.status(500).json({ message: "Signup failed" });
  }
});

// POST /api/auth/signin
router.post("/signin", async (req: Request, res: Response) => {
  try {
    const { ok, missing } = requireFields(req.body, ["email", "password"]);
    if (!ok)
      return res
        .status(400)
        .json({ message: `Missing: ${missing.join(", ")}` });

    const { email, password } = req.body as { email: string; password: string };

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken({
      sub: user.id.toString(),
      email: user.email,
      name: user.name,
    });
    const refreshToken = signRefreshToken({
      sub: user.id.toString(),
      email: user.email,
      name: user.name,
    });

    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      message: "Signed in successfully",
      user: { id: user._id, email: user.email, name: user.name },
      accessToken,
    });
  } catch {
    res.status(500).json({ message: "Signin failed" });
  }
});

// POST /api/auth/logout
router.post("/logout", async (_req: Request, res: Response) => {
  clearAuthCookies(res);
  res.json({ message: "Logged out successfully" });
});

// GET /api/auth/status - Check if user is authenticated
router.get("/status", async (req: Request, res: Response) => {
  try {
    const accessToken = req.cookies?.access_token;
    const refreshToken = req.cookies?.refresh_token;

    if (!accessToken && !refreshToken) {
      return res.json({ authenticated: false });
    }

    return res.json({
      authenticated: true,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    });
  } catch {
    res.json({ authenticated: false });
  }
});

export default router;

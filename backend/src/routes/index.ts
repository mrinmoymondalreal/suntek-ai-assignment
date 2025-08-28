import { Router, Request, Response } from "express";
import authRoutes from "./auth";
import taskRoutes from "./tasks";
import timerRoutes from "./timers";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);
router.use("/timers", timerRoutes);

// Example protected route
router.get("/me", requireAuth, (req: Request, res: Response) => {
  const user = res.locals.user;
  res.json({ user });
});

router.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

export default router;

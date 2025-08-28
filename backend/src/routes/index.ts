import { Router, Request, Response } from "express";
import authRoutes from "./auth";
import taskRoutes from "./tasks";
import timerRoutes from "./timers";
import summaryRoutes from "./summary";
import aiRoutes from "./ai";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);
router.use("/timers", timerRoutes);
router.use("/summary", summaryRoutes);
router.use("/ai", aiRoutes);

router.get("/me", requireAuth, (_req: Request, res: Response) => {
  const user = res.locals.user;
  res.json({ user });
});

router.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

export default router;

import { Router, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { Task } from "../database/models/Task";
import { Timer } from "../database/models/Timer";

const router = Router();

// All summary routes require authentication
router.use(requireAuth);

// GET /api/summary/today
router.get("/today", async (_req, res: Response) => {
  try {
    const user = res.locals.user;

    // Compute "today" boundaries in server local time.
    // If per-user timezone is needed, pass tz info from client or store on user profile.
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // 1) Tasks worked on today = tasks that have at least one timer started today by this user
    const timersStartedToday = await Timer.find({
      user_id: user.id,
      start_time: { $gte: startOfDay, $lte: endOfDay },
    }).select("task_id start_time end_time duration_seconds is_active");

    const taskIdsWorkedSet = new Set<string>(
      timersStartedToday.map((t) => String(t.task_id))
    );
    const taskIdsWorked = Array.from(taskIdsWorkedSet);

    const tasksWorkedOn = taskIdsWorked.length
      ? await Task.find({ _id: { $in: taskIdsWorked } }).select(
          "_id task_name status task_deadline created_by"
        )
      : [];

    // 2) Total time tracked today:
    // For timers that started today, sum:
    // - If ended within today: use duration_seconds
    // - If still active: use now - start_time
    let totalSeconds = 0;
    for (const tm of timersStartedToday) {
      if (tm.end_time && tm.end_time >= startOfDay && tm.end_time <= endOfDay) {
        totalSeconds += tm.duration_seconds;
      } else if (tm.is_active) {
        totalSeconds += Math.floor(
          (Date.now() - tm.start_time.getTime()) / 1000
        );
      }
    }

    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
    const totalSecsRem = totalSeconds % 60;

    // 3) Completed tasks today:
    // Uses updatedAt as a proxy for when status changed to "Completed".
    const completedToday = await Task.find({
      owner: user.id,
      status: "Completed",
      updatedAt: { $gte: startOfDay, $lte: endOfDay },
    }).select("_id task_name status task_deadline created_by updatedAt");

    // 4) Tasks still In Progress or Pending (current snapshot)
    const inProgressOrPending = await Task.find({
      owner: user.id,
      status: { $in: ["Pending", "In Progress"] },
    }).select("_id task_name status task_deadline created_by");

    return res.json({
      date: startOfDay.toISOString().slice(0, 10),
      tasks_worked_on: tasksWorkedOn.map((t) => ({
        id: t._id,
        task_name: t.task_name,
        status: t.status,
        task_deadline: t.task_deadline,
        created_by: t.created_by,
      })),
      total_time_tracked: {
        seconds: totalSeconds,
        formatted: `${totalHours}h ${totalMinutes}m ${totalSecsRem}s`,
      },
      completed_tasks_today: completedToday.map((t) => ({
        id: t._id,
        task_name: t.task_name,
        status: t.status,
        completed_on: t.updatedAt,
      })),
      in_progress_or_pending: inProgressOrPending.map((t) => ({
        id: t._id,
        task_name: t.task_name,
        status: t.status,
        task_deadline: t.task_deadline,
        created_by: t.created_by,
      })),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Summary today error:", e);
    return res.status(500).json({ message: "Failed to build daily summary" });
  }
});

export default router;

import { Router, Request, Response } from "express";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { Timer, ITimer } from "../database/models/Timer";
import { Task, TaskStatus } from "../database/models/Task";
import mongoose from "mongoose";

const router = Router();

// All routes below require authentication
router.use(requireAuth);

// POST /api/timers/start/:task_id - Start timer for a task
router.post("/start/:task_id", async (req: AuthedRequest, res: Response) => {
  try {
    const { task_id } = req.params;
    const user = res.locals.user;

    // Validate task_id format
    if (!mongoose.Types.ObjectId.isValid(task_id)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    // Check if task exists and belongs to user
    const task = await Task.findOne({ _id: task_id, owner: user.id });
    if (!task) {
      return res
        .status(404)
        .json({ message: "Task not found or you don't have permission" });
    }

    // Check if task is completed
    if (task.status === "Completed") {
      return res
        .status(400)
        .json({ message: "Cannot start timer for completed task" });
    }

    // Check if there's already an active timer for this task
    const activeTimer = await Timer.findOne({
      task_id: task_id,
      user_id: user.id,
      is_active: true,
    });

    if (activeTimer) {
      return res.status(400).json({
        message: "Timer is already running for this task",
        active_timer: {
          id: activeTimer._id,
          start_time: activeTimer.start_time,
          duration: Math.floor(
            (Date.now() - activeTimer.start_time.getTime()) / 1000
          ),
        },
      });
    }

    // Start new timer
    const timer = await Timer.create({
      task_id: task_id,
      user_id: user.id,
      started_by: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      start_time: new Date(),
      is_active: true,
    });

    // Update task status to "In Progress"
    await Task.findByIdAndUpdate(task_id, { status: "In Progress" });

    return res.status(201).json({
      message: "Timer started successfully",
      timer: {
        id: timer._id,
        task_id: timer.task_id,
        start_time: timer.start_time,
        is_active: timer.is_active,
        started_by: timer.started_by,
      },
      task_status_updated: "In Progress",
    });
  } catch (error) {
    console.error("Start timer error:", error);
    return res.status(500).json({ message: "Failed to start timer" });
  }
});

// POST /api/timers/stop/:task_id - Stop timer for a task
router.post("/stop/:task_id", async (req: AuthedRequest, res: Response) => {
  try {
    const { task_id } = req.params;
    const user = res.locals.user;

    // Validate task_id format
    if (!mongoose.Types.ObjectId.isValid(task_id)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    // Find active timer for this task and user
    const activeTimer = await Timer.findOne({
      task_id: task_id,
      user_id: user.id,
      is_active: true,
    });

    if (!activeTimer) {
      return res
        .status(404)
        .json({ message: "No active timer found for this task" });
    }

    // Calculate duration
    const endTime = new Date();
    const durationSeconds = Math.floor(
      (endTime.getTime() - activeTimer.start_time.getTime()) / 1000
    );

    // Update timer
    const updatedTimer = await Timer.findByIdAndUpdate(
      activeTimer._id,
      {
        end_time: endTime,
        duration_seconds: durationSeconds,
        is_active: false,
      },
      { new: true }
    );

    // Update task status back to "Pending" (only if it's currently "In Progress")
    const task = await Task.findById(task_id);
    let taskStatusUpdated = null;

    if (task && task.status === "In Progress") {
      await Task.findByIdAndUpdate(task_id, { status: "Pending" });
      taskStatusUpdated = "Pending";
    }

    // Format duration for response
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    const seconds = durationSeconds % 60;

    return res.json({
      message: "Timer stopped successfully",
      timer: {
        id: updatedTimer!._id,
        task_id: updatedTimer!.task_id,
        start_time: updatedTimer!.start_time,
        end_time: updatedTimer!.end_time,
        duration_seconds: updatedTimer!.duration_seconds,
        duration_formatted: `${hours}h ${minutes}m ${seconds}s`,
        is_active: updatedTimer!.is_active,
        started_by: updatedTimer!.started_by,
      },
      task_status_updated: taskStatusUpdated,
    });
  } catch (error) {
    console.error("Stop timer error:", error);
    return res.status(500).json({ message: "Failed to stop timer" });
  }
});

// GET /api/timers/active - Get all active timers for the user
router.get("/active", async (req: AuthedRequest, res: Response) => {
  try {
    const user = res.locals.user;

    const activeTimers = await Timer.find({
      user_id: user.id,
      is_active: true,
    })
      .populate("task_id", "task_name status")
      .sort({ start_time: -1 });

    const timersWithDuration = activeTimers.map((timer) => {
      const currentDuration = Math.floor(
        (Date.now() - timer.start_time.getTime()) / 1000
      );
      const hours = Math.floor(currentDuration / 3600);
      const minutes = Math.floor((currentDuration % 3600) / 60);
      const seconds = currentDuration % 60;

      return {
        id: timer._id,
        task_id: timer.task_id,
        // @ts-ignore
        task_name: timer.task_id.task_name,
        // @ts-ignore
        task_status: timer.task_id.status,
        start_time: timer.start_time,
        current_duration_seconds: currentDuration,
        current_duration_formatted: `${hours}h ${minutes}m ${seconds}s`,
        started_by: timer.started_by,
      };
    });

    return res.json({
      active_timers: timersWithDuration,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch active timers" });
  }
});

// GET /api/timers/history/:task_id - Get timer history for a specific task
router.get("/history/:task_id", async (req: AuthedRequest, res: Response) => {
  try {
    const { task_id } = req.params;
    const user = res.locals.user;
    const { limit = 50, skip = 0 } = req.query;

    // Validate task_id format
    if (!mongoose.Types.ObjectId.isValid(task_id)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    // Check if user owns the task
    const task = await Task.findOne({ _id: task_id, owner: user.id });
    if (!task) {
      return res
        .status(404)
        .json({ message: "Task not found or you don't have permission" });
    }

    const timers = await Timer.find({
      task_id: task_id,
      user_id: user.id,
    })
      .sort({ start_time: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const timerHistory = timers.map((timer) => {
      const duration = timer.is_active
        ? Math.floor((Date.now() - timer.start_time.getTime()) / 1000)
        : timer.duration_seconds;

      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;

      return {
        id: timer._id,
        start_time: timer.start_time,
        end_time: timer.end_time,
        duration_seconds: duration,
        duration_formatted: `${hours}h ${minutes}m ${seconds}s`,
        is_active: timer.is_active,
        started_by: timer.started_by,
      };
    });

    // Calculate total time spent on this task
    const totalSeconds = timers.reduce((total, timer) => {
      return (
        total +
        (timer.is_active
          ? Math.floor((Date.now() - timer.start_time.getTime()) / 1000)
          : timer.duration_seconds)
      );
    }, 0);

    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    return res.json({
      task: {
        id: task._id,
        name: task.task_name,
        status: task.status,
      },
      timer_history: timerHistory,
      total_time: {
        seconds: totalSeconds,
        formatted: `${totalHours}h ${totalMinutes}m ${remainingSeconds}s`,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch timer history" });
  }
});

// GET /api/timers/stats - Get timer statistics for user
router.get("/stats", async (req: AuthedRequest, res: Response) => {
  try {
    const user = res.locals.user;

    // Get all timers for user
    const allTimers = await Timer.find({ user_id: user.id });

    // Calculate total time
    const totalSeconds = allTimers.reduce((total, timer) => {
      return (
        total +
        (timer.is_active
          ? Math.floor((Date.now() - timer.start_time.getTime()) / 1000)
          : timer.duration_seconds)
      );
    }, 0);

    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);

    // Count active timers
    const activeCount = allTimers.filter((timer) => timer.is_active).length;
    const completedSessions = allTimers.filter(
      (timer) => !timer.is_active
    ).length;

    return res.json({
      stats: {
        total_time: {
          seconds: totalSeconds,
          formatted: `${totalHours}h ${totalMinutes}m`,
        },
        active_timers: activeCount,
        completed_sessions: completedSessions,
        total_sessions: allTimers.length,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch timer stats" });
  }
});

export default router;

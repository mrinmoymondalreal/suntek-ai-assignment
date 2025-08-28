import { Router, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { Task } from "../database/models/Task";
import { Timer } from "../database/models/Timer";
import mongoose from "mongoose";

const router = Router();
router.use(requireAuth);

/**
 * GET /api/charts/daily
 * Query:
 *  - start=YYYY-MM-DD (optional; default: end-6 days)
 *  - end=YYYY-MM-DD (optional; default: today)
 *  - tz=IANA or offset string (e.g., "Asia/Kolkata" or "+05:30"); default "UTC"
 *
 * Returns:
 *  { chartData: [{ date, tasks_worked_on, total_time_seconds, completed_tasks, pending_tasks }] }
 */
router.get("/daily", async (req, res: Response) => {
  try {
    const user = res.locals.user;
    const tz = (req.query.tz as string) || "UTC";

    const parseYMD = (s?: string): Date | null => {
      if (!s) return null;
      const [y, m, d] = s.split("-").map(Number);
      if (!y || !m || !d) return null;
      // interpret as UTC midnight
      return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
    };

    const now = new Date();
    const endDefault = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0,
        0
      )
    );
    const startDefault = new Date(endDefault);
    startDefault.setUTCDate(startDefault.getUTCDate() - 6);

    const startUTC = parseYMD(req.query.start as string) ?? startDefault;
    const endUTC = parseYMD(req.query.end as string) ?? endDefault;

    // Build day labels array [start..end] for final ordering/fill
    const dayLabels: string[] = [];
    {
      const cur = new Date(startUTC);
      while (cur <= endUTC) {
        // label in the specified timezone via pipeline later; here keep as UTC marker
        const label = cur.toISOString().slice(0, 10);
        dayLabels.push(label);
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
    }

    const userId = new mongoose.Types.ObjectId(user.id);

    // 1) Aggregate timers: group by day (based on start_time) and the given timezone
    //    - tasks_worked_on: count distinct task_id that started that day
    //    - total_time_seconds: sum durations for ended timers whose end_time falls same day; add running timers as now - start
    // For strict DB-side only ended durations are reliable; running timers’ “now” needs app logic. Here:
    //   - total_time_seconds = sum of duration_seconds for timers that ended same day
    //   - running timers started that day are added in app code after aggregation
    const timersAgg = await Timer.aggregate([
      {
        $match: {
          user_id: userId,
          start_time: {
            $gte: startUTC,
            $lt: new Date(endUTC.getTime() + 24 * 3600 * 1000),
          },
        },
      },
      {
        $addFields: {
          startDay: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$start_time",
              timezone: tz,
            },
          },
          endDay: {
            $cond: [
              { $ifNull: ["$end_time", false] },
              {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$end_time",
                  timezone: tz,
                },
              },
              null,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$startDay",
          // distinct tasks worked that day (based on start)
          tasksWorkedSet: { $addToSet: "$task_id" },
          // sum ended durations where the end day equals the start day
          endedDurations: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$endDay", null] },
                    { $eq: ["$endDay", "$startDay"] },
                  ],
                },
                "$duration_seconds",
                0,
              ],
            },
          },
          activeTimers: {
            $push: {
              // keep active timers that started this day for app-side "now - start"
              $cond: [
                { $eq: ["$is_active", true] },
                { start_time: "$start_time" },
                "$$REMOVE",
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          tasks_worked_on: { $size: "$tasksWorkedSet" },
          ended_seconds: "$endedDurations",
          activeTimers: 1,
        },
      },
    ]);

    // 2) Aggregate completed tasks by day using updatedAt as proxy for completion time
    const completedAgg = await Task.aggregate([
      {
        $match: {
          owner: userId,
          status: "Completed",
          updatedAt: {
            $gte: startUTC,
            $lt: new Date(endUTC.getTime() + 24 * 3600 * 1000),
          },
        },
      },
      {
        $project: {
          day: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$updatedAt",
              timezone: tz,
            },
          },
        },
      },
      {
        $group: { _id: "$day", count: { $sum: 1 } },
      },
      {
        $project: { _id: 0, date: "$_id", count: 1 },
      },
    ]);

    // 3) Snapshot of current Pending + In Progress tasks (reported uniformly for each day row)
    const snapshotPendingCount = await Task.countDocuments({
      owner: userId,
      status: { $in: ["Pending", "In Progress"] },
    });

    // Build maps for quick lookup
    const timersMap = new Map<
      string,
      {
        tasks_worked_on: number;
        ended_seconds: number;
        activeTimers: { start_time: Date }[];
      }
    >();
    for (const t of timersAgg) {
      timersMap.set(t.date, {
        tasks_worked_on: t.tasks_worked_on,
        ended_seconds: t.ended_seconds,
        activeTimers: (t.activeTimers || []).map((x: any) => ({
          start_time: new Date(x.start_time),
        })),
      });
    }
    const completedMap = new Map<string, number>();
    for (const c of completedAgg) {
      completedMap.set(c.date, c.count);
    }

    // Compose final chartData, filling missing days with zeros
    const nowMs = Date.now();
    const chartData = dayLabels.map((label) => {
      const t = timersMap.get(label);
      const ended = t?.ended_seconds ?? 0;

      // Add active timers started this day: now - start_time (seconds)
      let activeAdd = 0;
      if (t?.activeTimers?.length) {
        for (const a of t.activeTimers) {
          const diff = Math.max(
            0,
            Math.floor((nowMs - new Date(a.start_time).getTime()) / 1000)
          );
          activeAdd += diff;
        }
      }

      return {
        date: label,
        tasks_worked_on: t?.tasks_worked_on ?? 0,
        total_time_seconds: ended + activeAdd,
        completed_tasks: completedMap.get(label) ?? 0,
        pending_tasks: snapshotPendingCount,
      };
    });

    return res.json({ chartData });
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("charts/daily error:", e);
    }
    return res
      .status(500)
      .json({ message: "Failed to build daily chart data" });
  }
});

export default router;

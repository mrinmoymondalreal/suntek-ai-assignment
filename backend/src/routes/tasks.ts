import { Router, Request, Response } from "express";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { Task, ITask, TaskStatus } from "../database/models/Task";

const router = Router();

// All routes below require authentication
router.use(requireAuth);

// Helpers
const parseDeadline = (value: unknown): Date | null => {
  if (value === null || value === undefined || value === "") return null;
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? null : d;
};

const validStatuses: TaskStatus[] = ["Pending", "In Progress", "Completed"];

// POST /api/tasks/create_task
router.post("/create_task", async (req: AuthedRequest, res: Response) => {
  try {
    const { task_name, task_deadline, status, task_description } = req.body as {
      task_name?: string;
      task_deadline?: string | Date | null;
      status?: TaskStatus;
      task_description?: string;
    };

    if (
      !task_name ||
      typeof task_name !== "string" ||
      task_name.trim() === ""
    ) {
      return res.status(400).json({ message: "task_name is required" });
    }

    let finalStatus: TaskStatus = "Pending";
    if (status && validStatuses.includes(status)) {
      finalStatus = status;
    }

    const deadline = parseDeadline(task_deadline);
    const user = res.locals.user;

    const task = await Task.create({
      owner: user.id,
      created_by: user.id,
      task_name: task_name.trim(),
      task_deadline: deadline,
      status: finalStatus,
      task_description: task_description ?? "",
    });

    return res.status(201).json({
      message: "Task created",
      task: {
        id: task._id,
        task_name: task.task_name,
        task_deadline: task.task_deadline,
        status: task.status,
        task_description: task.task_description,
        created_by: task.created_by,
        created_on: task.createdAt,
        updated_on: task.updatedAt,
      },
    });
  } catch (e) {
    console.error("Create task error:", e);
    return res.status(500).json({ message: "Failed to create task" });
  }
});

// GET /api/tasks - Get all tasks for the authenticated user
router.get("/", async (req: AuthedRequest, res: Response) => {
  try {
    const user = res.locals.user;
    const { status, limit = 50, skip = 0 } = req.query;

    const query: any = { owner: user.id };
    if (status && validStatuses.includes(status as TaskStatus)) {
      query.status = status;
    }

    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    return res.json({
      tasks: tasks.map((task) => ({
        id: task._id,
        task_name: task.task_name,
        task_deadline: task.task_deadline,
        status: task.status,
        task_description: task.task_description,
        created_by: task.created_by,
        created_on: task.createdAt,
        updated_on: task.updatedAt,
      })),
    });
  } catch (e) {
    return res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// GET /api/tasks/:id - Get a specific task
router.get("/:id", async (req: AuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = res.locals.user;

    const task = await Task.findOne({ _id: id, owner: user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    return res.json({
      task: {
        id: task._id,
        task_name: task.task_name,
        task_deadline: task.task_deadline,
        status: task.status,
        task_description: task.task_description,
        created_by: task.created_by,
        created_on: task.createdAt,
        updated_on: task.updatedAt,
      },
    });
  } catch {
    return res.status(500).json({ message: "Failed to fetch task" });
  }
});

// PATCH /api/tasks/update_task/:id
// Update name, description, and deadline
router.patch("/update_task/:id", async (req: AuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { task_name, task_description, task_deadline } = req.body as {
      task_name?: string;
      task_description?: string;
      task_deadline?: string | Date | null;
    };

    const user = res.locals.user;
    const update: Partial<ITask> = {};

    if (task_name !== undefined) {
      if (typeof task_name !== "string" || task_name.trim() === "") {
        return res
          .status(400)
          .json({ message: "task_name must be a non-empty string" });
      }
      update.task_name = task_name.trim();
    }

    if (task_description !== undefined) {
      if (typeof task_description !== "string") {
        return res
          .status(400)
          .json({ message: "task_description must be a string" });
      }
      update.task_description = task_description;
    }

    if (task_deadline !== undefined) {
      const parsed = parseDeadline(task_deadline);
      update.task_deadline = parsed; // can be null to clear deadline
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, owner: user.id },
      { $set: update },
      { new: true }
    );

    if (!task) return res.status(404).json({ message: "Task not found" });

    return res.json({
      message: "Task updated",
      task: {
        id: task._id,
        task_name: task.task_name,
        task_deadline: task.task_deadline,
        status: task.status,
        task_description: task.task_description,
        created_by: task.created_by,
        created_on: task.createdAt,
        updated_on: task.updatedAt,
      },
    });
  } catch {
    return res.status(500).json({ message: "Failed to update task" });
  }
});

// PATCH /api/tasks/change_status/:id
router.patch(
  "/change_status/:id",
  async (req: AuthedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body as { status?: TaskStatus };
      const user = res.locals.user;

      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          message: "status must be one of: Pending, In Progress, Completed",
        });
      }

      const task = await Task.findOneAndUpdate(
        { _id: id, owner: user.id },
        { $set: { status } },
        { new: true }
      );

      if (!task) return res.status(404).json({ message: "Task not found" });

      return res.json({
        message: "Status changed",
        task: {
          id: task._id,
          task_name: task.task_name,
          task_deadline: task.task_deadline,
          status: task.status,
          task_description: task.task_description,
          created_by: task.created_by,
          created_on: task.createdAt,
          updated_on: task.updatedAt,
        },
      });
    } catch {
      return res.status(500).json({ message: "Failed to change status" });
    }
  }
);

// DELETE /api/tasks/delete_task/:id
router.delete("/delete_task/:id", async (req: AuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = res.locals.user;

    const task = await Task.findOneAndDelete({ _id: id, owner: user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    return res.json({ message: "Task deleted", task_id: id });
  } catch {
    return res.status(500).json({ message: "Failed to delete task" });
  }
});

export default router;

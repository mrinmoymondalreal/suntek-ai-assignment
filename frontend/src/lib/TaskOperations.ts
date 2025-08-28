import type { Task } from "@/components/TaskItem";

export function UpdateTaskStatus(
  taskid: string,
  status: "Pending" | "In Progress" | "Completed"
) {
  // TODO: Implement task status update logic

  throw new Error("Not implemented");
}

export function UpdateTask(taskid: string, task_data: Task) {
  // TODO: Implement task update logic
  // throw new Error("Not implemented");
}

export function deleteTask(taskid: string) {
  // TODO: Implement task deletion logic

  throw new Error("Not implemented");
}

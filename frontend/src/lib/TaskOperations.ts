import type { Task } from "@/components/TaskItem";
import { fetchClient } from "./fetchClient";

export async function CreateTask(task_data: Task) {
  return await fetchClient(`/api/tasks/create_task`, {
    method: "POST",
    body: JSON.stringify({
      task_name: task_data.title,
      task_description: task_data.description,
      task_deadline: task_data.dueDate,
      status: "Pending",
    }),
  });
}

export async function UpdateTaskStatus(
  taskid: string,
  status: "Pending" | "In Progress" | "Completed"
) {
  return await fetchClient(`/api/tasks/change_status/${taskid}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function UpdateTask(taskid: string, task_data: Task) {
  return await fetchClient(`/api/tasks/update_task/${taskid}`, {
    method: "PATCH",
    body: JSON.stringify({
      task_name: task_data.title,
      task_description: task_data.description,
      task_deadline: task_data.dueDate,
    }),
  });
}

export async function deleteTask(taskid: string) {
  return await fetchClient(`/api/tasks/delete_task/${taskid}`, {
    method: "DELETE",
  });
}

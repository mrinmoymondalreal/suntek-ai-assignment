import type { Task } from "@/components/TaskItem";
import { fetchClient } from "./fetchClient";

export async function CreateTask(task_data: Task) {
  const aiResp = await fetchClient("/api/ai/suggest", {
    method: "POST",
    body: JSON.stringify({
      text: task_data.title,
    }),
  });

  const aiData = (await aiResp.json()) as {
    suggestion: {
      title: string;
      description: string;
    };
    deadline: Date;
  };
  const {
    suggestion: { title, description },
    deadline,
  } = aiData;

  console.log(title, description, deadline, task_data.dueDate);

  return await (
    await fetchClient(`/api/tasks/create_task`, {
      method: "POST",
      body: JSON.stringify({
        task_name: title,
        task_description: description,
        task_deadline: deadline || task_data.dueDate,
        status: "Pending",
      }),
    })
  ).json();
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

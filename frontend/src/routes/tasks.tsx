import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { TaskItem, type Task } from "@/components/TaskItem";
import { CreateTaskButton } from "@/components/CreateTaskButton";
import { useLoaderData } from "react-router";
import Header from "@/components/Header";
import { UpdateTaskStatus } from "@/lib/TaskOperations";

const TodoApp = () => {
  const loaderData = useLoaderData();
  const timers = new Set<string>();
  loaderData.activeTimers.map((timer: { task_id: { _id: string } }) => {
    timers.add(timer.task_id._id);
  });
  const all_tasks = loaderData.tasks.map((task: any) => ({
    title: task.task_name,
    description: task.task_description,
    status: task.status,
    dueDate: new Date(task.task_deadline),
    id: task.id,
    isTimerRunning: timers.has(task.id),
  }));
  const [tasks, setTasks] = useState<Task[]>(all_tasks);

  if (tasks.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen p-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    Task List
                    <Badge variant="secondary" className="text-xs">
                      0
                    </Badge>
                  </h2>
                </div>
              </div>

              <div className="space-y-3">No Task Avialable</div>
            </div>
            <CreateTaskButton tasks={tasks} setTasks={setTasks} />
          </div>
        </div>
      </>
    );
  }

  const completedBonusCount = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const setTaskStatus = (id: string, status: Task["status"]) => {
    UpdateTaskStatus(id, status);
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === id ? { ...task, status } : task))
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-screen p-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  Task List
                  <Badge variant="secondary" className="text-xs">
                    {completedBonusCount}
                  </Badge>
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskItem
                  setTask={setTasks}
                  key={task.id}
                  setTaskStatus={setTaskStatus}
                  task={task}
                />
              ))}
            </div>
          </div>
          <CreateTaskButton tasks={tasks} setTasks={setTasks} />
        </div>
      </div>
    </>
  );
};

export default TodoApp;

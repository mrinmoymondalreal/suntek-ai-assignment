"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { TaskItem, type Task } from "@/components/TaskItem";
import { Button } from "@/components/ui/button";
import { CreateTaskButton } from "@/components/CreateTaskButton";

const TodoApp = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Add your first Project",
      description:
        "Tip: organizing similar or related tasks into a Project can help with the mental clutter.",
      status: "Pending",
      dueDate: "24 Feb 2027",
    },
    {
      id: "2",
      title: "Add Todoist to your email",
      description: "Turn any email into a task.",
      status: "Pending",
    },
    {
      id: "3",
      title: "Subscribe for monthly productivity inspiration",
      description: "",
      status: "In Progress",
    },
    {
      id: "4",
      title: "Explore our curated templates",
      description: "",
      status: "Completed",
    },
  ]);

  const completedBonusCount = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const setTaskStatus = (id: string, status: Task["status"]) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === id ? { ...task, status } : task))
    );
  };

  return (
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
  );
};

export default TodoApp;

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "./TaskDialog";
import TaskTimer from "./TaskTimer";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed";
  dueDate?: Date | string;
  isTimerRunning?: boolean;
}

export function TaskItem({
  task,
  setTaskStatus,
  setTask,
}: {
  task: Task;
  setTaskStatus: (
    id: string,
    status: "Pending" | "In Progress" | "Completed"
  ) => void;
  setTask: React.Dispatch<React.SetStateAction<Task[]>>;
}) {
  const [status, setStatus] = useState(task.status);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  );
  const [isDescriptionAvailable, setIsDescriptionAvailable] = useState(
    Boolean(description && description.length > 0)
  );

  const handleStatusChange = (
    status: "Pending" | "In Progress" | "Completed"
  ) => {
    return () => {
      setStatus(status);
      setTaskStatus(task.id, status);
    };
  };

  const getDate = () => {
    if (dueDate instanceof Date) {
      return dueDate.toDateString();
    }
    return dueDate;
  };

  return (
    <>
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={{ ...task, title, description, status }}
        status={status}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        getDate={getDate}
        dueDate={dueDate}
        setDueDate={setDueDate}
        isDescriptionAvailable={isDescriptionAvailable}
        setIsDescriptionAvailable={setIsDescriptionAvailable}
        handleStatusChange={handleStatusChange}
        setTask={setTask}
      />
      <div className="transition-all duration-200 flex items-start gap-3 group overflow-hidden dark:text-white">
        <Checkbox
          checked={status == "Completed"}
          onCheckedChange={(checked) =>
            handleStatusChange(checked ? "Completed" : "Pending")()
          }
          className="mt-1 border border-gray-600 rounded-full"
        />
        <div
          className="flex-1 cursor-pointer transition-all duration-200 dark:text-white"
          onClick={() => setTaskDialogOpen(true)}
        >
          <div
            className={cn("transition-all duration-200 dark:text-white", {
              "line-through text-gray-500": status == "Completed",
              "text-gray-900": status != "Completed",
            })}
          >
            {title}
          </div>
          {isDescriptionAvailable && (
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {description}
            </p>
          )}
          <div className="flex gap-2 transition-all duration-200">
            {getDate() && (
              <div className="flex text-orange-500 items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">{getDate()}</span>
              </div>
            )}
            {status == "Pending" && (
              <Button
                className="transition-all duration-200 hidden group-hover:flex p-2 h-5 text-xs hover:bg-purple-600/30 bg-purple-600/20 text-purple-800"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange("In Progress")();
                }}
              >
                Mark in progress
              </Button>
            )}
            {task.isTimerRunning && (
              <div className="flex items-end text-xs text-blue-800">
                <span className="font-medium">Timer running</span>
              </div>
            )}
            {status == "In Progress" && (
              <div
                className="flex items-end text-xs text-purple-800"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange("Pending")();
                }}
              >
                <span className="font-medium">In Progress</span>
                <span className="text-gray-500 ml-1 hidden group-hover:block">
                  - Click to mark as pending
                </span>
              </div>
            )}
          </div>
        </div>
        {/* Task Timer */}
        {status != "Completed" && (
          <div
            className={cn(
              {
                "translate-x-full opacity-0 group-hover:opacity-100 group-hover:translate-x-0":
                  !task.isTimerRunning,
              },
              "transition-all duration-200"
            )}
          >
            <TaskTimer taskId={task.id} setTask={setTask} />
          </div>
        )}
      </div>
    </>
  );
}

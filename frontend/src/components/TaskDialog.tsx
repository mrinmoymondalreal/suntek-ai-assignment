import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import Calendar29 from "./Caledar";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";
import { deleteTask, UpdateTask } from "@/lib/TaskOperations";
import { type Task } from "./TaskItem";
import TaskTimer from "./TaskTimer";

export function TaskDialog({
  open,
  onOpenChange,
  task,
  status,
  title,
  setTitle,
  description,
  setDescription,
  getDate,
  dueDate,
  setDueDate,
  isDescriptionAvailable,
  setIsDescriptionAvailable,
  handleStatusChange,
  setTask,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  status: "Pending" | "In Progress" | "Completed";
  title: string;
  dueDate: Date | undefined;
  setDueDate: (d: Date | undefined) => void;
  setTitle: (t: string) => void;
  description: string;
  setDescription: (d: string) => void;
  getDate: () => string | undefined;
  isDescriptionAvailable: boolean;
  setIsDescriptionAvailable: (b: boolean) => void;
  handleStatusChange: (
    status: "Pending" | "In Progress" | "Completed"
  ) => () => void;
  setTask: React.Dispatch<React.SetStateAction<Task[]>>;
}) {
  const descriptionTextAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    descriptionTextAreaRef.current?.focus();
    isDescriptionAvailable && descriptionTextAreaRef.current?.select();
  }, [isDescriptionAvailable, open]);

  useEffect(() => {
    UpdateTask(task.id, { ...task, dueDate, title, description, status });
    // Update the task in the local state as well
    setTask((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, dueDate, title, description, status } : t
      )
    );
  }, [title, description, status, dueDate, task.id, setTask]);

  const handleStatusUpdate = (
    newStatus: "Pending" | "In Progress" | "Completed"
  ) => {
    handleStatusChange(newStatus)();
    setTask((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setTask((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, title: newTitle } : t))
    );
  };

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
    setTask((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, description: newDescription } : t
      )
    );
  };

  const handleDueDateChange = (newDueDate: Date | undefined) => {
    setDueDate(newDueDate);
    setTask((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, dueDate: newDueDate } : t))
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex h-full">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-start gap-3 mb-6">
              <Checkbox
                checked={status == "Completed"}
                onCheckedChange={(checked) =>
                  handleStatusUpdate(checked ? "Completed" : "Pending")
                }
                className="mt-1 border border-gray-600 rounded-full"
              />
              <div className="flex-1">
                <DialogTitle className="hidden">{title}</DialogTitle>
                <Input
                  className="border-none px-2 mr-6 w-[90%] text-xl font-medium text-gray-900 mb-2"
                  onChange={(e) => handleTitleChange(e.target.value)}
                  value={title}
                />
                <TaskStatusBadge status={status} />
                <Textarea
                  ref={descriptionTextAreaRef}
                  className={cn(
                    "hidden border-none text-gray-600 p-2 mt-2 mb-4",
                    {
                      "block ": isDescriptionAvailable,
                    }
                  )}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  onBlur={(e) => {
                    if (e.target.value === "") setIsDescriptionAvailable(false);
                  }}
                  value={description}
                />
                {!isDescriptionAvailable && (
                  <div>
                    <Button
                      variant={"ghost"}
                      className="-ml-1 p-0 text-gray-400 mt-2 mb-4"
                      size={"sm"}
                      onClick={() => setIsDescriptionAvailable(true)}
                    >
                      <Plus /> Add a description
                    </Button>
                  </div>
                )}

                {status === "Pending" && (
                  <Button
                    className="transition-all duration-200 ml-2 text-xs hover:bg-purple-600/30 bg-purple-600/20 text-purple-800"
                    size="sm"
                    onClick={() => handleStatusUpdate("In Progress")}
                  >
                    Mark in progress
                  </Button>
                )}
                {status === "In Progress" && (
                  <Button
                    className="transition-all duration-200 ml-2 text-xs hover:bg-yellow-600/30 bg-yellow-600/20 text-yellow-800"
                    size="sm"
                    onClick={() => handleStatusUpdate("Pending")}
                  >
                    Mark Pending
                  </Button>
                )}
              </div>
            </div>
            <Calendar29
              updateValue={handleDueDateChange}
              defaultValue={getDate()}
            />
          </div>
        </div>
        <div className="w-full flex flex-row items-center justify-between py-4 px-6">
          <div>
            <div className="flex items-center gap-4">
              <TaskTimer setTask={setTask} taskId={task.id} />
            </div>
          </div>
          <Button
            onClick={async () => {
              await deleteTask(task.id);
              setTask((prev) => {
                return prev.filter((t) => t.id !== task.id);
              });
            }}
            className="w-fit"
            variant={"destructive"}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

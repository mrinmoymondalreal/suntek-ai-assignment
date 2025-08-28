import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Task } from "./TaskItem";
import Calendar29 from "./Caledar";
import { CreateTask } from "@/lib/TaskOperations";

export function CreateTaskButton({
  tasks,
  setTasks,
}: {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(
    undefined
  );

  const handleAddTask = async () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
        description: newTaskDescription,
        status: "Pending",
        dueDate: newTaskDueDate,
      };
      const data = await CreateTask(newTask);
      newTask.id = data.task.id;
      newTask.description = data.task.task_description;
      newTask.dueDate = data.task.task_deadline;
      newTask.title = data.task.task_name;

      setTasks([newTask, ...tasks]);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskDueDate(undefined);
      setShowTaskForm(false);
    }
  };
  return showTaskForm ? (
    <Card className="py-2">
      <CardContent className="px-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="task-title"
              className="text-gray-600 dark:text-slate-300"
            >
              Title:{" "}
            </label>
            <Input
              id="task-title"
              placeholder="Finish sales report by Thu at 3pm"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="border-0 bg-transparent dark:pl-2 p-0 text-base placeholder:text-gray-400 focus-visible:ring-0"
            />
          </div>
          <Textarea
            placeholder="Description (AI will be used to set title, description and deadline based on the title you provided)"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="border-0 p-0 bg-transparent dark:pl-2 resize-none placeholder:text-gray-400 focus-visible:ring-0"
            rows={2}
          />
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Calendar29 updateValue={setNewTaskDueDate} />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTaskForm(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddTask}>
                Add task
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ) : (
    <Button
      variant="ghost"
      onClick={() => setShowTaskForm(true)}
      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
    >
      <Plus className="w-4 h-4 mr-2" />
      Add task
    </Button>
  );
}

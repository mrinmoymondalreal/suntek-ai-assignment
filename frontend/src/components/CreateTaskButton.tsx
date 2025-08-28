import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Task } from "./TaskItem";
import Calendar29 from "./Caledar";

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

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
        description: newTaskDescription,
        status: "Pending",
        dueDate: newTaskDueDate,
      };
      setTasks([...tasks, newTask]);
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
            <label htmlFor="task-title" className="text-gray-600">
              Title:{" "}
            </label>
            <Input
              id="task-title"
              placeholder="Finish sales report by Thu at 3pm"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="border-0 p-0 text-base placeholder:text-gray-400 focus-visible:ring-0"
            />
          </div>
          <Textarea
            placeholder="Description"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="border-0 p-0 resize-none placeholder:text-gray-400 focus-visible:ring-0"
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

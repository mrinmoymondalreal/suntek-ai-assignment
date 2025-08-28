import { Play, Square } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/fetchClient";
import type { Task } from "./TaskItem";

const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

function Timer({
  startedOn,
  isTimerRunning,
}: {
  startedOn: Date;
  isTimerRunning: boolean;
}) {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerRunning) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = now.getTime() - startedOn.getTime();
        setTimeElapsed(elapsed);
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isTimerRunning, startedOn]);

  return formatTime(timeElapsed);
}

export default function ({
  taskId,
  setTask,
}: {
  taskId: string;
  setTask: React.Dispatch<React.SetStateAction<Task[]>>;
}) {
  const [isTimerRunning, setTimerRunning] = useState(false);
  const [lastStartedOn, setLastStartedOn] = useState<Date | null>(null);

  const {} = useQuery({
    queryKey: ["timer", taskId],
    queryFn: () => {
      return fetchClient(`/api/timers/history/${taskId}`)
        .then((res) => res.json())
        .then((data) => {
          const currentTimer = data.timer_history.find(
            (e: { is_active: boolean; start_time: string }) => e.is_active
          );
          if (currentTimer) {
            setLastStartedOn(new Date(currentTimer.start_time));
            setTimerRunning(true);
          }
        });
    },
  });

  const handleRunningStatus = (status: boolean) => {
    setTask((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              isTimerRunning: status,
              status: status ? "In Progress" : "Pending",
            }
          : task
      )
    );
  };

  const stop = useMutation({
    mutationFn: async () => {
      return await fetchClient(`/api/timers/stop/${taskId}`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      setTimerRunning(false);
      handleRunningStatus(false);
    },
  });

  const start = useMutation({
    mutationFn: async () => {
      return await fetchClient(`/api/timers/start/${taskId}`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      setTimerRunning(true);
      setLastStartedOn(new Date());
      handleRunningStatus(true);
    },
  });

  return (
    <div className="flex gap-3">
      <div>
        {isTimerRunning ? (
          <Button
            size="sm"
            variant="outline"
            className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
            onClick={() => {
              stop.mutate();
            }}
          >
            <Square className="w-4 h-4 mr-1" />
            Stop
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            onClick={() => {
              start.mutate();
            }}
          >
            <Play className="w-4 h-4 mr-1" />
            Start
          </Button>
        )}
      </div>

      {lastStartedOn && (
        <div className="flex flex-col justify-end text-sm text-gray-600">
          <div className="font-medium">
            {isTimerRunning && (
              <Timer
                startedOn={lastStartedOn!}
                isTimerRunning={isTimerRunning}
              />
            )}
          </div>
          <div className="text-xs text-gray-400">
            {isTimerRunning ? "Started" : "Last"}:{" "}
            {lastStartedOn?.toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}

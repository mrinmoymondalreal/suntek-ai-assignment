import {
  TrendingUp as IconTrendingUp,
  TrendingDown as IconTrendingDown,
  Clock,
  CheckCircle,
  Circle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TaskData {
  date: string;
  tasks_worked_on: Array<{
    id: string;
    task_name: string;
    status: string;
    task_deadline: string;
    created_by: string;
  }>;
  total_time_tracked: {
    seconds: number;
    formatted: string;
  };
  completed_tasks_today: any[];
  in_progress_or_pending: Array<{
    id: string;
    task_name: string;
    status: string;
    task_deadline: string;
    created_by: string;
  }>;
}

interface SectionCardsProps {
  data: TaskData;
}

export function SectionCards({ data }: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Time Tracked</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.total_time_tracked.formatted}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Clock />
              Today
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Time logged today <Clock className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {data.total_time_tracked.seconds} seconds total
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tasks Worked On</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.tasks_worked_on.length}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tasks in progress <Circle className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Tasks being worked on today
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Completed Tasks</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.completed_tasks_today.length}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <CheckCircle />
              Done
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tasks completed today <CheckCircle className="size-4" />
          </div>
          <div className="text-muted-foreground">Daily completion rate</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pending Tasks</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.in_progress_or_pending.length}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              Pending
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tasks awaiting completion <Circle className="size-4" />
          </div>
          <div className="text-muted-foreground">Requires attention</div>
        </CardFooter>
      </Card>
    </div>
  );
}

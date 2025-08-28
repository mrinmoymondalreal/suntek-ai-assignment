"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const description = "An interactive area chart";

// const chartData = [
//   {
//     date: "2025-08-27",
//     tasks_worked_on: 2,
//     total_time_seconds: 6464,
//     completed_tasks: 0,
//     pending_tasks: 2,
//   },
//   // Add more sample data as needed
//   {
//     date: "2025-08-26",
//     tasks_worked_on: 1,
//     total_time_seconds: 3600,
//     completed_tasks: 1,
//     pending_tasks: 0,
//   },
//   {
//     date: "2025-08-25",
//     tasks_worked_on: 3,
//     total_time_seconds: 7200,
//     completed_tasks: 2,
//     pending_tasks: 1,
//   },
// ];

const chartConfig = {
  productivity: {
    label: "Productivity",
  },
  tasks_worked_on: {
    label: "Tasks Worked On",
    color: "var(--primary)",
  },
  completed_tasks: {
    label: "Completed Tasks",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface GraphData {
  date: string;
  tasks_worked_on: number;
  total_time_seconds: number;
  completed_tasks: number;
  pending_tasks: number;
}

export function ChartAreaInteractive({ data }: { data: GraphData[] }) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = data.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2025-08-27");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Task Productivity</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Tasks worked on and completed over time
          </span>
          <span className="@[540px]/card:hidden">Task activity</span>
        </CardDescription>
        <CardAction>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient
                id="fillTasksWorkedOn"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-tasks_worked_on)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-tasks_worked_on)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="fillCompletedTasks"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-completed_tasks)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-completed_tasks)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="completed_tasks"
              type="natural"
              fill="url(#fillCompletedTasks)"
              stroke="var(--color-completed_tasks)"
              stackId="a"
            />
            <Area
              dataKey="tasks_worked_on"
              type="natural"
              fill="url(#fillTasksWorkedOn)"
              stroke="var(--color-tasks_worked_on)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// import Header from "@/components/Header";

// export default function Page() {
//   return (
//     <>
//       <Header />
//     </>
//   );
// }

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import Header from "@/components/Header";
import { useLoaderData } from "react-router";

// import data from "./data.json";

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

interface GraphData {
  date: string;
  tasks_worked_on: number;
  total_time_seconds: number;
  completed_tasks: number;
  pending_tasks: number;
}

export default function Page() {
  const loaderData = useLoaderData<{
    info: TaskData;
    chartData: GraphData[];
  }>();

  return (
    <>
      <Header />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards data={loaderData.info} />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive data={loaderData.chartData} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

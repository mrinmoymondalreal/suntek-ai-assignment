import { Badge } from "@/components/ui/badge";

export function TaskStatusBadge({
  status,
}: {
  status: "Pending" | "In Progress" | "Completed";
}) {
  if (status === "Completed")
    return <Badge variant="secondary">Completed</Badge>;
  if (status === "Pending") return <Badge variant="destructive">Pending</Badge>;
  return (
    <Badge variant="secondary" className="bg-purple-600/20 text-purple-800">
      In Progress
    </Badge>
  );
}

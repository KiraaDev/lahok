import { cn } from "@/lib/utils";
import { STATUS_LABELS, type EventStatus } from "@/types/event";

const STYLES: Record<EventStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  ongoing: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  completed: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export function StatusBadge({ status }: { status: EventStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
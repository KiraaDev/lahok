import { Skeleton } from "@/components/ui/skeleton";

export function AttendanceSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}
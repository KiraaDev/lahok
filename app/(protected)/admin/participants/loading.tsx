import { Skeleton } from "@/components/ui/skeleton";

export default function ParticipantsLoading() {
  return (
    <div className="mx-auto w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-9 w-40 rounded-md" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-full rounded-md sm:max-w-sm sm:flex-1" />
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex items-center gap-4 border-b px-4 py-3">
          <Skeleton className="h-4 w-24 flex-1" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="hidden h-4 w-12 md:block" />
          <Skeleton className="hidden h-4 w-16 lg:block" />
          <Skeleton className="size-8 rounded-md" />
        </div>

        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0">
            <div className="flex flex-1 items-center gap-3">
              <Skeleton className="size-9 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24 lg:hidden" />
              </div>
            </div>
            <Skeleton className="h-8 w-12" />
            <Skeleton className="hidden h-4 w-12 md:block" />
            <Skeleton className="hidden h-4 w-20 lg:block" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
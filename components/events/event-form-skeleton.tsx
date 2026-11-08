// components/events/event-form-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function EventFormSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-24" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="flex gap-3">
            <Skeleton className="h-9 w-32 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md" />
          </div>
        </div>

        <div className="space-y-6">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
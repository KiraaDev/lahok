import { Skeleton } from "@/components/ui/skeleton";

function FieldSkeleton({ width = "w-full" }: { width?: string }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className={`h-9 ${width}`} />
    </div>
  );
}

function CardSkeleton({
  titleWidth = "w-36",
  children,
}: {
  titleWidth?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="space-y-2 p-6">
        <Skeleton className={`h-5 ${titleWidth}`} />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <div className="space-y-5 p-6 pt-0">{children}</div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto w-full space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {/* Barangay information */}
          <CardSkeleton titleWidth="w-44">
            <FieldSkeleton />

            <div className="grid gap-4 sm:grid-cols-2">
              <FieldSkeleton width="w-full" />
              <FieldSkeleton width="w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </CardSkeleton>

          {/* Contact */}
          <CardSkeleton titleWidth="w-20">
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldSkeleton />
              <FieldSkeleton />
            </div>
            <FieldSkeleton />
          </CardSkeleton>

          {/* Appearance */}
          <CardSkeleton titleWidth="w-28">
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
            </div>

            <FieldSkeleton width="w-32" />

            <div className="flex gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="size-7 rounded-full" />
              ))}
            </div>
          </CardSkeleton>

          {/* Actions */}
          <div className="flex gap-3">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>

        {/* Live preview */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <CardSkeleton titleWidth="w-20">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>

            <Skeleton className="h-9 w-full rounded-md" />

            <div className="flex items-center gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </CardSkeleton>
        </aside>
      </div>
    </div>
  );
}
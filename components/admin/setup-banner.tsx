import Link from "next/link";
import { Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function SetupBanner() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">Set up your barangay</p>
        <p className="text-sm text-muted-foreground">
          Your public page still shows Lahok&apos;s default text. Add your barangay name,
          logo, and contact details to make it yours.
        </p>
      </div>
      <Link href="/admin/settings" className={cn(buttonVariants({ size: "sm" }))}>
        <Settings className="size-4" />
        Open settings
      </Link>
    </div>
  );
}
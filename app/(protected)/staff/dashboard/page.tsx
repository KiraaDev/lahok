import { CheckInEvents } from "@/components/check-in/check-in-events";
import { requireStaff } from "@/lib/auth/require-staff";

export const metadata = {
  title: "Dashboard",
};

export default async function StaffDashboardPage() {
  const user = await requireStaff();
  const firstName = user.full_name?.trim().split(/\s+/)[0] ?? null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          {firstName ? `Hi, ${firstName}` : "Welcome"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Pick an event to start checking people in.
        </p>
      </div>

      <CheckInEvents />
    </div>
  );
}
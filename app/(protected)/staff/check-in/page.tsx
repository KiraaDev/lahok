import { CheckInEvents } from "@/components/check-in/check-in-events";
import { requireStaff } from "@/lib/auth/require-staff";

export const metadata = {
  title: "Check-in",
};

export default async function CheckInPage() {
  await requireStaff();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Check-in</h2>
        <p className="text-sm text-muted-foreground">
          Choose an event to start checking people in.
        </p>
      </div>

      <CheckInEvents />
    </div>
  );
}
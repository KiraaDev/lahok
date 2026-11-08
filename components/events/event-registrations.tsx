import { connection } from "next/server";

import { RegistrationsPanel } from "@/components/events/registrations-panel";
import { getTodayKey } from "@/lib/calendar";
import { getEventRegistrations } from "@/lib/registrations";

export async function EventRegistrations({ eventId }: { eventId: string }) {
  await connection();

  const registrations = await getEventRegistrations(eventId);

  return (
    <RegistrationsPanel
      eventId={eventId}
      registrations={registrations}
      todayKey={getTodayKey()}
    />
  );
}
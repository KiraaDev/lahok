import { connection } from "next/server";

import { AttendancePanel } from "@/components/events/attendance-panel";
import { getEventAttendance } from "@/lib/attendance";
import type { EventStatus } from "@/types/event";

type Props = { eventId: string; eventStatus: EventStatus };

export async function EventAttendance({ eventId, eventStatus }: Props) {
  await connection();

  const rows = await getEventAttendance(eventId);

  return (
    <AttendancePanel
      eventId={eventId}
      canCheckIn={eventStatus === "upcoming" || eventStatus === "ongoing"}
      rows={rows}
    />
  );
}
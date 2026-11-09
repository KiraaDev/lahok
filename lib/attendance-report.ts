import { buildCsv } from "@/lib/csv";
import { dateKey } from "@/lib/calendar";
import { formatEventDate, formatEventRange } from "@/lib/format";
import { calculateAge } from "@/lib/participant-utils";
import type { AttendanceRow } from "@/lib/attendance";
import { CATEGORY_LABELS, type EventRecord } from "@/types/event";
import { SEX_LABELS } from "@/types/participant";

type Input = {
  event: Pick<EventRecord, "title" | "starts_at" | "ends_at" | "venue" | "category">;
  headerLines: string[];
  rows: AttendanceRow[];
};

export function buildAttendanceCsv({ event, headerLines, rows }: Input) {
  const eventDay = dateKey(event.starts_at);
  const present = rows.filter((r) => r.checked_in_at).length;

  const lines: (string | number | null)[][] = [
    ...headerLines.map((line) => [line]),
    ["Attendance report"],
    ["Event", event.title],
    ["Date", formatEventRange(event.starts_at, event.ends_at)],
    ["Venue", event.venue ?? ""],
    ["Category", CATEGORY_LABELS[event.category]],
    ["Registered", rows.length],
    ["Present", present],
    ["Absent", rows.length - present],
    [],
    ["No.", "Last name", "First name", "Middle name", "Sex", "Age", "Zone", "Status", "Time in"],
  ];

  rows.forEach((row, index) => {
    const p = row.participant;
    lines.push([
      index + 1,
      p.last_name,
      p.first_name,
      p.middle_name ?? "",
      SEX_LABELS[p.sex] ?? "",
      calculateAge(p.birthdate, eventDay),
      p.zone ?? "",
      row.checked_in_at ? "Present" : "Absent",
      row.checked_in_at ? formatEventDate(row.checked_in_at) : "",
    ]);
  });

  return buildCsv(lines);
}
export const CHECK_IN_STATUSES = [
  "checked_in",
  "already_checked_in",
  "not_registered",
  "event_closed",
  "event_not_found",
  "participant_not_found",
  "forbidden",
] as const;

export type CheckInPerson = {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  zone: string | null;
};

export type CheckInResult = {
  status: (typeof CHECK_IN_STATUSES)[number] | "unknown_code";
  participant: CheckInPerson | null;
  checked_in_at: string | null;
};

export type RosterEntry = CheckInPerson & {
  checked_in_at: string | null;
};
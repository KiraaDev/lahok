const TIME_ZONE = "Asia/Manila";

export function formatEventDate(iso: string) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatEventTime(iso: string) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: TIME_ZONE,
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatDayHeading(key: string) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: TIME_ZONE,
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date(`${key}T12:00:00+08:00`));
}

export function formatMonthTitle(year: number, month: number) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}
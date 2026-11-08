import { z } from "zod";
import { EVENT_CATEGORIES, EVENT_STATUSES } from "@/types/event";

const LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .nullable()
    .transform((v) => (v ? v : null));

const shared = {
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(150, "Keep the title under 150 characters."),
  description: optionalText(5000),
  venue: optionalText(200),
  category: z.enum(EVENT_CATEGORIES, "Choose a category."),
  status: z.enum(EVENT_STATUSES, "Choose a status."),
  is_public: z.boolean(),
};

const localDateTime = z
  .string()
  .regex(LOCAL_DATETIME, "Enter a valid date and time.")
  .refine(
    (v) => !Number.isNaN(new Date(v).getTime()),
    "Enter a valid date and time.",
  );

export const eventFormSchema = z
  .object({
    ...shared,
    starts_at: z
      .string()
      .min(1, "Start date and time is required.")
      .pipe(localDateTime),
    ends_at: z
      .string()
      .nullable()
      .transform((v) => (v ? v : null))
      .pipe(localDateTime.nullable()),
  })
  .refine((v) => !v.ends_at || new Date(v.ends_at) >= new Date(v.starts_at), {
    message: "End time must be after the start time.",
    path: ["ends_at"],
  });

export type EventFormInput = z.input<typeof eventFormSchema>;
export type EventFormData = z.output<typeof eventFormSchema>;

export const eventSchema = z
  .object({
    ...shared,
    starts_at: z.iso.datetime("Enter a valid start time."),
    ends_at: z.iso.datetime("Enter a valid end time.").nullable(),
  })
  .refine((v) => !v.ends_at || new Date(v.ends_at) >= new Date(v.starts_at), {
    message: "End time must be after the start time.",
    path: ["ends_at"],
  });

export type EventData = z.output<typeof eventSchema>;

const manilaParts = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function localInputToIso(value: string) {
  return new Date(`${value}:00+08:00`).toISOString();
}

export function isoToLocalInput(iso: string | null) {
  if (!iso) return "";
  const p = Object.fromEntries(
    manilaParts
      .formatToParts(new Date(iso))
      .map((part) => [part.type, part.value]),
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
export function toEventData(values: EventFormData): EventData {
  return {
    ...values,
    starts_at: localInputToIso(values.starts_at),
    ends_at: values.ends_at ? localInputToIso(values.ends_at) : null,
  };
}

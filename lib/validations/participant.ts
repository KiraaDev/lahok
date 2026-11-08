import { z } from "zod";
import { getTodayKey } from "@/lib/calendar";
import { SEXES } from "@/types/participant";

const requiredName = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(80, `Keep ${label.toLowerCase()} under 80 characters.`);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .nullable()
    .transform((v) => (v ? v : null));

const optionalPhone = z
  .string()
  .trim()
  .nullable()
  .transform((v) => (v ? v : null))
  .pipe(
    z
      .string()
      .regex(/^[0-9+()\-\s]{7,20}$/, "Enter a valid phone number.")
      .nullable()
  );

const birthdate = z
  .string()
  .min(1, "Birthdate is required.")
  .pipe(
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid birthdate.")
      .refine((v) => {
        const [y, m, d] = v.split("-").map(Number);
        const date = new Date(Date.UTC(y, m - 1, d));
        return (
          date.getUTCFullYear() === y &&
          date.getUTCMonth() === m - 1 &&
          date.getUTCDate() === d
        );
      }, "Enter a valid birthdate.")
      .refine((v) => v >= "1900-01-01", "Enter a valid birthdate.")
      .refine((v) => v <= getTodayKey(), "Birthdate cannot be in the future.")
  );

export const participantSchema = z.object({
  first_name: requiredName("First name"),
  middle_name: optionalText(80),
  last_name: requiredName("Last name"),
  birthdate,
  sex: z.enum(SEXES, "Choose sex."),
  zone: optionalText(60),
  contact_number: optionalPhone,
});

export type ParticipantFormInput = z.input<typeof participantSchema>;
export type ParticipantData = z.output<typeof participantSchema>;
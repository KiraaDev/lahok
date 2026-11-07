import { z } from "zod";

export const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .nullable()
    .transform((v) => (v ? v : null));

const optionalEmail = z
  .string()
  .trim()
  .nullable()
  .transform((v) => (v ? v : null))
  .pipe(z.email("Enter a valid email.").nullable());

const optionalUrl = z
  .string()
  .trim()
  .nullable()
  .transform((v) => (v ? v : null))
  .pipe(
    z
      .url("Enter a valid URL.")
      .refine(
        (v) => /^https?:\/\//i.test(v),
        "Link must start with http:// or https://",
      )
      .nullable(),
  );

export const settingsSchema = z.object({
  barangay_name: z
    .string()
    .trim()
    .min(1, "Barangay name is required.")
    .max(100),
  municipality_city: optionalText(100),
  province: optionalText(100),
  primary_color: z.string().regex(HEX_COLOR, "Use a hex color like #1D4ED8."),
  contact_email: optionalEmail,
  contact_number: optionalText(30),
  facebook_url: optionalUrl,
  about: optionalText(500),
});

export type SettingsFormValues = z.input<typeof settingsSchema>;
export type SettingsData = z.output<typeof settingsSchema>;

export const SEXES = ["male", "female"] as const;
export type Sex = (typeof SEXES)[number];

export const SEX_LABELS: Record<Sex, string> = {
  male: "Male",
  female: "Female",
};

export const AGE_GROUPS = ["child", "youth", "adult", "senior"] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];

export const AGE_GROUP_RANGES: Record<AgeGroup, { min: number; max: number | null }> = {
  child: { min: 0, max: 14 },
  youth: { min: 15, max: 30 },
  adult: { min: 31, max: 59 },
  senior: { min: 60, max: null },
};

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  child: "Under 15",
  youth: "Youth (15-30)",
  adult: "Adult (31-59)",
  senior: "Senior (60+)",
};

export const PARTICIPANT_PAGE_SIZE = 20;

export type ParticipantRecord = {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  birthdate: string;
  sex: Sex;
  zone: string | null;
  contact_number: string | null;
  qr_token: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ParticipantListItem = Pick<
  ParticipantRecord,
  | "id"
  | "first_name"
  | "middle_name"
  | "last_name"
  | "birthdate"
  | "sex"
  | "zone"
  | "contact_number"
  | "qr_token"
>;
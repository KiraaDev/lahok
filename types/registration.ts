import type { ParticipantRecord } from "@/types/participant";

export const MAX_REGISTRATIONS_PER_ADD = 100;

export type RegistrationParticipant = Pick<
  ParticipantRecord,
  | "id"
  | "first_name"
  | "middle_name"
  | "last_name"
  | "birthdate"
  | "sex"
  | "zone"
>;

export type RegistrationItem = {
  id: string;
  created_at: string;
  participant: RegistrationParticipant;
};

export type AvailableParticipant = RegistrationParticipant & {
  registered: boolean;
};
export const EVENT_STATUSES = [
  "draft",
  "upcoming",
  "ongoing",
  "completed",
  "cancelled",
] as const;

export const EVENT_CATEGORIES = [
  "sports",
  "clean_up",
  "assembly",
  "seminar",
  "livelihood",
  "cultural",
  "other",
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Draft",
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  sports: "Sports",
  clean_up: "Clean-up drive",
  assembly: "Assembly",
  seminar: "Seminar",
  livelihood: "Livelihood",
  cultural: "Cultural",
  other: "Other",
};

export const EVENT_BANNER_BUCKET = "event-banners";
export const EVENT_BANNER_MAX_BYTES = 2 * 1024 * 1024;
export const EVENT_BANNER_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export type EventRecord = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  venue: string | null;
  category: EventCategory;
  banner_url: string | null;
  status: EventStatus;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicEvent = Pick<
  EventRecord,
  | "id"
  | "title"
  | "slug"
  | "description"
  | "starts_at"
  | "ends_at"
  | "venue"
  | "category"
  | "banner_url"
  | "status"
>;
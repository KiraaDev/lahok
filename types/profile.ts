
export type UserRole = "admin" | "staff";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  created_at: string;
};

export type CurrentUser = Profile & {
  authUser: import("@supabase/supabase-js").User;
};

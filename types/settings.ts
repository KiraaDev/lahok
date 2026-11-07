export type BarangaySettings = {
  id: 1;
  barangay_name: string;
  municipality_city: string | null;
  province: string | null;
  logo_url: string | null;
  primary_color: string; 
  contact_email: string | null;
  contact_number: string | null;
  facebook_url: string | null;
  about: string | null;
  updated_at: string;
};

export type BarangaySettingsUpdate = Partial<
  Omit<BarangaySettings, "id" | "updated_at">
>;
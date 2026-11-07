import { getBarangaySettings } from "@/lib/settings";
import { SettingsForm } from "@/components/settings/settings-form";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const settings = await getBarangaySettings();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Barangay settings
        </h2>

        <p className="text-sm text-muted-foreground">
          Details and branding shown across Lahok, on public pages, and in
          reports.
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}

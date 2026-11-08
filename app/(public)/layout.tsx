import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { getBranding } from "@/lib/branding";
import { getBarangaySettings } from "@/lib/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getBarangaySettings();
  const branding = getBranding(settings);

  const hasContact = Boolean(
    settings.contact_email || settings.contact_number || settings.facebook_url
  );

  return (
    <div className="flex flex-1 flex-col">
      <PublicHeader
        name={branding.name}
        subtitle={branding.headerSubtitle}
        logoUrl={settings.logo_url}
        hasAbout={Boolean(branding.about)}
        hasContact={hasContact}
      />
      <main className="flex-1">{children}</main>
      <PublicFooter left={branding.footerLeft} right={branding.footerRight} />
    </div>
  );
}
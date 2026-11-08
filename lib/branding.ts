import type { BarangaySettings } from "@/types/settings";

export const APP_NAME = "Lahok";
export const DEFAULT_BARANGAY_NAME = "Your Barangay";

const APP_DESCRIPTION =
  "Open-source event management for Sangguniang Kabataan councils. Plan events, register participants, and check people in with QR codes.";

const APP_ABOUT =
  "Lahok is a free, open-source tool that helps Sangguniang Kabataan councils plan events, register participants, and track attendance with QR check-in.";

export function getBranding(settings: BarangaySettings) {
  const name = settings.barangay_name.trim();
  const isConfigured = name !== "" && name !== DEFAULT_BARANGAY_NAME;

  return {
    isConfigured,
    name: isConfigured ? name : APP_NAME,
    headerSubtitle: isConfigured ? "Sangguniang Kabataan" : "Event management for SK",
    heroEyebrow: isConfigured ? "Sangguniang Kabataan" : "Open-source event management",
    heroDescription: isConfigured
      ? "Find out what is happening in our barangay and join the events organized for you."
      : APP_DESCRIPTION,
    aboutTitle: isConfigured ? "About the SK" : `About ${APP_NAME}`,
    about: settings.about?.trim() || (isConfigured ? null : APP_ABOUT),
    footerLeft: isConfigured
      ? `Sangguniang Kabataan of ${name}`
      : `${APP_NAME}: event management for Sangguniang Kabataan`,
    footerRight: isConfigured
      ? "Powered by Lahok, open-source event management for SK."
      : "Free and open source under the MIT license.",
    loginDescription: isConfigured
      ? `Log in to manage events for ${name}.`
      : "Log in to manage events.",
    sidebarSubtitle: isConfigured ? name : "Barangay not set up",
    metaTitle: isConfigured ? `${APP_NAME} · ${name}` : APP_NAME,
    metaDescription: isConfigured
      ? `Events and updates from the Sangguniang Kabataan of ${name}.`
      : APP_DESCRIPTION,
  };
}
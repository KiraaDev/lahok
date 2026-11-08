import Link from "next/link";
import { ArrowRight, CalendarDays, ExternalLink, Mail, MapPin, Phone } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { PublicEventCard } from "@/components/public/public-event-card";
import { getBranding } from "@/lib/branding";
import { getPublicEvents } from "@/lib/public-events";
import { getBarangaySettings } from "@/lib/settings";

export default async function HomePage() {
  const [settings, events] = await Promise.all([
    getBarangaySettings(),
    getPublicEvents(6),
  ]);

  const branding = getBranding(settings);

  const location = [settings.municipality_city, settings.province]
    .filter(Boolean)
    .join(", ");

  const phoneHref = settings.contact_number
    ? `tel:${settings.contact_number.replace(/[^\d+]/g, "")}`
    : null;

  const hasContact = Boolean(
    settings.contact_email || settings.contact_number || settings.facebook_url
  );

  return (
    <>
      <section className="border-b bg-gradient-to-b from-primary/10 to-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-24">
          <div className="max-w-2xl space-y-5">
            <p className="text-sm font-medium text-primary">{branding.heroEyebrow}</p>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              {branding.name}
            </h1>
            {location && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" />
                {location}
              </p>
            )}
            <p className="text-lg text-muted-foreground">{branding.heroDescription}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/#events" className={cn(buttonVariants({ size: "lg" }))}>
                See upcoming events
                <ArrowRight className="size-4" />
              </Link>
              {hasContact && (
                <Link
                  href="/#contact"
                  className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
                >
                  Contact us
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="events" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Upcoming events</h2>
            <p className="text-muted-foreground">Happening now and coming soon.</p>
          </div>
          {events.length > 0 && (
            <Link
              href="/events"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              View all events
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>

        {events.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
            <CalendarDays className="size-8 text-muted-foreground" />
            <p className="font-medium">No upcoming events right now.</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              New events will be posted here. Please check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <PublicEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {branding.about && (
        <section id="about" className="scroll-mt-20 border-t bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-14">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight">{branding.aboutTitle}</h2>
              <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                {branding.about}
              </p>
            </div>
          </div>
        </section>
      )}

      {hasContact && (
        <section id="contact" className="scroll-mt-20 border-t">
          <div className="mx-auto w-full max-w-6xl px-4 py-14">
            <div className="max-w-2xl space-y-5">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">Contact us</h2>
                <p className="text-muted-foreground">
                  Questions about an event? Reach out to the SK.
                </p>
              </div>

              <ul className="space-y-3 text-sm">
                {settings.contact_email && (
                  <li>
                    <a
                      href={`mailto:${settings.contact_email}`}
                      className="flex items-center gap-3 hover:underline"
                    >
                      <Mail className="size-4 text-primary" />
                      {settings.contact_email}
                    </a>
                  </li>
                )}
                {settings.contact_number && phoneHref && (
                  <li>
                    <a href={phoneHref} className="flex items-center gap-3 hover:underline">
                      <Phone className="size-4 text-primary" />
                      {settings.contact_number}
                    </a>
                  </li>
                )}
                {settings.facebook_url && (
                  <li>
                    <a
                      href={settings.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:underline"
                    >
                      <ExternalLink className="size-4 text-primary" />
                      Facebook page
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
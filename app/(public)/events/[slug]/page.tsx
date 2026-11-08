import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import type { Metadata } from "next";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/events/status-badge";
import { formatEventRange } from "@/lib/format";
import { getPublicEventBySlug } from "@/lib/public-events";
import { getBarangaySettings } from "@/lib/settings";
import { CATEGORY_LABELS } from "@/types/event";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  if (!event) return { title: "Event not found" };

  return {
    title: event.title,
    description: event.description?.slice(0, 160) ?? undefined,
    openGraph: event.banner_url ? { images: [event.banner_url] } : undefined,
  };
}

export default async function PublicEventPage({ params }: Props) {
  const { slug } = await params;

  const [event, settings] = await Promise.all([
    getPublicEventBySlug(slug),
    getBarangaySettings(),
  ]);
  if (!event) notFound();

  const phoneHref = settings.contact_number
    ? `tel:${settings.contact_number.replace(/[^\d+]/g, "")}`
    : null;

  const hasContact = Boolean(
    settings.contact_email || settings.contact_number || settings.facebook_url
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10">
      <Link
        href="/events"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
      >
        <ArrowLeft className="size-4" />
        All events
      </Link>

      <div className="relative aspect-[21/9] overflow-hidden rounded-xl border bg-muted">
        {event.banner_url ? (
          <Image
            src={event.banner_url}
            alt=""
            fill
            priority
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-primary/10">
            <CalendarDays className="size-12 text-primary/50" />
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={event.status} />
              <span className="text-sm font-medium text-primary">
                {CATEGORY_LABELS[event.category]}
              </span>
            </div>
            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              {event.title}
            </h1>
          </div>

          {event.description ? (
            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
              {event.description}
            </p>
          ) : (
            <p className="text-muted-foreground">More details will be posted soon.</p>
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">When</p>
                  <p className="text-muted-foreground">
                    {formatEventRange(event.starts_at, event.ends_at)}
                  </p>
                </div>
              </div>

              {event.venue && (
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">Where</p>
                    <p className="text-muted-foreground">{event.venue}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {hasContact && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Questions?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {settings.contact_email && (
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="flex items-center gap-3 break-all hover:underline"
                  >
                    <Mail className="size-4 shrink-0 text-primary" />
                    {settings.contact_email}
                  </a>
                )}
                {settings.contact_number && phoneHref && (
                  <a href={phoneHref} className="flex items-center gap-3 hover:underline">
                    <Phone className="size-4 shrink-0 text-primary" />
                    {settings.contact_number}
                  </a>
                )}
                {settings.facebook_url && (
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:underline"
                  >
                    <ExternalLink className="size-4 shrink-0 text-primary" />
                    Facebook page
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
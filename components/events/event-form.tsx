"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { BannerUpload } from "@/components/events/banner-upload";
import {
  eventFormSchema,
  isoToLocalInput,
  toEventData,
  type EventFormData,
  type EventFormInput,
} from "@/lib/validations/event";
import {
  CATEGORY_LABELS,
  EVENT_CATEGORIES,
  EVENT_STATUSES,
  STATUS_LABELS,
  type EventRecord,
} from "@/types/event";
import {
  createEvent,
  removeEventBanner,
  updateEvent,
  uploadEventBanner,
} from "@/app/(protected)/admin/events/actions";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive";

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function EventForm({ event }: { event?: EventRecord }) {
  const router = useRouter();
  const isEdit = Boolean(event);

  const [pending, startTransition] = useTransition();
  const [bannerPending, startBanner] = useTransition();
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [bannerUrl, setBannerUrl] = useState<string | null>(
    event?.banner_url ?? null,
  );
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    getValues,
    formState: { errors, isDirty },
  } = useForm<EventFormInput, unknown, EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      starts_at: isoToLocalInput(event?.starts_at ?? null),
      ends_at: isoToLocalInput(event?.ends_at ?? null),
      venue: event?.venue ?? "",
      category: event?.category ?? "other",
      status: event?.status ?? "draft",
      is_public: event?.is_public ?? false,
    },
  });

  const [isPublic, eventStatus, description] = useWatch({
    control,
    name: ["is_public", "status", "description"],
  });

  const liveOnPublicPage =
    isPublic && (eventStatus === "upcoming" || eventStatus === "ongoing");
  const busy = pending || bannerPending;

  function releasePreview() {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
  }

  function pickBanner(file: File) {
    setBannerError(null);

    if (event) {
      const formData = new FormData();
      formData.append("banner", file);
      startBanner(async () => {
        const result = await uploadEventBanner(event.id, formData);
        if (result.ok) setBannerUrl(result.url);
        else setBannerError(result.error);
      });
      return;
    }

    releasePreview();
    const preview = URL.createObjectURL(file);
    previewRef.current = preview;
    setBannerFile(file);
    setBannerUrl(preview);
  }

  function removeBanner() {
    setBannerError(null);

    if (event) {
      startBanner(async () => {
        const result = await removeEventBanner(event.id);
        if (result.ok) setBannerUrl(null);
        else setBannerError(result.error);
      });
      return;
    }

    releasePreview();
    setBannerFile(null);
    setBannerUrl(null);
  }

  const onSubmit = useCallback(
    (values: EventFormData) => {
      setStatus(null);

      startTransition(async () => {
        const data = toEventData(values);

        if (event) {
          const result = await updateEvent(event.id, data);

          if (result.ok) {
            reset(getValues());
            setStatus({ type: "success", message: "Event saved." });
          } else {
            setStatus({ type: "error", message: result.error });
          }

          return;
        }

        const result = await createEvent(data);

        if (!result.ok) {
          setStatus({ type: "error", message: result.error });
          return;
        }

        let bannerFailed = false;

        if (bannerFile) {
          const formData = new FormData();
          formData.append("banner", bannerFile);

          const upload = await uploadEventBanner(result.id, formData);
          bannerFailed = !upload.ok;
        }

        releasePreview();

        router.push(
          bannerFailed
            ? `/admin/events/${result.id}?banner=failed`
            : "/admin/events",
        );
      });
    },
    [event, bannerFile, reset, getValues, router],
  );

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
      noValidate
      className="grid gap-6 lg:grid-cols-[1fr_20rem]"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event details</CardTitle>
            <CardDescription>What the event is about.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field id="title" label="Title" error={errors.title?.message}>
              <Input
                id="title"
                placeholder="Youth Basketball Tournament"
                aria-invalid={!!errors.title}
                {...register("title")}
              />
            </Field>

            <Field
              id="description"
              label="Description"
              error={errors.description?.message}
              hint={`${(description ?? "").length}/5000`}
            >
              <Textarea
                id="description"
                rows={5}
                maxLength={5000}
                aria-invalid={!!errors.description}
                {...register("description")}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="category"
                label="Category"
                error={errors.category?.message}
              >
                <select
                  id="category"
                  className={selectClass}
                  aria-invalid={!!errors.category}
                  {...register("category")}
                >
                  {EVENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field id="status" label="Status" error={errors.status?.message}>
                <select
                  id="status"
                  className={selectClass}
                  aria-invalid={!!errors.status}
                  {...register("status")}
                >
                  {EVENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Schedule and venue</CardTitle>
            <CardDescription>Times are in Philippine time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="starts_at"
                label="Starts"
                error={errors.starts_at?.message}
              >
                <Input
                  id="starts_at"
                  type="datetime-local"
                  aria-invalid={!!errors.starts_at}
                  {...register("starts_at")}
                />
              </Field>

              <Field
                id="ends_at"
                label="Ends"
                error={errors.ends_at?.message}
                hint="Optional."
              >
                <Input
                  id="ends_at"
                  type="datetime-local"
                  aria-invalid={!!errors.ends_at}
                  {...register("ends_at")}
                />
              </Field>
            </div>

            <Field id="venue" label="Venue" error={errors.venue?.message}>
              <Input
                id="venue"
                placeholder="Barangay Covered Court"
                aria-invalid={!!errors.venue}
                {...register("venue")}
              />
            </Field>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={busy || (isEdit && !isDirty)}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {isEdit
              ? pending
                ? "Saving..."
                : "Save changes"
              : pending
                ? "Creating..."
                : "Create event"}
          </Button>

          {isEdit ? (
            <Button
              type="button"
              variant="ghost"
              disabled={busy || !isDirty}
              onClick={() => {
                reset();
                setStatus(null);
              }}
            >
              Reset
            </Button>
          ) : null}

          <Link
            href="/admin/events"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              busy && "pointer-events-none opacity-50",
            )}
          >
            {isEdit ? "Back to events" : "Cancel"}
          </Link>

          {status && (
            <p
              role={status.type === "error" ? "alert" : "status"}
              className={cn(
                "text-sm",
                status.type === "error"
                  ? "text-destructive"
                  : "text-muted-foreground",
              )}
            >
              {status.message}
            </p>
          )}
        </div>
      </div>

      <aside className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Banner</CardTitle>
            <CardDescription>
              {isEdit
                ? "Saves as soon as you choose a file."
                : "Uploads when you create the event."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BannerUpload
              url={bannerUrl}
              pending={bannerPending}
              error={bannerError}
              onPick={pickBanner}
              onRemove={removeBanner}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Public page</CardTitle>
            <CardDescription>
              Choose whether residents can see this event.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="is_public">Show on public page</Label>
              <Switch
                id="is_public"
                checked={Boolean(isPublic)}
                onCheckedChange={(value) =>
                  setValue("is_public", value, { shouldDirty: true })
                }
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {liveOnPublicPage
                ? "This event is visible to everyone."
                : isPublic
                  ? "Turned on, but it only appears while the status is Upcoming or Ongoing."
                  : "Only officials can see this event."}
            </p>

            {event && (
              <p className="break-all rounded-md bg-muted px-2 py-1.5 font-mono text-xs text-muted-foreground">
                /events/{event.slug}
              </p>
            )}
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}

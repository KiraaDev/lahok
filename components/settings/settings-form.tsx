"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getContrastColor, getLuminance } from "@/lib/color";
import {
  HEX_COLOR,
  settingsSchema,
  type SettingsData,
  type SettingsFormValues,
} from "@/lib/validations/settings";
import type { BarangaySettings } from "@/types/settings";
import { updateSettings } from "@/app/(protected)/admin/settings/actions";
import { LogoUpload } from "./logo-upload";

const PRESETS = [
  { name: "Blue", value: "#1D4ED8" },
  { name: "Green", value: "#15803D" },
  { name: "Teal", value: "#0F766E" },
  { name: "Purple", value: "#7E22CE" },
  { name: "Red", value: "#B91C1C" },
  { name: "Orange", value: "#C2410C" },
];

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

export function SettingsForm({ settings }: { settings: BarangaySettings }) {
  const [logoUrl, setLogoUrl] = useState(settings.logo_url);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    getValues,
    formState: { errors, isDirty },
  } = useForm<SettingsFormValues, unknown, SettingsData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      barangay_name: settings.barangay_name,
      municipality_city: settings.municipality_city ?? "",
      province: settings.province ?? "",
      primary_color: settings.primary_color,
      contact_email: settings.contact_email ?? "",
      contact_number: settings.contact_number ?? "",
      facebook_url: settings.facebook_url ?? "",
      about: settings.about ?? "",
    },
  });

  const [nameValue, color, aboutValue] = useWatch({
    control,
    name: ["barangay_name", "primary_color", "about"],
  });

  const name = nameValue?.trim() || "Your Barangay";
  const about = aboutValue ?? "";
  const colorValid = HEX_COLOR.test(color);
  const tooLight = colorValid && getLuminance(color) > 0.75;

  const previewStyle = colorValid
    ? ({
        "--primary": color,
        "--primary-foreground": getContrastColor(color),
      } as CSSProperties)
    : undefined;

  const pickColor = (value: string) =>
    setValue("primary_color", value.toUpperCase(), {
      shouldDirty: true,
      shouldValidate: true,
    });

  function onSubmit(values: SettingsData) {
    setStatus(null);
    startTransition(async () => {
      const result = await updateSettings(values);
      if (result.ok) {
        reset(getValues());
        setStatus({ type: "success", message: "Settings saved." });
      } else {
        setStatus({ type: "error", message: result.error });
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid gap-6 lg:grid-cols-[1fr_20rem]"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Barangay information</CardTitle>
            <CardDescription>
              Used in page titles, public pages, and report headers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field
              id="barangay_name"
              label="Barangay name"
              error={errors.barangay_name?.message}
            >
              <Input
                id="barangay_name"
                aria-invalid={!!errors.barangay_name}
                {...register("barangay_name")}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="municipality_city"
                label="Municipality / City"
                error={errors.municipality_city?.message}
              >
                <Input
                  id="municipality_city"
                  {...register("municipality_city")}
                />
              </Field>
              <Field
                id="province"
                label="Province"
                error={errors.province?.message}
              >
                <Input id="province" {...register("province")} />
              </Field>
            </div>
            <Field
              id="about"
              label="About"
              error={errors.about?.message}
              hint={`${about.length}/500`}
            >
              <Textarea
                id="about"
                rows={4}
                maxLength={500}
                {...register("about")}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact</CardTitle>
            <CardDescription>
              Shown on the public events page so residents can reach the SK.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="contact_email"
                label="Email"
                error={errors.contact_email?.message}
              >
                <Input
                  id="contact_email"
                  type="email"
                  autoComplete="off"
                  {...register("contact_email")}
                />
              </Field>
              <Field
                id="contact_number"
                label="Phone number"
                error={errors.contact_number?.message}
              >
                <Input
                  id="contact_number"
                  type="tel"
                  autoComplete="off"
                  {...register("contact_number")}
                />
              </Field>
            </div>
            <Field
              id="facebook_url"
              label="Facebook page"
              error={errors.facebook_url?.message}
              hint="Optional. Paste the full link, starting with https://"
            >
              <Input
                id="facebook_url"
                inputMode="url"
                placeholder="https://facebook.com/..."
                {...register("facebook_url")}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>
              Your logo and main color across the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <LogoUpload
              url={logoUrl}
              barangayName={name}
              onChange={setLogoUrl}
            />

            <Field
              id="primary_color"
              label="Primary color"
              error={errors.primary_color?.message}
              hint={
                tooLight
                  ? "This color is very light and may be hard to read as text."
                  : undefined
              }
            >
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label="Pick a color"
                  value={colorValid ? color.toLowerCase() : "#1d4ed8"}
                  onChange={(e) => pickColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-md border bg-transparent p-1"
                />
                <Input
                  id="primary_color"
                  maxLength={7}
                  aria-invalid={!!errors.primary_color}
                  className="max-w-32 font-mono uppercase"
                  {...register("primary_color")}
                />
              </div>
            </Field>

            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  title={p.name}
                  aria-label={`Use ${p.name}`}
                  onClick={() => pickColor(p.value)}
                  style={{ backgroundColor: p.value }}
                  className={cn(
                    "size-7 rounded-full border ring-offset-2 ring-offset-background transition hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring",
                    colorValid &&
                      color.toUpperCase() === p.value &&
                      "ring-2 ring-foreground",
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={!isDirty || pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {pending ? "Saving..." : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={!isDirty || pending}
            onClick={() => {
              reset();
              setStatus(null);
            }}
          >
            Reset
          </Button>
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

      {/* Live preview */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <Card style={previewStyle}>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
            <CardDescription>How your branding will look.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 rounded-lg">
                {logoUrl && (
                  <AvatarImage
                    src={logoUrl}
                    alt=""
                    className="object-contain"
                  />
                )}
                <AvatarFallback className="rounded-lg bg-primary font-semibold text-primary-foreground">
                  {name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-semibold">Lahok</p>
                <p className="truncate text-xs text-muted-foreground">{name}</p>
              </div>
            </div>

            <div className="rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
              Dashboard
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" size="sm" className="flex-1">
                Create event
              </Button>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                Upcoming
              </span>
            </div>
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}

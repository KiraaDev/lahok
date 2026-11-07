"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { removeLogo, uploadLogo } from "@/app/(protected)/admin/settings/actions";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

type Props = {
  url: string | null;
  barangayName: string;
  onChange: (url: string | null) => void;
};

export function LogoUpload({ url, barangayName, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; 
    if (!file) return;

    setError(null);
    if (!ACCEPTED.includes(file.type)) return setError("Use a PNG, JPG, or WebP image.");
    if (file.size > MAX_BYTES) return setError("Image must be 2 MB or smaller.");

    const formData = new FormData();
    formData.append("logo", file);

    startTransition(async () => {
      const result = await uploadLogo(formData);
      if (result.ok) onChange(result.url);
      else setError(result.error);
    });
  }

  function handleRemove() {
    setError(null);
    startTransition(async () => {
      const result = await removeLogo();
      if (result.ok) onChange(null);
      else setError(result.error);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <Avatar className="size-16 rounded-xl border">
          {url && <AvatarImage src={url} alt={`${barangayName} logo`} className="object-contain" />}
          <AvatarFallback className="rounded-xl bg-primary text-xl font-semibold text-primary-foreground">
            {barangayName.trim().charAt(0).toUpperCase() || "L"}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={pending}
            onClick={() => inputRef.current?.click()}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            {url ? "Replace logo" : "Upload logo"}
          </Button>
          {url && (
            <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={handleRemove}>
              <Trash2 className="size-4" />
              Remove
            </Button>
          )}
        </div>

        <input ref={inputRef} type="file" accept={ACCEPTED.join(",")} className="hidden" onChange={handleFile} />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">PNG, JPG, or WebP. Max 2 MB. A square image works best.</p>
      )}
    </div>
  );
}
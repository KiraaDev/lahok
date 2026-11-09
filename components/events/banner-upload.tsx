"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EVENT_BANNER_MAX_BYTES, EVENT_BANNER_TYPES } from "@/types/event";
import Image from "next/image";

type Props = {
  url: string | null;
  pending: boolean;
  error: string | null;
  onPick: (file: File) => void;
  onRemove: () => void;
};

export function BannerUpload({ url, pending, error, onPick, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!(file.type in EVENT_BANNER_TYPES)) {
      return setLocalError("Use a PNG, JPG, or WebP image.");
    }
    if (file.size > EVENT_BANNER_MAX_BYTES) {
      return setLocalError("Image must be 2 MB or smaller.");
    }

    setLocalError(null);
    onPick(file);
  }

  const message = localError ?? error;

  return (
    <div className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
        {url ? (
          <Image
            src={url}
            alt="Event banner preview"
            fill
            sizes="(min-width: 1024px) 320px, 100vw"
            unoptimized={url.startsWith("blob:")}
            className="object-cover"
            loading="eager"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
            <ImagePlus className="size-6" />
            <span className="text-xs">No banner</span>
          </div>
        )}
        {pending && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Loader2 className="size-5 animate-spin" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="size-4" />
          {url ? "Replace" : "Upload banner"}
        </Button>
        {url && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={onRemove}
          >
            <Trash2 className="size-4" />
            Remove
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={Object.keys(EVENT_BANNER_TYPES).join(",")}
        className="hidden"
        onChange={handleFile}
      />

      {message ? (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          PNG, JPG, or WebP. Max 2 MB. A wide image (16:9) works best.
        </p>
      )}
    </div>
  );
}

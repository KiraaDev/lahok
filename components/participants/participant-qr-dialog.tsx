"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { encodeQrValue } from "@/lib/qr";
import { slugify } from "@/lib/slug";
import { formatFullName } from "@/lib/participant-utils";
import type { ParticipantListItem } from "@/types/participant";

type Props = {
  participant: ParticipantListItem | null;
  onOpenChange: (open: boolean) => void;
};

export function ParticipantQrDialog({ participant, onOpenChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!participant) return null;

  const name = formatFullName(participant);

  function download() {
    const source = canvasRef.current;
    if (!source) return;

    const padding = 32;
    const output = document.createElement("canvas");
    output.width = source.width + padding * 2;
    output.height = source.height + padding * 2;

    const context = output.getContext("2d");
    if (!context) return;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, output.width, output.height);
    context.drawImage(source, padding, padding);

    const link = document.createElement("a");
    link.download = `${slugify(name) || "participant"}-qr.png`;
    link.href = output.toDataURL("image/png");
    link.click();
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>
            Scan this code at the event to check in.
          </DialogDescription>
        </DialogHeader>

        <div className="mx-auto rounded-xl bg-white p-4">
          <QRCodeCanvas
            ref={canvasRef}
            value={encodeQrValue(participant.qr_token)}
            size={512}
            level="M"
            className="size-56"
          />
        </div>

        <Button type="button" variant="outline" onClick={download}>
          <Download className="size-4" />
          Download PNG
        </Button>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  qrValue: string;
  fullName: string;
  zone?: string | null;
  eventName?: string | null;
};

export function ParticipantQrCard({
  qrValue,
  fullName,
  zone,
  eventName,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);

  function handleDownload() {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fullName.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
    link.click();
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-6 text-center">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Attendance QR Code
        </p>
        {eventName && (
          <p className="text-sm font-medium text-primary">{eventName}</p>
        )}
      </div>

      <div ref={canvasRef} className="rounded-lg bg-white p-4">
        <QRCodeCanvas
          value={qrValue}
          size={220}
          level="M"
          marginSize={2}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold">{fullName}</h2>
        {zone && <p className="text-sm text-muted-foreground">{zone}</p>}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
        <Download className="mr-2 size-4" />
        Download QR
      </Button>
    </div>
  );
}
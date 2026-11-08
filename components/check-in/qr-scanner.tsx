"use client";

import dynamic from "next/dynamic";

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((module) => module.Scanner),
  {
    ssr: false,
    loading: () => (
      <div className="flex size-full items-center justify-center text-sm text-white/70">
        Starting camera...
      </div>
    ),
  },
);

type Props = {
  onScan: (value: string) => void;
  onError: (message: string) => void;
};

export function QrScanner({ onScan, onError }: Props) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-xl border bg-black">
      <Scanner
        formats={["qr_code"]}
        scanDelay={400}
        constraints={{ facingMode: "environment" }}
        onScan={(detectedCodes) => {
          const raw = detectedCodes[0]?.rawValue;
          if (raw) onScan(raw);
        }}
        onError={(err) =>
          onError(err instanceof Error ? err.message : "Camera error")
        }
      />
    </div>
  );
}

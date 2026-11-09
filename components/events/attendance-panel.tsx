"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Download, Loader2, ScanLine, Undo2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatEventDate } from "@/lib/format";
import { formatFullName, formatListName } from "@/lib/participant-utils";
import type { AttendanceRow } from "@/lib/attendance";
import {
  exportAttendanceCsv,
  undoCheckIn,
} from "@/app/(protected)/admin/events/attendance-actions";

type Props = {
  eventId: string;
  canCheckIn: boolean;
  rows: AttendanceRow[];
};

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function AttendancePanel({ eventId, canCheckIn, rows }: Props) {
  const [exporting, startExport] = useTransition();
  const [undoing, startUndo] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const registered = rows.length;
  const present = rows
    .filter((r) => r.checked_in_at)
    .sort((a, b) => (b.checked_in_at ?? "").localeCompare(a.checked_in_at ?? ""));
  const absent = registered - present.length;
  const percent = registered > 0 ? Math.round((present.length / registered) * 100) : 0;

  function handleExport() {
    setError(null);
    startExport(async () => {
      const result = await exportAttendanceCsv(eventId);
      if (result.ok) downloadCsv(result.filename, result.csv);
      else setError(result.error);
    });
  }

  function handleUndo(row: AttendanceRow) {
    setError(null);
    setBusyId(row.participant.id);
    startUndo(async () => {
      const result = await undoCheckIn(eventId, row.participant.id);
      if (!result.ok) setError(result.error);
      setBusyId(null);
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-base">Attendance</CardTitle>
          <CardDescription>
            {registered === 0
              ? "Register participants to start tracking attendance."
              : `${present.length} of ${registered} checked in (${percent}%).`}
          </CardDescription>
        </div>

        <div className="flex flex-wrap gap-2">
          {canCheckIn && (
            <Link
              href={`/staff/check-in/${eventId}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <ScanLine className="size-4" />
              Open check-in
            </Link>
          )}
          <Button
            type="button"
            size="sm"
            disabled={exporting || registered === 0}
            onClick={handleExport}
          >
            {exporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {exporting ? "Preparing..." : "Export CSV"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Registered" value={registered} />
          <Stat label="Present" value={present.length} />
          <Stat label="Absent" value={absent} />
        </div>

        <div
          className="h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Attendance rate"
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>

        {present.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No one has checked in yet.
          </p>
        ) : (
          <ul className="max-h-96 divide-y overflow-y-auto rounded-lg border">
            {present.map((row) => (
              <li key={row.participant.id} className="flex items-center gap-3 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{formatListName(row.participant)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {row.checked_in_at ? formatEventDate(row.checked_in_at) : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={undoing}
                  aria-label={`Undo check-in for ${formatFullName(row.participant)}`}
                  onClick={() => handleUndo(row)}
                >
                  {undoing && busyId === row.participant.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Undo2 className="size-4" />
                  )}
                  Undo
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Keyboard,
  Loader2,
  RefreshCw,
  ScanLine,
  Search,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrScanner } from "@/components/check-in/qr-scanner";
import { formatEventTime } from "@/lib/format";
import { formatFullName, formatListName } from "@/lib/participant-utils";
import type { CheckInResult, RosterEntry } from "@/types/attendance";
import {
  checkIn,
  checkInManual,
} from "@/app/(protected)/staff/check-in/actions";

type Tone = "success" | "warning" | "error";
type Mode = "scan" | "manual";
type Feedback = { tone: Tone; title: string; detail?: string };

const TONES: Record<Tone, { box: string; Icon: typeof CheckCircle2 }> = {
  success: {
    box: "border-green-500/40 bg-green-50 text-green-900 dark:bg-green-950/40 dark:text-green-100",
    Icon: CheckCircle2,
  },
  warning: {
    box: "border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
    Icon: AlertTriangle,
  },
  error: {
    box: "border-red-500/40 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-100",
    Icon: XCircle,
  },
};

type Props = { eventId: string; initialRoster: RosterEntry[] };

export function CheckInConsole({ eventId, initialRoster }: Props) {
  const router = useRouter();

  const [roster, setRoster] = useState(initialRoster);
  const [previousRoster, setPreviousRoster] = useState(initialRoster);
  if (initialRoster !== previousRoster) {
    setPreviousRoster(initialRoster);
    setRoster(initialRoster);
  }

  const [mode, setMode] = useState<Mode>("scan");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [manualBusyId, setManualBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refreshing, startRefresh] = useTransition();

  const busyRef = useRef(false);
  const lastScan = useRef<string | null>(null);
  const scanCooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = roster.length;
  const checked = roster.filter((r) => r.checked_in_at).length;
  const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

  const needle = search.trim().toLowerCase();
  const filtered = needle
    ? roster.filter((r) =>
        `${formatFullName(r)} ${r.zone ?? ""}`.toLowerCase().includes(needle),
      )
    : roster;

  const recent = roster
    .filter((r) => r.checked_in_at)
    .sort((a, b) =>
      (b.checked_in_at ?? "").localeCompare(a.checked_in_at ?? ""),
    )
    .slice(0, 6);

  function show(next: Feedback) {
    setFeedback(next);
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => setFeedback(null), 3500);
  }

  function markChecked(participantId: string, at: string | null) {
    setRoster((previous) =>
      previous.map((r) =>
        r.id === participantId
          ? { ...r, checked_in_at: at ?? r.checked_in_at }
          : r,
      ),
    );
  }

  function applyResult(result: CheckInResult) {
    const person = result.participant;
    const name = person ? formatListName(person) : "";

    switch (result.status) {
      case "checked_in":
        if (person) markChecked(person.id, result.checked_in_at);
        navigator.vibrate?.(80);
        show({ tone: "success", title: "Checked in", detail: name });
        return;
      case "already_checked_in":
        if (person) markChecked(person.id, result.checked_in_at);
        show({
          tone: "warning",
          title: "Already checked in",
          detail: result.checked_in_at
            ? `${name} at ${formatEventTime(result.checked_in_at)}`
            : name,
        });
        return;
      case "not_registered":
        show({
          tone: "error",
          title: "Not registered for this event",
          detail: name,
        });
        return;
      case "event_closed":
        show({ tone: "error", title: "Check-in is closed for this event" });
        return;
      case "unknown_code":
        show({
          tone: "error",
          title: "Unknown QR code",
          detail: "This is not a Lahok code, or the participant was removed.",
        });
        return;
      default:
        show({ tone: "error", title: "Could not check in" });
    }
  }

  async function handleScan(raw: string) {
    if (busyRef.current) return;
    if (lastScan.current === raw) return;

    lastScan.current = raw;
    if (scanCooldownTimer.current) clearTimeout(scanCooldownTimer.current);
    scanCooldownTimer.current = setTimeout(() => {
      lastScan.current = null;
    }, 4000);

    busyRef.current = true;
    setBusy(true);

    const response = await checkIn(eventId, raw);
    if (response.ok) applyResult(response.result);
    else
      show({
        tone: "error",
        title: "Something went wrong",
        detail: response.error,
      });

    busyRef.current = false;
    setBusy(false);
  }

  async function handleManual(entry: RosterEntry) {
    setManualBusyId(entry.id);

    const response = await checkInManual(eventId, entry.id);
    if (response.ok) applyResult(response.result);
    else
      show({
        tone: "error",
        title: "Something went wrong",
        detail: response.error,
      });

    setManualBusyId(null);
  }

  const tone = feedback ? TONES[feedback.tone] : null;

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-xl border bg-card p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-semibold tracking-tight">
              {checked}
              <span className="text-lg font-normal text-muted-foreground">
                {" "}
                / {total}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">checked in</p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={refreshing}
            onClick={() => startRefresh(() => router.refresh())}
          >
            <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>

        <div
          className="h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Check-in progress"
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {total === 0 && (
        <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
          Nobody is registered for this event yet. Ask an admin to add
          participants first.
        </p>
      )}

      <div
        role="status"
        aria-live="polite"
        className={cn(
          "flex min-h-20 items-center gap-3 rounded-xl border p-4",
          tone ? tone.box : "bg-muted/40 text-muted-foreground",
        )}
      >
        {tone && feedback ? (
          <>
            <tone.Icon className="size-8 shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold">{feedback.title}</p>
              {feedback.detail && (
                <p className="truncate text-sm">{feedback.detail}</p>
              )}
            </div>
          </>
        ) : busy ? (
          <>
            <Loader2 className="size-6 shrink-0 animate-spin" />
            <p className="text-sm">Checking...</p>
          </>
        ) : (
          <>
            <ScanLine className="size-6 shrink-0" />
            <p className="text-sm">
              {mode === "scan"
                ? "Point the camera at a participant's QR code."
                : "Find a participant and tap Check in."}
            </p>
          </>
        )}
      </div>

      <div
        className="grid grid-cols-2 gap-2 rounded-lg border p-1"
        role="group"
        aria-label="Check-in method"
      >
        <Button
          type="button"
          variant={mode === "scan" ? "default" : "ghost"}
          onClick={() => setMode("scan")}
        >
          <ScanLine className="size-4" />
          Scan QR
        </Button>
        <Button
          type="button"
          variant={mode === "manual" ? "default" : "ghost"}
          onClick={() => setMode("manual")}
        >
          <Keyboard className="size-4" />
          Find by name
        </Button>
      </div>

      {mode === "scan" ? (
        <div className="space-y-4">
          {cameraError ? (
            <div className="space-y-3 rounded-xl border border-dashed p-6 text-center">
              <p className="font-medium">The camera is not available.</p>
              <p className="text-sm text-muted-foreground">
                Allow camera access for this site in your browser settings, and
                open Lahok over HTTPS. You can still check people in by name.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode("manual")}
              >
                Find by name
              </Button>
            </div>
          ) : (
            <QrScanner onScan={handleScan} onError={setCameraError} />
          )}

          {recent.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Recent check-ins</h3>
              <ul className="divide-y rounded-lg border">
                {recent.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                  >
                    <p className="truncate text-sm font-medium">
                      {formatListName(r)}
                    </p>
                    <p className="shrink-0 text-xs text-muted-foreground">
                      {r.checked_in_at ? formatEventTime(r.checked_in_at) : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search registered people"
              className="pl-9"
              aria-label="Search registered people"
              autoComplete="off"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No registered participant matches.
            </p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {filtered.slice(0, 50).map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {formatListName(r)}
                    </p>
                    {r.zone && (
                      <p className="truncate text-xs text-muted-foreground">
                        {r.zone}
                      </p>
                    )}
                  </div>

                  {r.checked_in_at ? (
                    <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
                      <CheckCircle2 className="size-4" />
                      {formatEventTime(r.checked_in_at)}
                    </span>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      disabled={manualBusyId !== null}
                      onClick={() => handleManual(r)}
                    >
                      {manualBusyId === r.id && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      Check in
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {filtered.length > 50 && (
            <p className="text-xs text-muted-foreground">
              Showing the first 50 matches. Type more of the name to narrow it
              down.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

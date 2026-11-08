"use client";

import { useState, useTransition } from "react";
import { Loader2, Search, Users, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AddParticipantsDialog } from "@/components/events/add-participants-dialog";
import {
  calculateAge,
  formatFullName,
  formatListName,
  getAgeGroup,
  getInitials,
} from "@/lib/participant-utils";
import type { RegistrationItem } from "@/types/registration";
import { removeRegistration } from "@/app/(protected)/admin/events/registration-actions";

type Props = {
  eventId: string;
  registrations: RegistrationItem[];
  todayKey: string;
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function RegistrationsPanel({ eventId, registrations, todayKey }: Props) {
  const [filter, setFilter] = useState("");
  const [toRemove, setToRemove] = useState<RegistrationItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const needle = filter.trim().toLowerCase();
  const visible = needle
    ? registrations.filter((r) =>
        `${formatFullName(r.participant)} ${r.participant.zone ?? ""}`
          .toLowerCase()
          .includes(needle)
      )
    : registrations;

  function confirmRemove() {
    if (!toRemove) return;
    const target = toRemove;
    setError(null);
    startTransition(async () => {
      const result = await removeRegistration(eventId, target.id);
      if (!result.ok) setError(result.error);
      setToRemove(null);
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-base">Registrations</CardTitle>
          <CardDescription>
            {registrations.length === 0
              ? "No one is registered yet."
              : `${registrations.length} ${registrations.length === 1 ? "person" : "people"} registered.`}
          </CardDescription>
        </div>
        <AddParticipantsDialog eventId={eventId} todayKey={todayKey} />
      </CardHeader>

      <CardContent className="space-y-3">
        {error && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {registrations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
            <Users className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">Nobody registered.</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Add participants so they can be checked in with their QR codes at the event.
            </p>
          </div>
        ) : (
          <>
            {registrations.length > 8 && (
              <div className="relative max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter registered people"
                  className="pl-9"
                  aria-label="Filter registrations"
                />
              </div>
            )}

            {visible.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No one matches your filter.
              </p>
            ) : (
              <ul className="divide-y rounded-lg border">
                {visible.map((r) => {
                  const age = calculateAge(r.participant.birthdate, todayKey);
                  return (
                    <li key={r.id} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {getInitials(r.participant)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {formatListName(r.participant)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {age} · {capitalize(getAgeGroup(age))}
                          {r.participant.zone ? ` · ${r.participant.zone}` : ""}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={pending}
                        aria-label={`Remove ${formatFullName(r.participant)}`}
                        onClick={() => setToRemove(r)}
                      >
                        <X className="size-4" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </CardContent>

      <AlertDialog
        open={toRemove !== null}
        onOpenChange={(open) => {
          if (!open && !pending) setToRemove(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from this event?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                {toRemove ? formatFullName(toRemove.participant) : ""}
              </span>{" "}
              will no longer be registered for this event. Their participant record is not
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={confirmRemove}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              {pending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
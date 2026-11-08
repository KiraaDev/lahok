"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Search, UserPlus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  calculateAge,
  formatListName,
  getAgeGroup,
} from "@/lib/participant-utils";
import {
  MAX_REGISTRATIONS_PER_ADD,
  type AvailableParticipant,
} from "@/types/registration";
import {
  addRegistrations,
  searchParticipantsForEvent,
} from "@/app/(protected)/admin/events/registration-actions";

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

type Props = {
  eventId: string;
  eventTitle?: string;
  todayKey: string;
  variant?: "default" | "outline";
  compact?: boolean;
};

export function AddParticipantsDialog({
  eventId,
  eventTitle,
  todayKey,
  variant = "default",
  compact = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AvailableParticipant[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [searching, startSearch] = useTransition();
  const [saving, startSave] = useTransition();

  const requestId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function runSearch(q: string) {
    const id = ++requestId.current;
    startSearch(async () => {
      const response = await searchParticipantsForEvent(eventId, q);
      if (id !== requestId.current) return;
      if (response.ok) {
        setResults(response.results);
        setError(null);
      } else {
        setError(response.error);
      }
    });
  }

  function handleOpen() {
    setQuery("");
    setResults([]);
    setSelected(new Set());
    setError(null);
    setOpen(true);
    runSearch("");
  }

  function handleOpenChange(next: boolean) {
    if (!next && saving) return;
    if (!next && timer.current) clearTimeout(timer.current);
    setOpen(next);
  }

  function handleQuery(value: string) {
    setQuery(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => runSearch(value), 300);
  }

  function toggle(id: string) {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_REGISTRATIONS_PER_ADD) next.add(id);
      return next;
    });
  }

  function submit() {
    setError(null);
    startSave(async () => {
      const response = await addRegistrations(eventId, Array.from(selected));
      if (response.ok) setOpen(false);
      else setError(response.error);
    });
  }

  return (
    <>
      <Button
        type="button"
        variant={compact ? "outline" : variant}
        size={compact ? "sm" : "default"}
        onClick={handleOpen}
        aria-label={
          compact
            ? eventTitle
              ? `Add participants to ${eventTitle}`
              : "Add participants"
            : undefined
        }
        title={compact ? "Add participants" : undefined}
      >
        <UserPlus className="size-4" />
        <span className={compact ? "hidden xl:inline" : undefined}>
          Add participants
        </span>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add participants</DialogTitle>
            <DialogDescription>
              Search and select the people to register for this event.
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => handleQuery(e.target.value)}
              placeholder="Search by name or zone"
              className="pl-9"
              aria-label="Search participants"
              autoComplete="off"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="max-h-80 overflow-y-auto rounded-lg border">
            {results.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                {searching ? "Searching..." : "No participants found."}
              </p>
            ) : (
              <ul className="divide-y">
                {results.map((p) => {
                  const age = calculateAge(p.birthdate, todayKey);
                  const isSelected = selected.has(p.id);

                  return (
                    <li key={p.id}>
                      <label
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5",
                          p.registered
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer hover:bg-muted/50",
                          isSelected && "bg-primary/5",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="size-4 shrink-0 accent-primary"
                          checked={isSelected}
                          disabled={p.registered}
                          onChange={() => toggle(p.id)}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {formatListName(p)}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {age} · {capitalize(getAgeGroup(age))}
                            {p.zone ? ` · ${p.zone}` : ""}
                          </p>
                        </div>
                        {p.registered && (
                          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            Registered
                          </span>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {results.length >= 20 && (
            <p className="text-xs text-muted-foreground">
              Showing the first 20 matches. Refine your search to find others.
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving || selected.size === 0}
              onClick={submit}
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {saving
                ? "Adding..."
                : selected.size > 0
                  ? `Add ${selected.size} ${selected.size === 1 ? "person" : "people"}`
                  : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
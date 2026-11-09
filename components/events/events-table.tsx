"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Pencil, SlidersHorizontal, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
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
import { Button, buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddParticipantsDialog } from "@/components/events/add-participants-dialog";
import { StatusBadge } from "@/components/events/status-badge";
import { formatEventDate } from "@/lib/format";
import { CATEGORY_LABELS } from "@/types/event";
import type { EventListItem } from "@/lib/events";
import {
  deleteEvent,
  setEventPublic,
} from "@/app/(protected)/admin/events/actions";

type Props = { events: EventListItem[]; todayKey: string };

export function EventsTable({ events, todayKey }: Props) {
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<EventListItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  function togglePublic(event: EventListItem, value: boolean) {
    setError(null);
    setBusyId(event.id);
    startTransition(async () => {
      const result = await setEventPublic(event.id, value);
      if (!result.ok) setError(result.error);
      setBusyId(null);
    });
  }

  function confirmDelete() {
    if (!toDelete) return;
    const target = toDelete;
    setError(null);
    setBusyId(target.id);
    startTransition(async () => {
      const result = await deleteEvent(target.id);
      if (!result.ok) setError(result.error);
      setBusyId(null);
      setToDelete(null);
    });
  }

  return (
    <div className="space-y-3">
      {error && (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden lg:table-cell">Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Public</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {events.map((event) => {
              const busy = pending && busyId === event.id;
              return (
                <TableRow
                  key={event.id}
                  className={busy ? "opacity-60" : undefined}
                >
                  <TableCell className="max-w-64">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="block truncate font-medium hover:underline"
                    >
                      {event.title}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground md:hidden">
                      {formatEventDate(event.starts_at)}
                    </p>
                    {event.venue && (
                      <p className="hidden truncate text-xs text-muted-foreground md:block">
                        {event.venue}
                      </p>
                    )}
                  </TableCell>

                  <TableCell className="hidden whitespace-nowrap text-sm md:table-cell">
                    {formatEventDate(event.starts_at)}
                  </TableCell>

                  <TableCell className="hidden text-sm lg:table-cell">
                    {CATEGORY_LABELS[event.category]}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={event.status} />
                  </TableCell>

                  <TableCell className="text-center">
                    <Switch
                      checked={event.is_public}
                      disabled={pending}
                      aria-label={`Show ${event.title} on the public page`}
                      onCheckedChange={(value) => togglePublic(event, value)}
                    />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <AddParticipantsDialog
                        eventId={event.id}
                        eventTitle={event.title}
                        todayKey={todayKey}
                        compact
                      />

                      <Link
                        href={`/admin/events/${event.id}`}
                        aria-label={`Manage ${event.title}`}
                        title="Manage"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "icon" }),
                        )}
                      >
                        <SlidersHorizontal className="size-4" />
                      </Link>
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        aria-label={`Edit ${event.title}`}
                        title="Edit"
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                        )}
                      >
                        <Pencil className="size-4" />
                      </Link>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={pending}
                        aria-label={`Delete ${event.title}`}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setToDelete(event)}
                      >
                        {busy ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={toDelete !== null}
        onOpenChange={(open) => {
          if (!open && !pending) setToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                {toDelete?.title}
              </span>{" "}
              and everything linked to it, such as registrations and attendance,
              will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              {pending ? "Deleting..." : "Delete event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

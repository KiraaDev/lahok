"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/events/status-badge";
import { formatEventDate } from "@/lib/format";
import { CATEGORY_LABELS } from "@/types/event";
import type { EventListItem } from "@/lib/events";
import { deleteEvent, setEventPublic } from "@/app/(protected)/admin/events/actions";

export function EventsTable({ events }: { events: EventListItem[] }) {
  const router = useRouter();
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
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
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
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {events.map((event) => {
              const busy = pending && busyId === event.id;
              return (
                <TableRow key={event.id} className={busy ? "opacity-60" : undefined}>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label={`Actions for ${event.title}`}
                        className="flex size-8 items-center justify-center rounded-md outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {busy ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="size-4" />
                        )}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => router.push(`/admin/events/${event.id}`)}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setToDelete(event)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
              <span className="font-medium text-foreground">{toDelete?.title}</span>{" "}
              and everything linked to it, such as registrations and attendance, will be
              permanently deleted. This cannot be undone.
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
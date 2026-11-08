"use client";

import { useState, useTransition } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ParticipantDialog } from "@/components/participants/participant-dialog";
import {
  calculateAge,
  formatFullName,
  formatListName,
  getAgeGroup,
  getInitials,
} from "@/lib/participant-utils";
import { SEX_LABELS, type ParticipantListItem } from "@/types/participant";
import { deleteParticipant } from "@/app/(protected)/admin/participants/actions";

type Props = { participants: ParticipantListItem[]; todayKey: string };

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function ParticipantsTable({ participants, todayKey }: Props) {
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<ParticipantListItem | null>(null);
  const [toDelete, setToDelete] = useState<ParticipantListItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  function confirmDelete() {
    if (!toDelete) return;
    const target = toDelete;
    setError(null);
    setBusyId(target.id);
    startTransition(async () => {
      const result = await deleteParticipant(target.id);
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
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead className="hidden md:table-cell">Sex</TableHead>
              <TableHead className="hidden lg:table-cell">Zone</TableHead>
              <TableHead className="hidden xl:table-cell">Contact</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {participants.map((p) => {
              const age = calculateAge(p.birthdate, todayKey);
              const group = getAgeGroup(age);
              const busy = pending && busyId === p.id;

              return (
                <TableRow key={p.id} className={busy ? "opacity-60" : undefined}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {getInitials(p)}
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setEditing(p)}
                          className="block max-w-56 truncate text-left font-medium hover:underline"
                        >
                          {formatListName(p)}
                        </button>
                        <p className="truncate text-xs text-muted-foreground lg:hidden">
                          {[SEX_LABELS[p.sex], p.zone].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="text-sm font-medium">{age}</p>
                    <p className="text-xs text-muted-foreground">{capitalize(group)}</p>
                  </TableCell>

                  <TableCell className="hidden text-sm md:table-cell">
                    {SEX_LABELS[p.sex]}
                  </TableCell>

                  <TableCell className="hidden text-sm lg:table-cell">
                    {p.zone ?? <span className="text-muted-foreground">-</span>}
                  </TableCell>

                  <TableCell className="hidden text-sm xl:table-cell">
                    {p.contact_number ?? <span className="text-muted-foreground">-</span>}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label={`Actions for ${formatFullName(p)}`}
                        className="flex size-8 items-center justify-center rounded-md outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {busy ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="size-4" />
                        )}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => setEditing(p)}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setToDelete(p)}
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

      <ParticipantDialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        participant={editing ?? undefined}
        todayKey={todayKey}
      />

      <AlertDialog
        open={toDelete !== null}
        onOpenChange={(open) => {
          if (!open && !pending) setToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this participant?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                {toDelete ? formatFullName(toDelete) : ""}
              </span>{" "}
              and any records linked to them, such as event registrations and attendance,
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
              {pending ? "Deleting..." : "Delete participant"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
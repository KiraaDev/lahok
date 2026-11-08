"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

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
import { FormField, selectClassName } from "@/components/form-field";
import {
  participantSchema,
  type ParticipantData,
  type ParticipantFormInput,
} from "@/lib/validations/participant";
import { SEXES, SEX_LABELS, type ParticipantListItem } from "@/types/participant";
import {
  createParticipant,
  updateParticipant,
} from "@/app/(protected)/admin/participants/actions";

type FormProps = {
  participant?: ParticipantListItem;
  todayKey: string;
  onDone: () => void;
  onCancel: () => void;
};

function ParticipantForm({ participant, todayKey, onDone, onCancel }: FormProps) {
  const isEdit = Boolean(participant);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ParticipantFormInput, unknown, ParticipantData>({
    resolver: zodResolver(participantSchema),
    defaultValues: {
      first_name: participant?.first_name ?? "",
      middle_name: participant?.middle_name ?? "",
      last_name: participant?.last_name ?? "",
      birthdate: participant?.birthdate ?? "",
      sex: participant?.sex,
      zone: participant?.zone ?? "",
      contact_number: participant?.contact_number ?? "",
    },
  });

  function onSubmit(values: ParticipantData) {
    setError(null);
    startTransition(async () => {
      const result = participant
        ? await updateParticipant(participant.id, values)
        : await createParticipant(values);

      if (result.ok) onDone();
      else setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id="first_name" label="First name" error={errors.first_name?.message}>
          <Input
            id="first_name"
            autoComplete="off"
            aria-invalid={!!errors.first_name}
            {...register("first_name")}
          />
        </FormField>
        <FormField id="middle_name" label="Middle name" error={errors.middle_name?.message}>
          <Input id="middle_name" autoComplete="off" {...register("middle_name")} />
        </FormField>
        <FormField id="last_name" label="Last name" error={errors.last_name?.message}>
          <Input
            id="last_name"
            autoComplete="off"
            aria-invalid={!!errors.last_name}
            {...register("last_name")}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="birthdate" label="Birthdate" error={errors.birthdate?.message}>
          <Input
            id="birthdate"
            type="date"
            min="1900-01-01"
            max={todayKey}
            aria-invalid={!!errors.birthdate}
            {...register("birthdate")}
          />
        </FormField>
        <FormField id="sex" label="Sex" error={errors.sex?.message}>
          <select
            id="sex"
            className={selectClassName}
            aria-invalid={!!errors.sex}
            {...register("sex")}
          >
            <option value="">Select</option>
            {SEXES.map((s) => (
              <option key={s} value={s}>
                {SEX_LABELS[s]}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="zone" label="Zone / Purok" error={errors.zone?.message} hint="Optional.">
          <Input id="zone" autoComplete="off" {...register("zone")} />
        </FormField>
        <FormField
          id="contact_number"
          label="Contact number"
          error={errors.contact_number?.message}
          hint="Optional."
        >
          <Input
            id="contact_number"
            type="tel"
            inputMode="tel"
            autoComplete="off"
            {...register("contact_number")}
          />
        </FormField>
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <DialogFooter>
        <Button type="button" variant="ghost" disabled={pending} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending || (isEdit && !isDirty)}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {isEdit
            ? pending
              ? "Saving..."
              : "Save changes"
            : pending
              ? "Adding..."
              : "Add participant"}
        </Button>
      </DialogFooter>
    </form>
  );
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant?: ParticipantListItem;
  todayKey: string;
};

export function ParticipantDialog({ open, onOpenChange, participant, todayKey }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{participant ? "Edit participant" : "Add participant"}</DialogTitle>
          <DialogDescription>
            {participant
              ? "Update this person's details."
              : "Anyone who joins events, of any age."}
          </DialogDescription>
        </DialogHeader>

        <ParticipantForm
          key={participant?.id ?? "new"}
          participant={participant}
          todayKey={todayKey}
          onDone={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
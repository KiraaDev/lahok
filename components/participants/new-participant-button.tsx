"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ParticipantDialog } from "@/components/participants/participant-dialog";

export function NewParticipantButton({ todayKey }: { todayKey: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="size-4" />
        Add participant
      </Button>
      <ParticipantDialog open={open} onOpenChange={setOpen} todayKey={todayKey} />
    </>
  );
}
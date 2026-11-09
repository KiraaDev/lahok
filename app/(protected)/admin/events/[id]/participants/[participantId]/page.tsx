import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatFullName } from "@/lib/participant-utils";
import { Button } from "@/components/ui/button";
import { ParticipantQrCard } from "@/components/participants/participant-qr-card";
import { encodeQrValue } from "@/lib/qr";

type Props = {
  params: Promise<{ id: string; participantId: string }>;
};

export default async function ParticipantDetailPage({ params }: Props) {
  await connection();
  const { id, participantId } = await params;
  const supabase = await createClient();

  const [{ data: participant, error }, { data: event }] = await Promise.all([
    supabase
      .from("participants")
      .select("id, qr_token, first_name, middle_name, last_name, zone")
      .eq("id", participantId)
      .single(),
    supabase.from("events").select("title").eq("id", id).single(),
  ]);

  if (error || !participant || !participant.qr_token) {
    notFound();
  }

  return (
    <main className="mx-auto space-y-6 p-4 py-8">
      <Button variant="ghost" size="sm" className="-ml-2">
        <Link href={`/admin/events/${id}`}>
          <ArrowLeft className="mr-2 size-4" />
          Back to event
        </Link>
      </Button>

      <ParticipantQrCard
        qrValue={encodeQrValue(participant.qr_token)}
        fullName={formatFullName(participant)}
        zone={participant.zone}
        eventName={event?.title}
      />
    </main>
  );
}

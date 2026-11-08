import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { selectClassName } from "@/components/form-field";
import { NewParticipantButton } from "@/components/participants/new-participant-button";
import { ParticipantsTable } from "@/components/participants/participants-table";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getTodayKey } from "@/lib/calendar";
import { getParticipants } from "@/lib/participants";
import {
  AGE_GROUPS,
  AGE_GROUP_LABELS,
  SEXES,
  SEX_LABELS,
} from "@/types/participant";

export const metadata = {
  title: "Participants",
};

type SearchParams = Promise<{
  q?: string | string[];
  sex?: string | string[];
  age?: string | string[];
  page?: string | string[];
}>;

type Current = { q: string; sex: string; age: string; page: number };

const first = (value?: string | string[]) =>
  Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

function buildHref(p: Current) {
  const next = new URLSearchParams();
  if (p.q) next.set("q", p.q);
  if (p.sex) next.set("sex", p.sex);
  if (p.age) next.set("age", p.age);
  if (p.page > 1) next.set("page", String(p.page));
  const qs = next.toString();
  return qs ? `/admin/participants?${qs}` : "/admin/participants";
}

export default async function ParticipantsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();

  const params = await searchParams;
  const q = first(params.q).trim();
  const rawSex = first(params.sex);
  const sex = (SEXES as readonly string[]).includes(rawSex) ? rawSex : "";
  const rawAge = first(params.age);
  const age = (AGE_GROUPS as readonly string[]).includes(rawAge) ? rawAge : "";
  const pageParam = Number.parseInt(first(params.page), 10);
  const page = Number.isFinite(pageParam) && pageParam >= 1 ? pageParam : 1;

  const result = await getParticipants({ q, sex, ageGroup: age, page });
  const todayKey = getTodayKey();
  const hasFilters = Boolean(q || sex || age);

  if (page > 1 && result.items.length === 0) {
    redirect(buildHref({ q, sex, age, page: 1 }));
  }

  const current: Current = { q, sex, age, page: result.page };
  const rangeStart = (result.page - 1) * result.pageSize + 1;
  const rangeEnd = rangeStart + result.items.length - 1;
  const hasPrev = result.page > 1;
  const hasNext = result.page < result.pageCount;

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Participants</h2>
          <p className="text-sm text-muted-foreground">
            People who join your events, of any age.
          </p>
        </div>
        <NewParticipantButton todayKey={todayKey} />
      </div>

      <form action="/admin/participants" className="flex flex-wrap gap-2">
        <div className="relative min-w-52 flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search by name or zone"
            className="pl-9"
            aria-label="Search participants"
          />
        </div>

        <select
          name="age"
          defaultValue={age}
          aria-label="Age group"
          className={cn(selectClassName, "w-auto")}
        >
          <option value="">All ages</option>
          {AGE_GROUPS.map((g) => (
            <option key={g} value={g}>
              {AGE_GROUP_LABELS[g]}
            </option>
          ))}
        </select>

        <select
          name="sex"
          defaultValue={sex}
          aria-label="Sex"
          className={cn(selectClassName, "w-auto")}
        >
          <option value="">All</option>
          {SEXES.map((s) => (
            <option key={s} value={s}>
              {SEX_LABELS[s]}
            </option>
          ))}
        </select>

        <Button type="submit" variant="outline">
          Apply
        </Button>

        {hasFilters && (
          <Link
            href="/admin/participants"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            Clear
          </Link>
        )}
      </form>

      {result.items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
          <Users className="size-6 text-muted-foreground" />
          <p className="font-medium">
            {hasFilters ? "No participants match your search." : "No participants yet."}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {hasFilters
              ? "Try a different search or clear the filters."
              : "Add people so you can register them for events and check them in with QR codes."}
          </p>
          {hasFilters ? (
            <Link
              href="/admin/participants"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Clear filters
            </Link>
          ) : (
            <NewParticipantButton todayKey={todayKey} />
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <ParticipantsTable participants={result.items} todayKey={todayKey} />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing {rangeStart}-{rangeEnd} of {result.total}
            </p>

            <div className="flex items-center gap-2">
              {hasPrev ? (
                <Link
                  href={buildHref({ ...current, page: result.page - 1 })}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "pointer-events-none opacity-50"
                  )}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </span>
              )}

              <span className="text-sm text-muted-foreground">
                Page {result.page} of {result.pageCount}
              </span>

              {hasNext ? (
                <Link
                  href={buildHref({ ...current, page: result.page + 1 })}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "pointer-events-none opacity-50"
                  )}
                >
                  Next
                  <ChevronRight className="size-4" />
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type Props = {
  left: string;
  right: string;
};

const LAHOK_URL = "https://lahok.vercel.app"; 

export function PublicFooter({ left, right }: Props) {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <p>{left}</p>
          <span className="hidden text-border sm:inline">•</span>
          <p>{right}</p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link
            href={LAHOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            Powered by Lahok
            <ArrowUpRight className="size-3" />
          </Link>

          <Link
            href={`${LAHOK_URL}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            Docs
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
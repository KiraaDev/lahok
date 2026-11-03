import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <p className="text-4xl">
        Open-source event management for Sangguniang Kabataan.
      </p>
      <Button variant={'default'}>
        <Link href={'/auth/login'}>Login</Link>
      </Button>
    </div>
  );
}

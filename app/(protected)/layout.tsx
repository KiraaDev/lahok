import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { AuthLoading } from "@/components/auth/auth-loading";

async function ProtectedContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection(); 

  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/auth/login");

  return children;
}

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <ProtectedContent>{children}</ProtectedContent>
    </Suspense>
  );
}
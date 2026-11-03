import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBarangaySettings } from "@/lib/settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "./components/login-form";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getDashboardPath } from "@/lib/auth";

export const metadata = { title: "Log in" };

export default async function LoginPage() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect(getDashboardPath(currentUser.role));
  }

  const settings = await getBarangaySettings();

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <p className="text-2xl font-bold text-primary">Lahok</p>
          <CardTitle className="text-lg">Welcome back</CardTitle>
          <CardDescription>
            Log in to manage events for {settings.barangay_name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}

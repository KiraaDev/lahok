import SignOutButton from "@/components/sign-out-button";
import { Suspense } from "react";

export default function Dashboard() {
  return (
    <div>
      Admin Dashboard
      <Suspense fallback={<div>Loading button...</div>}>
        <SignOutButton />
      </Suspense>
    </div>
  );
}

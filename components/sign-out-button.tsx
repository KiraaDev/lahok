"use client";

import { logout } from "@/app/auth/login/actions";
import { Button } from "@base-ui/react";

export default function SignOutButton() {
  
  return (
    <Button onClick={() => logout()}>
      Logout
    </Button>
  );
}
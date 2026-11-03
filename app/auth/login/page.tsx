import { Suspense } from "react";
import LoginContent from "./components/login-content";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginContent />
    </Suspense>
  );
} 
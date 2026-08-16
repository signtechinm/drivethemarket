import Link from "next/link";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Badge } from "@/components/ui/badge";

export default function ForgotPasswordPage() {
  return (
    <>
      <Badge variant="soft">Account recovery</Badge>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-olive-950">
        Reset your password
      </h1>
      <p className="text-muted-foreground mt-3 text-sm leading-6">
        Enter your account email. Drive the Market will provide reset
        instructions without revealing whether an account exists.
      </p>
      <div className="mt-7">
        <ForgotPasswordForm />
      </div>
      <Link
        className="text-primary mt-6 block text-center text-sm font-semibold hover:underline"
        href="/login"
      >
        Return to sign in
      </Link>
    </>
  );
}

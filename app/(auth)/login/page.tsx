import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { Badge } from "@/components/ui/badge";

interface LoginPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
    invited?: string;
    reset?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  const development = process.env.NODE_ENV === "development";
  const callbackUrl = query.callbackUrl?.startsWith("/")
    ? query.callbackUrl
    : development
      ? "/admin"
      : "/portal";
  const studentLogin = callbackUrl.startsWith("/portal");

  return (
    <>
      <Badge variant="soft">Protected account access</Badge>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-olive-950">
        Welcome to Drive the Market
      </h1>
      <p className="text-muted-foreground mt-3 text-sm leading-6">
        Sign in with the account provided by your institution.
      </p>
      {query.invited === "accepted" || query.reset === "complete" ? (
        <div className="mt-5 rounded-xl border border-olive-200 bg-olive-100 p-3 text-sm text-olive-800">
          Your password is ready. You can sign in now.
        </div>
      ) : null}
      <div className="mt-7">
        <LoginForm
          callbackUrl={callbackUrl}
          defaultEmail={
            development
              ? studentLogin
                ? "student@tradetuter.local"
                : "admin@tradetuter.local"
              : undefined
          }
          defaultPassword={development ? "TradeTuter-Dev-2026!" : undefined}
          initialError={
            query.error ? "Authentication was not completed." : undefined
          }
        />
      </div>
      <div className="mt-5 text-center text-sm">
        <Link
          className="text-primary font-semibold hover:underline"
          href="/forgot-password"
        >
          Forgot your password?
        </Link>
      </div>
      <p className="bg-silver-50 text-muted-foreground mt-8 rounded-xl p-4 text-xs leading-5">
        Student accounts are created by the institution. Contact an
        administrator if you have not received an invitation.
      </p>
    </>
  );
}

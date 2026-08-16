"use client";

import { LoaderCircle, LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface LoginFormProps {
  callbackUrl: string;
  initialError?: string;
  defaultEmail?: string;
  defaultPassword?: string;
}

export function LoginForm({
  callbackUrl,
  initialError,
  defaultEmail,
  defaultPassword,
}: LoginFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(initialError ?? "");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const data = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: data.get("email"),
      password: data.get("password"),
      callbackUrl,
      redirect: false,
    });

    if (!result?.ok) {
      setPending(false);
      setError(
        "The email or password is incorrect, or the account is not active.",
      );
      return;
    }

    router.push(result.url ?? callbackUrl);
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      ) : null}
      <label className="block space-y-2 text-sm font-semibold">
        <span>Email address</span>
        <input
          autoComplete="email"
          className="border-border focus:border-primary focus:ring-ring/30 h-11 w-full rounded-[var(--radius-control)] border bg-white px-3 outline-none focus:ring-2"
          defaultValue={defaultEmail}
          name="email"
          required
          type="email"
        />
      </label>
      <label className="block space-y-2 text-sm font-semibold">
        <span>Password</span>
        <input
          autoComplete="current-password"
          className="border-border focus:border-primary focus:ring-ring/30 h-11 w-full rounded-[var(--radius-control)] border bg-white px-3 outline-none focus:ring-2"
          defaultValue={defaultPassword}
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>
      <Button className="w-full" disabled={pending} size="lg" type="submit">
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <LogIn className="size-4" />
        )}
        {pending ? "Signing in…" : "Sign in securely"}
      </Button>
    </form>
  );
}

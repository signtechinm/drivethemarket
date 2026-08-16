import { Button } from "@/components/ui/button";

interface PasswordFormProps {
  action: (formData: FormData) => Promise<void>;
  error?: string;
  submitLabel: string;
  token: string;
}

export function PasswordForm({
  action,
  error,
  submitLabel,
  token,
}: PasswordFormProps) {
  return (
    <form action={action} className="space-y-5">
      <input name="token" type="hidden" value={token} />
      {error ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          Use at least 12 characters with uppercase, lowercase, a number, and a
          symbol. Both passwords must match.
        </div>
      ) : null}
      <label className="block space-y-2 text-sm font-semibold">
        <span>New password</span>
        <input
          autoComplete="new-password"
          className="border-border focus:border-primary focus:ring-ring/30 h-11 w-full rounded-[var(--radius-control)] border px-3 outline-none focus:ring-2"
          minLength={12}
          name="password"
          required
          type="password"
        />
      </label>
      <label className="block space-y-2 text-sm font-semibold">
        <span>Confirm password</span>
        <input
          autoComplete="new-password"
          className="border-border focus:border-primary focus:ring-ring/30 h-11 w-full rounded-[var(--radius-control)] border px-3 outline-none focus:ring-2"
          minLength={12}
          name="confirmation"
          required
          type="password"
        />
      </label>
      <p className="text-muted-foreground text-xs leading-5">
        Use at least 12 characters with uppercase, lowercase, a number, and a
        symbol.
      </p>
      <Button className="w-full" size="lg" type="submit">
        {submitLabel}
      </Button>
    </form>
  );
}

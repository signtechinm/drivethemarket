import { resetPasswordAction } from "@/app/actions/auth-lifecycle";
import { PasswordForm } from "@/components/auth/password-form";
import { Badge } from "@/components/ui/badge";

interface ResetPasswordPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function ResetPasswordPage({
  params,
  searchParams,
}: ResetPasswordPageProps) {
  const [{ token }, query] = await Promise.all([params, searchParams]);
  return (
    <>
      <Badge variant="soft">Secure password reset</Badge>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-olive-950">
        Choose a new password
      </h1>
      <p className="text-muted-foreground mt-3 text-sm leading-6">
        This reset link can be used only once and expires after 30 minutes.
      </p>
      <div className="mt-7">
        <PasswordForm
          action={resetPasswordAction}
          error={query.error}
          submitLabel="Update password"
          token={token}
        />
      </div>
    </>
  );
}

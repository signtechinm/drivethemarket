import { acceptInvitationAction } from "@/app/actions/auth-lifecycle";
import { PasswordForm } from "@/components/auth/password-form";
import { Badge } from "@/components/ui/badge";

interface AcceptInvitationPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function AcceptInvitationPage({
  params,
  searchParams,
}: AcceptInvitationPageProps) {
  const [{ token }, query] = await Promise.all([params, searchParams]);
  return (
    <>
      <Badge variant="soft">Drive the Market invitation</Badge>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-olive-950">
        Activate your account
      </h1>
      <p className="text-muted-foreground mt-3 text-sm leading-6">
        Set a secure password to accept the institution invitation and activate
        your account.
      </p>
      <div className="mt-7">
        <PasswordForm
          action={acceptInvitationAction}
          error={query.error}
          submitLabel="Activate account"
          token={token}
        />
      </div>
    </>
  );
}

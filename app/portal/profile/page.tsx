import { Mail, UserRound } from "lucide-react";

import { updateStudentAccountAction } from "@/app/actions/portal-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireStudentProfile } from "@/lib/portal/student-scope";

export default async function StudentProfilePage() {
  const { user, profile } = await requireStudentProfile();
  const input =
    "h-10 w-full rounded-[var(--radius-control)] border border-border bg-white px-3 text-sm outline-none focus:border-primary";
  return (
    <main className="mx-auto max-w-3xl px-5 py-9 sm:px-8">
      <Badge variant="soft">Account settings</Badge>
      <h1 className="mt-4 text-3xl font-bold text-olive-950">Your profile</h1>
      <Card className="mt-7">
        <CardHeader>
          <UserRound className="text-primary size-7" />
          <CardTitle>Personal details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-silver-50 mb-5 flex items-center gap-3 rounded-xl p-4">
            <Mail className="text-primary size-4" />
            <div>
              <p className="text-xs font-semibold">{user.email}</p>
              <p className="text-muted-foreground text-xs">
                Email changes require administrator support.
              </p>
            </div>
          </div>
          <form action={updateStudentAccountAction} className="space-y-4">
            <label className="block space-y-1.5 text-xs font-semibold">
              <span>Full name</span>
              <input
                className={input}
                defaultValue={user.name}
                name="name"
                required
              />
            </label>
            <label className="block space-y-1.5 text-xs font-semibold">
              <span>Phone</span>
              <input
                className={input}
                defaultValue={user.phone ?? ""}
                name="phone"
              />
            </label>
            <label className="block space-y-1.5 text-xs font-semibold">
              <span>Address</span>
              <textarea
                className={`${input} min-h-24 py-2`}
                defaultValue={profile.address ?? ""}
                name="address"
              />
            </label>
            <Button className="w-full" type="submit">
              Save settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

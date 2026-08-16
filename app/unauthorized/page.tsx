import { ShieldX } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <main className="bg-silver-50 grid min-h-screen place-items-center p-6">
      <section className="border-border max-w-lg rounded-2xl border bg-white p-10 text-center shadow-[var(--shadow-card)]">
        <ShieldX className="mx-auto size-12 text-red-700" />
        <h1 className="mt-5 text-2xl font-bold text-olive-950">
          Access is not permitted
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          Your account is active, but it does not have permission to open this
          area.
        </p>
        <Link className={`${buttonVariants()} mt-7`} href="/portal">
          Return to your portal
        </Link>
      </section>
    </main>
  );
}

import Link from "next/link";

import { Logo } from "@/components/brand/logo";

export default function AuthenticationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1fr_1.05fr]">
      <section className="flex min-h-screen flex-col px-6 py-7 sm:px-12 lg:px-16">
        <Link aria-label="Drive the Market home" href="/">
          <Logo className="w-44" priority />
        </Link>
        <div className="my-auto w-full max-w-md py-12">{children}</div>
        <p className="text-muted-foreground text-xs">
          Drive the Market · Secure learning access
        </p>
      </section>
      <aside className="relative hidden overflow-hidden bg-[image:var(--gradient-olive)] p-16 text-white lg:flex lg:flex-col lg:justify-end">
        <div className="absolute -top-28 -right-24 size-96 rounded-full border border-white/10" />
        <div className="absolute top-24 right-32 size-52 rounded-full border border-white/10" />
        <div className="relative max-w-xl">
          <p className="text-xs font-bold tracking-[0.2em] text-olive-200 uppercase">
            Structured access
          </p>
          <h2 className="mt-5 text-4xl leading-tight font-bold">
            The right learning materials, at the right time.
          </h2>
          <p className="mt-5 leading-7 text-olive-200">
            Drive the Market protects institutional content and gives every
            active learner a clear path after class.
          </p>
        </div>
      </aside>
    </div>
  );
}

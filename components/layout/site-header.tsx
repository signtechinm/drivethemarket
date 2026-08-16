import { Menu } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";

const navigation = [
  { href: "/about", label: "Institution" },
  { href: "/courses", label: "Courses" },
  { href: "/faculty", label: "Faculty" },
  { href: "/batches", label: "Batches" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="border-border/80 bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-5 sm:px-8">
        <Link aria-label="Drive the Market home" href="/">
          <Logo priority />
        </Link>
        <nav
          aria-label="Primary navigation"
          className="ml-auto hidden gap-5 lg:flex"
        >
          {navigation.map((item) => (
            <Link
              className="text-muted-foreground hover:text-primary text-sm font-medium transition"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          className={buttonVariants({ variant: "outline", size: "sm" })}
          href="/login?callbackUrl=/portal"
        >
          Student login
        </Link>
        <details className="relative lg:hidden">
          <summary
            className="border-border grid size-10 cursor-pointer list-none place-items-center rounded-lg border"
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </summary>
          <nav className="border-border absolute top-12 right-0 w-56 space-y-1 rounded-xl border bg-white p-2 shadow-xl">
            {navigation.map((item) => (
              <Link
                className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-olive-50"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}

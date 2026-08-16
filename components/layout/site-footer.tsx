import Link from "next/link";

import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="bg-olive-950 text-olive-200">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto_auto]">
        <div>
          <Logo className="w-40 brightness-125" />
          <p className="mt-4 max-w-sm text-sm leading-6">
            Structured trading education before, during, and after every live
            class.
          </p>
        </div>
        <div>
          <p className="font-semibold text-white">Explore</p>
          <div className="mt-3 space-y-2 text-sm">
            <Link className="block hover:text-white" href="/courses">
              Courses
            </Link>
            <Link className="block hover:text-white" href="/batches">
              Upcoming batches
            </Link>
            <Link className="block hover:text-white" href="/contact">
              Contact
            </Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-white">Legal</p>
          <div className="mt-3 space-y-2 text-sm">
            <Link className="block hover:text-white" href="/privacy">
              Privacy
            </Link>
            <Link className="block hover:text-white" href="/terms">
              Terms
            </Link>
            <Link
              className="block hover:text-white"
              href="/login?callbackUrl=/portal"
            >
              Student login
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs">
        © {new Date().getFullYear()} Drive the Market. Education only; no
        guaranteed financial outcomes.
      </div>
    </footer>
  );
}

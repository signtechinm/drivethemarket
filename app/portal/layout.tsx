import { LogoutButton } from "@/components/auth/logout-button";
import { Logo } from "@/components/brand/logo";
import { requireActiveUser } from "@/lib/auth/session";
import { Bell, BookOpen, LayoutDashboard, UserRound } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireActiveUser("/portal");
  return (
    <div className="bg-silver-50 min-h-screen">
      <header className="border-border sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Logo className="w-40" priority />
          <nav
            className="hidden items-center gap-1 sm:flex"
            aria-label="Student portal"
          >
            <Link
              className="hover:bg-silver-100 rounded-lg px-3 py-2 text-sm font-semibold"
              href="/portal/notifications"
            >
              Notifications
            </Link>
            <Link
              className="hover:bg-silver-100 rounded-lg px-3 py-2 text-sm font-semibold"
              href="/portal"
            >
              Dashboard
            </Link>
            <Link
              className="hover:bg-silver-100 rounded-lg px-3 py-2 text-sm font-semibold"
              href="/portal/profile"
            >
              Profile
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold sm:inline">
              {user.name}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      {children}
      <nav
        className="border-border fixed right-0 bottom-0 left-0 z-30 grid grid-cols-4 border-t bg-white p-2 sm:hidden"
        aria-label="Mobile student portal"
      >
        <Link
          className="flex flex-col items-center gap-1 p-2 text-xs font-semibold"
          href="/portal/notifications"
        >
          <Bell className="size-4" />
          Updates
        </Link>
        <Link
          className="flex flex-col items-center gap-1 p-2 text-xs font-semibold"
          href="/portal"
        >
          <LayoutDashboard className="size-4" />
          Home
        </Link>
        <Link
          className="flex flex-col items-center gap-1 p-2 text-xs font-semibold"
          href="/portal"
        >
          <BookOpen className="size-4" />
          Learning
        </Link>
        <Link
          className="flex flex-col items-center gap-1 p-2 text-xs font-semibold"
          href="/portal/profile"
        >
          <UserRound className="size-4" />
          Profile
        </Link>
      </nav>
    </div>
  );
}

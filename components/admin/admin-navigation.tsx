"use client";

import {
  BarChart3,
  BookOpenCheck,
  CalendarRange,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  Megaphone,
  PanelsTopLeft,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const icons = {
  overview: LayoutDashboard,
  reports: BarChart3,
  students: GraduationCap,
  courses: BookOpenCheck,
  batches: CalendarRange,
  materials: LibraryBig,
  communications: Megaphone,
  website: PanelsTopLeft,
  users: Users,
  roles: ShieldCheck,
};

export type AdminNavigationGroup = {
  label: string;
  items: Array<{
    href: string;
    label: string;
    icon: keyof typeof icons;
  }>;
};

function isActivePath(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNavigation({
  groups,
  mobile = false,
}: {
  groups: AdminNavigationGroup[];
  mobile?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav
      className={mobile ? "space-y-4" : "space-y-4"}
      aria-label={mobile ? "Mobile administration" : "Administration"}
    >
      {groups.map((group, groupIndex) => (
        <section
          className={
            mobile
              ? "rounded-xl border border-olive-100 bg-olive-50/45 p-2"
              : "overflow-hidden rounded-2xl border border-white/10 bg-black/15 p-2 shadow-sm"
          }
          key={group.label}
          aria-labelledby={`admin-nav-group-${groupIndex}`}
        >
          <div
            className={
              mobile
                ? "mb-2 flex items-center gap-2 border-b border-olive-100 px-2 pb-2"
                : "mb-2 flex items-center gap-2 border-b border-white/15 bg-white/5 px-2 py-2"
            }
          >
            <span
              className={
                mobile
                  ? "bg-primary size-1.5 rounded-full"
                  : "bg-accent size-1.5 rounded-full"
              }
              aria-hidden="true"
            />
            <h2
              className={
                mobile
                  ? "text-[0.67rem] font-extrabold tracking-[0.14em] text-olive-600 uppercase"
                  : "text-[0.67rem] font-extrabold tracking-[0.15em] text-white uppercase"
              }
              id={`admin-nav-group-${groupIndex}`}
            >
              {group.label}
            </h2>
          </div>
          <div className="space-y-0.5">
            {group.items.map(({ href, icon, label }) => {
              const Icon = icons[icon];
              const active = isActivePath(pathname, href);

              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={
                    mobile
                      ? `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                          active
                            ? "bg-olive-100 text-olive-950"
                            : "text-olive-700 hover:bg-olive-50 hover:text-olive-950"
                        }`
                      : `group flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm font-semibold transition ${
                          active
                            ? "bg-white text-olive-950 shadow-sm ring-1 ring-white/20"
                            : "text-olive-200 hover:bg-white/10 hover:text-white"
                        }`
                  }
                  href={href}
                  key={href}
                >
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-lg transition ${
                      active
                        ? "text-primary bg-olive-100"
                        : mobile
                          ? "bg-olive-50 text-olive-700"
                          : "bg-white/5 text-olive-300 group-hover:bg-white/10 group-hover:text-white"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 leading-tight">{label}</span>
                  {active ? (
                    <span
                      className="bg-primary ml-auto size-1.5 shrink-0 rounded-full"
                      aria-hidden="true"
                    />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}

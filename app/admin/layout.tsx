import { Menu } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import {
  AdminNavigation,
  type AdminNavigationGroup,
} from "@/components/admin/admin-navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { Logo } from "@/components/brand/logo";
import { permissions } from "@/lib/auth/constants";
import { hasPermission } from "@/lib/auth/policy";
import { requireActiveUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, user } = await requireActiveUser("/admin");
  if (
    session.user.roleKeys.length === 1 &&
    session.user.roleKeys.includes("student")
  )
    redirect("/unauthorized");

  const navigationGroups: Array<{
    label: string;
    items: Array<AdminNavigationGroup["items"][number] & { visible: boolean }>;
  }> = [
    {
      label: "Dashboard",
      items: [
        { href: "/admin", label: "Overview", icon: "overview", visible: true },
        {
          href: "/admin/reports",
          label: "Reports & insights",
          icon: "reports",
          visible: hasPermission(
            session.user.permissionKeys,
            permissions.reportsView,
          ),
        },
      ],
    },
    {
      label: "Academic management",
      items: [
        {
          href: "/admin/students",
          label: "Students & enrolments",
          icon: "students",
          visible: hasPermission(
            session.user.permissionKeys,
            permissions.studentsManage,
          ),
        },
        {
          href: "/admin/courses",
          label: "Courses & syllabuses",
          icon: "courses",
          visible: hasPermission(
            session.user.permissionKeys,
            permissions.coursesManage,
          ),
        },
        {
          href: "/admin/batches",
          label: "Batches & schedules",
          icon: "batches",
          visible: hasPermission(
            session.user.permissionKeys,
            permissions.batchesManage,
          ),
        },
        {
          href: "/admin/materials",
          label: "Materials & recordings",
          icon: "materials",
          visible: [
            permissions.materialsManage,
            permissions.materialsApprove,
            permissions.materialsRelease,
          ].some((permission) =>
            hasPermission(session.user.permissionKeys, permission),
          ),
        },
      ],
    },
    {
      label: "Content & engagement",
      items: [
        {
          href: "/admin/communications",
          label: "Communications",
          icon: "communications",
          visible: hasPermission(
            session.user.permissionKeys,
            permissions.communicationsManage,
          ),
        },
        {
          href: "/admin/website",
          label: "Website & enquiries",
          icon: "website",
          visible: hasPermission(
            session.user.permissionKeys,
            permissions.websiteManage,
          ),
        },
      ],
    },
    {
      label: "Access & settings",
      items: [
        {
          href: "/admin/users",
          label: "Users",
          icon: "users",
          visible: hasPermission(
            session.user.permissionKeys,
            permissions.usersManage,
          ),
        },
        {
          href: "/admin/roles",
          label: "Roles & permissions",
          icon: "roles",
          visible: hasPermission(
            session.user.permissionKeys,
            permissions.rolesManage,
          ),
        },
      ],
    },
  ];
  const navigation = navigationGroups
    .map((group) => ({
      label: group.label,
      items: group.items
        .filter((item) => item.visible)
        .map((item) => ({
          href: item.href,
          label: item.label,
          icon: item.icon,
        })),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="bg-silver-50 min-h-screen lg:grid lg:grid-cols-[288px_1fr]">
      <aside className="hidden h-screen bg-olive-950 p-4 text-white lg:sticky lg:top-0 lg:flex lg:flex-col">
        <Link
          className="flex min-h-20 items-center border-b border-white/15 px-2 pb-4"
          href="/admin"
        >
          <div className="min-w-0">
            <Logo compact className="brightness-150" priority />
            <p className="mt-1 pl-[3.15rem] text-[0.58rem] font-bold tracking-[0.22em] text-olive-300 uppercase">
              Admin console
            </p>
          </div>
        </Link>
        <div className="mt-4 min-h-0 flex-1 [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden">
          <Suspense fallback={null}>
            <AdminNavigation groups={navigation} />
          </Suspense>
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-sm font-bold text-olive-950">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-olive-300">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="border-border sticky top-0 z-30 flex h-18 items-center justify-between border-b bg-white/95 px-5 backdrop-blur sm:px-8">
          <div>
            <p className="text-primary text-xs font-bold tracking-[0.14em] uppercase">
              Administration
            </p>
            <p className="text-sm font-semibold text-olive-950">
              Drive the Market
            </p>
          </div>
          <div className="flex items-center gap-2">
            <details className="relative lg:hidden">
              <summary className="border-border grid min-h-10 cursor-pointer list-none place-items-center rounded-lg border px-3 text-sm font-semibold">
                <Menu className="size-4" aria-hidden="true" />
                <span className="sr-only">Open administration navigation</span>
              </summary>
              <div className="border-border absolute top-12 right-0 z-40 max-h-[75vh] w-80 overflow-y-auto rounded-2xl border bg-white p-3 shadow-xl">
                <Suspense fallback={null}>
                  <AdminNavigation groups={navigation} mobile />
                </Suspense>
              </div>
            </details>
            <LogoutButton />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

import { ArrowLeft, Inbox } from "lucide-react";
import Link from "next/link";

import { updateEnquiryStatusAction } from "@/app/actions/website-management";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { permissions } from "@/lib/auth/constants";
import { requirePermission } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db/client";

interface EnquiryPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function WebsiteEnquiriesPage({
  searchParams,
}: EnquiryPageProps) {
  await requirePermission(permissions.websiteManage);
  const { status } = await searchParams;
  const statuses = ["NEW", "CONTACTED", "CLOSED", "SPAM"];
  const enquiries = await getDatabase().websiteEnquiry.findMany({
    where: statuses.includes(status ?? "") ? { status } : undefined,
    include: { course: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return (
    <main className="mx-auto max-w-6xl p-5 sm:p-8">
      <Link
        className={buttonVariants({ variant: "ghost", size: "sm" })}
        href="/admin/website"
      >
        <ArrowLeft className="size-4" />
        Website CMS
      </Link>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="soft">Prospective students</Badge>
          <h1 className="mt-3 text-3xl font-bold text-olive-950">
            Website enquiries
          </h1>
        </div>
        <form>
          <select
            className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
            defaultValue={status ?? ""}
            name="status"
          >
            <option value="">All statuses</option>
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <Button className="ml-2" type="submit">
            Filter
          </Button>
        </form>
      </div>
      <div className="mt-7 space-y-3">
        {enquiries.map((enquiry) => (
          <Card key={enquiry.id}>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-bold">{enquiry.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {enquiry.email} · {enquiry.phone ?? "No phone"} ·{" "}
                    {enquiry.course?.title ?? "General enquiry"}
                  </p>
                </div>
                <Badge variant={enquiry.status === "NEW" ? "soft" : "neutral"}>
                  {enquiry.status}
                </Badge>
              </div>
              <p className="bg-silver-50 mt-4 rounded-xl p-4 text-sm leading-6">
                {enquiry.message}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <time className="text-muted-foreground text-xs">
                  {enquiry.createdAt.toLocaleString("en-IN")}
                </time>
                <form action={updateEnquiryStatusAction} className="flex gap-2">
                  <input name="enquiryId" type="hidden" value={enquiry.id} />
                  <select
                    className="border-border h-9 rounded-lg border bg-white px-2 text-xs"
                    defaultValue={enquiry.status}
                    name="status"
                  >
                    {statuses.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <Button size="sm" type="submit" variant="outline">
                    Update
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
        {!enquiries.length ? (
          <Card>
            <CardHeader className="items-center text-center">
              <Inbox className="text-primary size-8" />
              <CardTitle>No enquiries found</CardTitle>
            </CardHeader>
          </Card>
        ) : null}
      </div>
    </main>
  );
}

import { AlertTriangle, BellRing, MailCheck, Megaphone } from "lucide-react";

import { AnnouncementForm } from "@/components/communications/announcement-form";
import {
  DeliveryControls,
  PublishAnnouncementControl,
} from "@/components/communications/communication-controls";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { permissions } from "@/lib/auth/constants";
import { requirePermission } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db/client";

export default async function CommunicationsPage() {
  await requirePermission(permissions.communicationsManage);
  const database = getDatabase();
  const [announcements, batches, pending, failed, recentFailures] =
    await Promise.all([
      database.announcement.findMany({
        include: { batch: true, author: true },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      database.batch.findMany({
        where: { status: { in: ["ENROLLING", "ACTIVE"] } },
        orderBy: { startsAt: "desc" },
      }),
      database.notification.count({
        where: { channel: "EMAIL", status: "PENDING" },
      }),
      database.notification.count({
        where: { channel: "EMAIL", status: "FAILED" },
      }),
      database.notification.findMany({
        where: { channel: "EMAIL", status: "FAILED" },
        include: { user: true },
        orderBy: { lastAttemptAt: "desc" },
        take: 8,
      }),
    ]);
  return (
    <main className="mx-auto max-w-7xl p-5 sm:p-8">
      <Badge variant="soft">Institution communications</Badge>
      <h1 className="mt-4 text-3xl font-bold text-olive-950">
        Announcements and delivery
      </h1>
      <p className="text-muted-foreground mt-2">
        Target the correct students and monitor the durable email outbox.
      </p>
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <Metric
          icon={Megaphone}
          label="Announcements"
          value={announcements.length}
        />
        <Metric icon={MailCheck} label="Pending emails" value={pending} />
        <Metric icon={AlertTriangle} label="Failed emails" value={failed} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Announcement history</CardTitle>
              <CardDescription>
                Drafts remain private until explicitly published.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {announcements.map((announcement) => (
                <div
                  className="border-border rounded-xl border p-4"
                  key={announcement.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{announcement.title}</p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {announcement.batch?.name ?? "All active students"} ·{" "}
                        {announcement.author.name}
                      </p>
                    </div>
                    <Badge
                      variant={announcement.publishedAt ? "soft" : "neutral"}
                    >
                      {announcement.publishedAt ? "PUBLISHED" : "DRAFT"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-3 line-clamp-2 text-sm">
                    {announcement.body}
                  </p>
                  {!announcement.publishedAt ? (
                    <div className="mt-3">
                      <PublishAnnouncementControl
                        announcementId={announcement.id}
                      />
                    </div>
                  ) : (
                    <p className="text-muted-foreground mt-3 text-xs">
                      Published{" "}
                      {announcement.publishedAt.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              ))}
              {!announcements.length ? (
                <p className="text-muted-foreground p-6 text-center text-sm">
                  No announcements yet.
                </p>
              ) : null}
            </CardContent>
          </Card>
          {recentFailures.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent delivery failures</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentFailures.map((item) => (
                  <div
                    className="rounded-xl bg-red-50 p-3 text-xs text-red-800"
                    key={item.id}
                  >
                    <strong>{item.subject}</strong>
                    <p className="mt-1">
                      Recipient: {item.user.email} · Attempt {item.attemptCount}
                      /5
                    </p>
                    <p className="mt-1">{item.lastError}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
        <aside className="space-y-5">
          <Card>
            <CardHeader>
              <BellRing className="text-primary size-6" />
              <CardTitle>Create announcement</CardTitle>
              <CardDescription>
                Save, review, and publish as separate steps.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnnouncementForm
                batches={batches.map((batch) => ({
                  id: batch.id,
                  label: `${batch.code} · ${batch.name}`,
                }))}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Delivery operations</CardTitle>
              <CardDescription>
                Retry pending/failed email and queue access-expiry warnings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeliveryControls />
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Megaphone;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className="text-primary grid size-11 place-items-center rounded-xl bg-olive-100">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="text-2xl font-bold text-olive-950">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

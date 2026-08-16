import { Bell, CheckCircle2, Megaphone, Settings2 } from "lucide-react";

import { updateNotificationPreferencesAction } from "@/app/actions/communications";
import { markNotificationReadAction } from "@/app/actions/portal-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notificationEvents } from "@/lib/communications/events";
import { requireStudentProfile } from "@/lib/portal/student-scope";
import { getDatabase } from "@/lib/db/client";

export default async function NotificationCentrePage() {
  const { user, profile } = await requireStudentProfile();
  const now = new Date();
  const database = getDatabase();
  const [notifications, preferences, enrolments] = await Promise.all([
    database.notification.findMany({
      where: { userId: user.id, channel: "IN_APP" },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    database.notificationPreference.findMany({ where: { userId: user.id } }),
    database.enrolment.findMany({
      where: {
        studentId: profile.id,
        status: "ACTIVE",
        OR: [{ accessStartsAt: null }, { accessStartsAt: { lte: now } }],
        AND: [{ OR: [{ accessEndsAt: null }, { accessEndsAt: { gte: now } }] }],
      },
      select: { batchId: true },
    }),
  ]);
  const batchIds = enrolments.map((item) => item.batchId);
  const announcements = await database.announcement.findMany({
    where: {
      publishedAt: { not: null, lte: now },
      OR: [{ batchId: null }, { batchId: { in: batchIds } }],
      AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] }],
    },
    include: { batch: true },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });
  const preferenceMap = new Map(
    preferences.map((item) => [item.eventKey, item]),
  );
  return (
    <main className="mx-auto max-w-6xl px-5 py-9 sm:px-8">
      <Badge variant="soft">Notification centre</Badge>
      <h1 className="mt-4 text-3xl font-bold text-olive-950">
        Updates and announcements
      </h1>
      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <Megaphone className="text-primary size-6" />
              <CardTitle>Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {announcements.map((item) => (
                <article
                  className="border-border rounded-xl border p-4"
                  key={item.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold">{item.title}</p>
                    <Badge variant="neutral">
                      {item.batch?.code ?? "INSTITUTION"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {item.body}
                  </p>
                  <time className="text-muted-foreground mt-3 block text-xs">
                    {item.publishedAt?.toLocaleString("en-IN")}
                  </time>
                </article>
              ))}
              {!announcements.length ? (
                <p className="text-muted-foreground text-sm">
                  No current announcements.
                </p>
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Bell className="text-primary size-6" />
              <CardTitle>All notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((notice) => (
                <div
                  className={`rounded-xl p-4 ${notice.status === "READ" ? "bg-silver-50" : "bg-olive-50"}`}
                  key={notice.id}
                >
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className="font-semibold">{notice.subject}</p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {notice.body}
                      </p>
                      <time className="text-muted-foreground mt-2 block text-xs">
                        {notice.createdAt.toLocaleString("en-IN")}
                      </time>
                    </div>
                    {notice.status === "READ" ? (
                      <CheckCircle2 className="size-4 text-olive-600" />
                    ) : (
                      <form action={markNotificationReadAction}>
                        <input
                          name="notificationId"
                          type="hidden"
                          value={notice.id}
                        />
                        <Button size="sm" type="submit" variant="ghost">
                          Mark read
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
              {!notifications.length ? (
                <p className="text-muted-foreground text-sm">
                  No notifications yet.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
        <aside>
          <Card className="sticky top-24">
            <CardHeader>
              <Settings2 className="text-primary size-6" />
              <CardTitle>Notification preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action={updateNotificationPreferencesAction}
                className="space-y-4"
              >
                {notificationEvents.map((event) => {
                  const preference = preferenceMap.get(event.key);
                  return (
                    <div
                      className="border-border rounded-xl border p-3"
                      key={event.key}
                    >
                      <p className="text-sm font-semibold">{event.label}</p>
                      {event.mandatory ? (
                        <p className="text-muted-foreground mt-1 text-xs">
                          Required account or access message
                        </p>
                      ) : (
                        <div className="mt-2 flex gap-4 text-xs">
                          <label className="flex items-center gap-2">
                            <input
                              defaultChecked={preference?.inAppEnabled ?? true}
                              name={`${event.key}:in_app`}
                              type="checkbox"
                            />
                            In app
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              defaultChecked={preference?.emailEnabled ?? true}
                              name={`${event.key}:email`}
                              type="checkbox"
                            />
                            Email
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
                <Button className="w-full" type="submit">
                  Save preferences
                </Button>
              </form>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}

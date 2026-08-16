import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnquiryForm } from "@/components/website/enquiry-form";
import { getDatabase } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Drive the Market about courses, batches, and student learning.",
};

export default async function ContactPage() {
  const courses = await getDatabase().course.findMany({
    where: { active: true },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
  return (
    <main className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[.7fr_1.3fr]">
      <div>
        <Badge variant="soft">Contact Drive the Market</Badge>
        <h1 className="mt-5 text-4xl font-bold text-olive-950">
          Let’s discuss your learning goals.
        </h1>
        <p className="text-muted-foreground mt-4 leading-7">
          Tell us which course or batch interests you. The institution will
          respond with current schedules and admission details.
        </p>
        <div className="mt-8 space-y-3">
          <p className="flex items-center gap-3 text-sm">
            <Mail className="text-primary size-5" /> Response handled by the
            admissions team
          </p>
          <p className="flex items-center gap-3 text-sm">
            <MessageCircle className="text-primary size-5" /> No
            financial-return promises or investment advice
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Course enquiry</CardTitle>
        </CardHeader>
        <CardContent>
          <EnquiryForm courses={courses} />
        </CardContent>
      </Card>
    </main>
  );
}

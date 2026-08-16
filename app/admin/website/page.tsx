import { ExternalLink, FilePenLine } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageEditorForm } from "@/components/website/page-editor-form";
import { permissions } from "@/lib/auth/constants";
import { requirePermission } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db/client";
import { websiteFallbacks, type WebsiteContent } from "@/lib/website/content";

export default async function WebsiteManagementPage() {
  await requirePermission(permissions.websiteManage);
  const pages = await getDatabase().websitePage.findMany({
    orderBy: { slug: "asc" },
  });
  const pageMap = new Map(pages.map((page) => [page.slug, page]));
  return (
    <main className="mx-auto max-w-7xl p-5 sm:p-8">
      <Badge variant="soft">Public website CMS</Badge>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-olive-950">Website content</h1>
          <p className="text-muted-foreground mt-2">
            Edit common content blocks and explicitly publish approved versions.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            className={buttonVariants({ variant: "outline" })}
            href="/admin/website/enquiries"
          >
            Manage enquiries
          </Link>
          <a
            className={buttonVariants()}
            href="/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLink className="size-4" />
            View website
          </a>
        </div>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {Object.entries(websiteFallbacks).map(([slug, fallback]) => {
          const page = pageMap.get(slug);
          const content =
            (page?.content as unknown as WebsiteContent | undefined) ??
            fallback;
          return (
            <Card key={slug}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FilePenLine className="text-primary size-5" />
                    <CardTitle className="capitalize">{slug}</CardTitle>
                  </div>
                  <Badge variant={page?.published ? "soft" : "neutral"}>
                    {page?.published ? "PUBLISHED" : "FALLBACK"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <PageEditorForm
                  content={content}
                  published={page?.published ?? false}
                  slug={slug}
                  title={page?.title ?? fallback.eyebrow}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}

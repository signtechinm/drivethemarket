import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicContentPage } from "@/components/website/public-page";
import {
  getPublishedWebsiteContent,
  websiteFallbacks,
} from "@/lib/website/content";

interface CmsPublicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CmsPublicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = websiteFallbacks[slug];
  return content ? { title: content.eyebrow, description: content.intro } : {};
}

export default async function CmsPublicPage({ params }: CmsPublicPageProps) {
  const { slug } = await params;
  if (!websiteFallbacks[slug]) notFound();
  const content = await getPublishedWebsiteContent(slug);
  if (!content) notFound();
  return <PublicContentPage content={content} />;
}

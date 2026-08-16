import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WebsiteContent } from "@/lib/website/content";

export function PublicContentPage({ content }: { content: WebsiteContent }) {
  return (
    <main>
      <section className="border-border border-b bg-[image:var(--gradient-silver)]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Badge variant="soft">{content.eyebrow}</Badge>
          <h1 className="mt-6 max-w-4xl text-4xl leading-tight font-bold tracking-tight text-olive-950 sm:text-5xl">
            {content.heading}
          </h1>
          <p className="text-muted-foreground mt-6 max-w-3xl text-lg leading-8">
            {content.intro}
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-3">
        {content.sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-olive-950">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-7">
              {section.body}
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}

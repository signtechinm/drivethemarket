"use client";

import { useActionState } from "react";

import {
  saveWebsitePageAction,
  type WebsiteActionState,
} from "@/app/actions/website-management";
import { Button } from "@/components/ui/button";
import type { WebsiteContent } from "@/lib/website/content";

const initialState: WebsiteActionState = { success: false, message: "" };

export function PageEditorForm({
  slug,
  title,
  content,
  published,
}: {
  slug: string;
  title: string;
  content: WebsiteContent;
  published: boolean;
}) {
  const [state, action, pending] = useActionState(
    saveWebsitePageAction,
    initialState,
  );
  const input =
    "h-10 w-full rounded-[var(--radius-control)] border border-border bg-white px-3 text-sm outline-none focus:border-primary";
  return (
    <form action={action} className="space-y-4">
      <input name="slug" type="hidden" value={slug} />
      {state.message ? (
        <p
          className={`rounded-xl p-3 text-sm ${state.success ? "bg-olive-100 text-olive-800" : "bg-red-50 text-red-800"}`}
        >
          {state.message}
        </p>
      ) : null}
      <label className="block space-y-1 text-xs font-semibold">
        <span>CMS title</span>
        <input className={input} defaultValue={title} name="title" required />
      </label>
      <label className="block space-y-1 text-xs font-semibold">
        <span>Eyebrow</span>
        <input
          className={input}
          defaultValue={content.eyebrow}
          name="eyebrow"
          required
        />
      </label>
      <label className="block space-y-1 text-xs font-semibold">
        <span>Page heading</span>
        <textarea
          className={`${input} min-h-20 py-2`}
          defaultValue={content.heading}
          name="heading"
          required
        />
      </label>
      <label className="block space-y-1 text-xs font-semibold">
        <span>Introduction</span>
        <textarea
          className={`${input} min-h-24 py-2`}
          defaultValue={content.intro}
          name="intro"
          required
        />
      </label>
      <label className="block space-y-1 text-xs font-semibold">
        <span>Sections — one per line: Title | Body</span>
        <textarea
          className={`${input} min-h-40 py-2 font-mono text-xs`}
          defaultValue={content.sections
            .map((section) => `${section.title} | ${section.body}`)
            .join("\n")}
          name="sections"
          required
        />
      </label>
      <label className="flex items-center gap-2 text-xs font-semibold">
        <input defaultChecked={published} name="publish" type="checkbox" />
        Publish this version
      </label>
      <Button className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Save page"}
      </Button>
    </form>
  );
}

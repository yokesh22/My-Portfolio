import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Blog | Yokesh",
  description: "Notes on backend engineering, AWS, and system design.",
};

export default function BlogPage() {
  return (
    <div className="bg-content-bg">
      <div className="mx-auto max-w-4xl px-6 py-28">
        <SectionHeading
          eyebrow="// ~/blog"
          title="Writing"
          description="Notes on backend engineering, AWS, and system design."
          className="mb-12"
        />
        <div className="rounded-lg border border-dashed border-content-border bg-content-surface/40 p-12 text-center">
          <p className="font-mono text-sm text-content-muted">
            <span className="text-terminal-green">$</span> posts --status
            published
          </p>
          <p className="mt-2 font-mono text-sm text-content-muted">
            &gt; no posts yet. The CMS (Prisma + TipTap) ships next.
          </p>
        </div>
      </div>
    </div>
  );
}

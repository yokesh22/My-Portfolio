import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";

// Will be protected by NextAuth in the backend pass.
export default function AdminPage() {
  return (
    <div className="bg-content-bg">
      <div className="mx-auto max-w-4xl px-6 py-28">
        <SectionHeading
          eyebrow="// restricted"
          title="Admin dashboard"
          description="Authentication (NextAuth) and post management land in the backend pass."
          className="mb-10"
        />
        <Link
          href="/admin/editor"
          className="inline-flex items-center gap-2 rounded border border-content-border px-4 py-2 font-mono text-sm text-content-muted transition-colors hover:border-content-accent hover:text-content-text"
        >
          &gt; open editor
        </Link>
      </div>
    </div>
  );
}

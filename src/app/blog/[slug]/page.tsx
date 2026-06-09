import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Placeholder until posts are sourced from the database.
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="bg-content-bg">
      <div className="mx-auto max-w-3xl px-6 py-28">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 font-mono text-sm text-terminal-muted transition-colors hover:text-terminal-green"
        >
          <ArrowLeft size={14} /> ~/blog
        </Link>
        <h1 className="font-display text-3xl font-bold text-content-text">
          {slug}
        </h1>
        <p className="mt-4 font-mono text-sm text-content-muted">
          &gt; this post will render TipTap content once the CMS is wired.
        </p>
      </div>
    </div>
  );
}

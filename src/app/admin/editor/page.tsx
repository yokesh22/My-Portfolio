import { SectionHeading } from "@/components/ui/section-heading";

// TipTap editor mounts here in the backend pass.
export default function EditorPage() {
  return (
    <div className="bg-content-bg">
      <div className="mx-auto max-w-4xl px-6 py-28">
        <SectionHeading
          eyebrow="// draft"
          title="Post editor"
          description="A TipTap rich-text editor with code-block highlighting will render here."
          className="mb-10"
        />
        <div className="rounded-lg border border-dashed border-content-border bg-content-surface/40 p-12 text-center font-mono text-sm text-content-muted">
          &gt; editor placeholder
        </div>
      </div>
    </div>
  );
}

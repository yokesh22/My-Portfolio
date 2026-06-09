import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  /** Small monospace label shown above the title, e.g. "// 01". */
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-terminal-green">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl font-bold text-content-text sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl font-sans text-sm text-content-muted sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

import Link from "next/link";

const socials = [
  { label: "github", href: "https://github.com" },
  { label: "linkedin", href: "https://linkedin.com" },
  { label: "email", href: "mailto:yokesh.ssmy2210@gmail.com" },
];

export function Footer() {
  return (
    <footer className="border-t border-terminal-border bg-terminal-bg">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <p className="font-mono text-xs text-terminal-muted">
          <span className="text-terminal-green">$</span> echo &quot;built by
          Yokesh&quot; &mdash; {new Date().getFullYear()}
        </p>

        <div className="flex items-center gap-5 font-mono text-xs">
          {socials.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-terminal-muted transition-colors hover:text-terminal-green"
            >
              ~/{label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

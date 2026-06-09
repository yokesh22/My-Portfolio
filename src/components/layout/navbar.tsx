"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/types";

const links: NavLink[] = [
  { label: "Home", command: "~/home", href: "/" },
  { label: "Blog", command: "~/blog", href: "/blog" },
  { label: "Contact", command: "~/contact", href: "/contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-terminal-border bg-terminal-bg/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-mono text-lg font-semibold text-terminal-green transition-opacity hover:opacity-80"
        >
          &lt;yokesh /&gt;
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <li key={link.href} className="relative">
                <Link
                  href={link.href}
                  className={cn(
                    "font-mono text-sm transition-colors",
                    active
                      ? "text-terminal-green"
                      : "text-terminal-muted hover:text-terminal-text",
                  )}
                >
                  {link.command}
                </Link>
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1.5 left-0 h-px w-full bg-terminal-green shadow-[0_0_8px_rgba(74,222,128,0.8)]"
                  />
                )}
              </li>
            );
          })}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="text-terminal-text md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile slide-in panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="absolute right-0 top-16 w-56 border-l border-b border-terminal-border bg-terminal-surface/95 backdrop-blur-md md:hidden"
          >
            <ul className="flex flex-col p-4">
              {links.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "block rounded px-3 py-2 font-mono text-sm transition-colors",
                        active
                          ? "bg-terminal-bg text-terminal-green"
                          : "text-terminal-muted hover:text-terminal-text",
                      )}
                    >
                      {link.command}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

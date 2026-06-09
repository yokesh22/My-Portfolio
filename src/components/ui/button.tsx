import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "terminal";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-terminal-green/10 text-terminal-green border border-terminal-green/40 hover:bg-terminal-green/20 hover:shadow-[0_0_16px_rgba(74,222,128,0.35)]",
  ghost:
    "text-terminal-muted border border-terminal-border hover:text-terminal-text hover:border-terminal-muted",
  terminal:
    "bg-terminal-surface text-terminal-text border border-terminal-border hover:border-terminal-green/50",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 font-mono text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-terminal-green/50 disabled:cursor-not-allowed disabled:opacity-50",
          variants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

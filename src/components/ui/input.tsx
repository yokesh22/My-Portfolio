import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-md border border-content-border bg-content-surface px-4 py-2.5 font-sans text-sm text-content-text placeholder:text-content-muted transition-colors focus:border-content-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-content-accent/40",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-md border border-content-border bg-content-surface px-4 py-2.5 font-sans text-sm text-content-text placeholder:text-content-muted transition-colors focus:border-content-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-content-accent/40",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

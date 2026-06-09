"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

type Status = "idle" | "submitting" | "sent";

// UI only for now — the SQS-backed POST /api/contact is wired in a later pass.
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    // Simulated latency until the API route exists.
    await new Promise((r) => setTimeout(r, 800));
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-terminal-green/40 bg-terminal-green/10 p-6 text-center font-mono text-sm text-terminal-green"
      >
        &gt; message queued. I&apos;ll get back to you soon.
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-xs text-content-muted">name</label>
          <Input name="name" placeholder="Your name" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-xs text-content-muted">email</label>
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-xs text-content-muted">message</label>
        <Textarea name="message" rows={5} placeholder="What's up?" required />
      </div>
      <Button type="submit" disabled={status === "submitting"} className="self-start">
        {status === "submitting" ? "sending…" : "send message"}
        <Send size={14} />
      </Button>
    </form>
  );
}

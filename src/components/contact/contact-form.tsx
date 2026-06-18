"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

type Status = "idle" | "submitting" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const data = new FormData(e.currentTarget);
    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      message: data.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
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
      {status === "error" && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-xs text-red-400"
        >
          &gt; something went wrong. please try again.
        </motion.p>
      )}
      <Button type="submit" disabled={status === "submitting"} className="self-start">
        {status === "submitting" ? "sending…" : "send message"}
        <Send size={14} />
      </Button>
    </form>
  );
}

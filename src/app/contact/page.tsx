import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact | Yokesh",
  description: "Get in touch with Yokesh — backend engineer.",
};

export default function ContactPage() {
  return (
    <div className="bg-content-bg">
      <div className="mx-auto max-w-2xl px-6 py-28">
        <SectionHeading
          eyebrow="// ping"
          title="Get in touch"
          description="Open to backend and platform roles. Drop a message and I'll respond soon."
          className="mb-10"
        />
        <ContactForm />
      </div>
    </div>
  );
}

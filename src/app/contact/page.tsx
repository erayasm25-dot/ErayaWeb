"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Instagram, MessageSquare, Check, Copy, Mail } from "lucide-react";
import Button from "@/components/common/Button";
import { container, cn } from "@/lib/utils";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE, CONTACT_EMAIL } from "@/data/navigation";
import { useUI } from "@/context/UIContext";

const field =
  "w-full min-h-[46px] px-3.5 py-2.5 bg-white border border-forest-dark/30 text-forest-dark text-[15px] font-sans placeholder:text-forest-dark/40 focus:outline-none focus:border-forest-dark";

export default function ContactPage() {
  const { openCustomOrder, showToast } = useUI();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [prepared, setPrepared] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = [
    "ERAYA message",
    `Name: ${name.trim()}`,
    `Contact: ${contact.trim()}`,
    `Message: ${message.trim()}`,
  ].join("\n");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2 || contact.trim().length < 3 || message.trim().length < 5) {
      setError("Please fill in your name, contact details, and a short message.");
      return;
    }
    setError(null);
    setPrepared(true);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      showToast("Message copied — paste it into Instagram DM");
    } catch {
      showToast("Couldn’t copy automatically. Please select and copy the text.");
    }
  };

  return (
    <>
      <section className="bg-forest-dark text-cream border-b border-gold/30">
        <div className={`${container} py-12 sm:py-16`}>
          <nav
            aria-label="Breadcrumb"
            className="text-[11px] tracking-[0.2em] uppercase text-cream/60 mb-5 font-sans"
          >
            <Link href="/" className="hover:text-gold">
              Home
            </Link>{" "}
            <span aria-hidden="true">/</span>{" "}
            <span className="text-gold" aria-current="page">
              Contact
            </span>
          </nav>
          <h1 className="font-serif font-normal display-lg">Get in touch</h1>
          <p className="mt-4 max-w-xl text-base text-ivory/80 font-sans leading-relaxed">
            Questions about a piece or a custom request? Reach ERAYA directly on Instagram.
          </p>
        </div>
      </section>

      <section className="bg-ivory text-forest-dark py-14 sm:py-20">
        <div className={`${container} grid lg:grid-cols-12 gap-10 lg:gap-14`}>
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 bg-forest text-cream border border-gold/40">
              <p className="text-[11px] uppercase tracking-[0.24em] text-gold mb-2">
                Instagram
              </p>
              <h2 className="font-serif text-3xl mb-3">{INSTAGRAM_HANDLE}</h2>
              <p className="text-sm text-ivory/80 font-sans leading-relaxed mb-6">
                Message us on Instagram for product questions, availability, and custom order discussions.
              </p>
              <Button variant="primary" href={INSTAGRAM_URL} isExternal>
                <Instagram className="w-4 h-4" /> Message on Instagram
              </Button>
              {CONTACT_EMAIL && (
                <div className="mt-5 pt-5 border-t border-gold/30">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold mb-1.5">Email</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="inline-flex items-center gap-2 text-base text-cream hover:text-gold underline underline-offset-4 decoration-gold/60 font-sans"
                  >
                    <Mail className="w-4 h-4 text-gold" /> {CONTACT_EMAIL}
                  </a>
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8 border border-gold/50 bg-ivory-200">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-forest shrink-0 mt-1" />
                <div>
                  <h2 className="font-serif text-2xl">Looking for something custom?</h2>
                  <p className="text-sm text-forest-dark/75 font-sans mt-1.5 leading-relaxed">
                    Use our custom order enquiry form to put together your colour palette, category, and reference image.
                  </p>
                  <button
                    onClick={() => openCustomOrder()}
                    className="mt-3 text-xs uppercase tracking-[0.16em] underline underline-offset-[6px] decoration-gold min-h-[44px]"
                  >
                    Open custom order form
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 sm:p-8 border border-gold/50 bg-ivory-200">
            {!prepared ? (
              <form onSubmit={submit} noValidate className="space-y-4">
                <h2 className="font-serif text-3xl mb-2">Prepare a note</h2>
                <p className="text-sm text-forest-dark/70 font-sans mb-4">
                  This prepares your message so you can copy and send it to {INSTAGRAM_HANDLE}.
                </p>

                {error && (
                  <p className="p-3 bg-white border border-[#8a2a1a] text-xs text-[#8a2a1a] font-sans" role="alert">
                    {error}
                  </p>
                )}

                <div>
                  <label htmlFor="c-name" className="block text-[13px] font-medium mb-1.5 font-sans">
                    Your name
                  </label>
                  <input
                    id="c-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className={field}
                  />
                </div>

                <div>
                  <label htmlFor="c-contact" className="block text-[13px] font-medium mb-1.5 font-sans">
                    Instagram handle or phone number
                  </label>
                  <input
                    id="c-contact"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="@handle or mobile number"
                    className={field}
                  />
                </div>

                <div>
                  <label htmlFor="c-msg" className="block text-[13px] font-medium mb-1.5 font-sans">
                    Message
                  </label>
                  <textarea
                    id="c-msg"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you have in mind…"
                    className={cn(field, "resize-none")}
                  />
                </div>

                <Button type="submit" variant="solid" className="w-full">
                  Prepare message
                </Button>
              </form>
            ) : (
              <div>
                <div className="w-11 h-11 rounded-full bg-forest text-cream flex items-center justify-center mb-4">
                  <Check className="w-5 h-5" />
                </div>
                <h2 className="font-serif text-3xl mb-2">Ready to send</h2>
                <p className="text-sm text-forest-dark/75 font-sans mb-4 leading-relaxed">
                  <strong>Nothing has been sent automatically.</strong> Copy your note below and send it to{" "}
                  {INSTAGRAM_HANDLE} on Instagram.
                </p>
                <pre className="p-4 bg-white border border-forest-dark/20 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                  {summary}
                </pre>
                <div className="mt-5 grid sm:grid-cols-2 gap-3">
                  <Button variant="solid" onClick={copy}>
                    <Copy className="w-4 h-4" /> Copy message
                  </Button>
                  <Button variant="line" href={INSTAGRAM_URL} isExternal>
                    <Instagram className="w-4 h-4" /> Open Instagram
                  </Button>
                </div>
                <button
                  onClick={() => setPrepared(false)}
                  className="mt-4 min-h-[44px] text-xs uppercase tracking-[0.16em] underline underline-offset-[6px] decoration-gold"
                >
                  Edit message
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

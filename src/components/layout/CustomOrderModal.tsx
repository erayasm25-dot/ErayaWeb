"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Upload, CheckCircle2, Instagram, Trash2 } from "lucide-react";
import { useUI } from "@/context/UIContext";
import { CATEGORIES } from "@/data/categories";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/data/navigation";
import Button from "@/components/common/Button";
import { useOverlay } from "@/hooks/useOverlay";
import { cn } from "@/lib/utils";

const MAX_FILE = 4 * 1024 * 1024;

interface Form {
  name: string;
  phone: string;
  category: string;
  request: string;
  budget: string;
}
type Errors = Partial<Record<keyof Form | "file" | "server", string>>;

const empty: Form = { name: "", phone: "", category: "", request: "", budget: "" };

const field =
  "w-full min-h-[46px] px-3.5 py-2.5 bg-white border text-forest-dark text-[15px] font-sans placeholder:text-forest-dark/40 focus:outline-none focus:border-forest-dark";

export default function CustomOrderModal() {
  const { isCustomOrderOpen, closeCustomOrder, customOrderPreset, showToast } = useUI();
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useOverlay(isCustomOrderOpen, closeCustomOrder);

  useEffect(() => {
    if (isCustomOrderOpen) {
      setForm({ ...empty, category: customOrderPreset ?? "" });
      setErrors({});
      setSavedId(null);
      setFile(null);
      setPreview(null);
    }
  }, [isCustomOrderOpen, customOrderPreset]);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return setErrors((er) => ({ ...er, file: "Please choose an image file." }));
    if (f.size > MAX_FILE) return setErrors((er) => ({ ...er, file: "Image must be under 4 MB." }));
    setErrors((er) => ({ ...er, file: undefined }));
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(f);
  };

  const validate = (): Errors => {
    const er: Errors = {};
    if (form.name.trim().length < 2) er.name = "Please enter your name.";
    const digits = form.phone.replace(/[\s\-()]/g, "").replace(/^\+?91/, "");
    if (!/^[6-9]\d{9}$/.test(digits)) er.phone = "Enter a valid 10-digit mobile number.";
    if (!form.category) er.category = "Choose a product category.";
    if (form.request.trim().length < 10) er.request = "Tell us a little more (at least 10 characters).";
    if (form.budget && (!/^\d+$/.test(form.budget) || Number(form.budget) < 1)) er.budget = "Enter the budget as a number in ₹.";
    return er;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          category: form.category,
          request: form.request,
          budget: form.budget,
          referenceImageName: file?.name ?? null,
          referenceImageData: preview,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrors({ server: data.error || "Could not submit your enquiry. Please try again." });
        return;
      }
      setSavedId(data.id);
      showToast("Custom order enquiry received");
    } catch {
      setErrors({ server: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`err-${k}`} className="mt-1 text-xs text-[#8a2a1a] font-sans" role="alert">{errors[k]}</p>
    ) : null;
  const inv = (k: keyof Errors) => ({
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `err-${k}` : undefined,
  });
  const border = (k: keyof Errors) => (errors[k] ? "border-[#8a2a1a]" : "border-forest-dark/30");
  const label = "block text-[13px] font-medium text-forest-dark mb-1.5 font-sans";

  return (
    <AnimatePresence>
      {isCustomOrderOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto" role="dialog" aria-modal="true" aria-label="Custom order enquiry">
          <div className="min-h-full flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCustomOrder}
              className="fixed inset-0 bg-forest-deep/80"
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.22 }}
              className="relative bg-ivory text-forest-dark w-full max-w-xl border border-gold shadow-elevated z-10 my-4"
            >
              <button onClick={closeCustomOrder} className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center hover:bg-forest-dark hover:text-cream transition-colors" aria-label="Close custom order form">
                <X className="w-5 h-5" />
              </button>

              <div className="p-5 sm:p-8">
                {!savedId ? (
                  <>
                    <p className="text-[11px] tracking-[0.26em] uppercase text-gold-800 mb-2">Custom orders</p>
                    <h2 className="font-serif text-3xl sm:text-4xl leading-tight pr-8">Tell us your idea</h2>
                    <p className="text-sm text-forest-dark/75 mt-2 mb-6 font-sans leading-relaxed">
                      Share what you have in mind. Your enquiry will be saved for ERAYA to review.
                    </p>

                    {errors.server && (
                      <p className="mb-4 p-3 bg-white border border-[#8a2a1a] text-xs text-[#8a2a1a] font-sans" role="alert">
                        {errors.server}
                      </p>
                    )}

                    <form onSubmit={submit} noValidate className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="co-name" className={label}>Name</label>
                          <input id="co-name" autoComplete="name" value={form.name} onChange={set("name")} className={cn(field, border("name"))} {...inv("name")} />
                          {err("name")}
                        </div>
                        <div>
                          <label htmlFor="co-phone" className={label}>Contact number</label>
                          <input id="co-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" value={form.phone} onChange={set("phone")} className={cn(field, border("phone"))} {...inv("phone")} />
                          {err("phone")}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="co-cat" className={label}>Product category</label>
                          <select id="co-cat" value={form.category} onChange={set("category")} className={cn(field, border("category"))} {...inv("category")}>
                            <option value="">Select a category</option>
                            {CATEGORIES.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                            <option value="other">Something else</option>
                          </select>
                          {err("category")}
                        </div>
                        <div>
                          <label htmlFor="co-budget" className={label}>Preferred budget (₹, optional)</label>
                          <input id="co-budget" inputMode="numeric" placeholder="e.g. 1000" value={form.budget} onChange={set("budget")} className={cn(field, border("budget"))} {...inv("budget")} />
                          {err("budget")}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="co-req" className={label}>Customisation request</label>
                        <textarea id="co-req" rows={4} placeholder="Colours, sizes, occasion, names, characters, the story behind it…" value={form.request} onChange={set("request")} className={cn(field, border("request"), "resize-none")} {...inv("request")} />
                        {err("request")}
                      </div>

                      <div>
                        <span className={label}>Reference image (optional)</span>
                        <input ref={fileRef} id="co-file" type="file" accept="image/*" onChange={onFile} className="sr-only" />
                        {file && preview ? (
                          <div className="flex items-center gap-3 p-2 border border-forest-dark/30 bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={preview} alt="Selected reference" className="w-14 h-14 object-cover" />
                            <span className="flex-1 min-w-0 text-sm truncate font-sans">{file.name}</span>
                            <button type="button" onClick={() => { setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }} className="w-10 h-10 flex items-center justify-center hover:bg-forest-dark hover:text-cream" aria-label="Remove reference image">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label htmlFor="co-file" className="flex items-center justify-center gap-2 min-h-[46px] border border-dashed border-forest-dark/40 bg-white text-sm font-sans cursor-pointer hover:border-forest-dark focus-within:outline">
                            <Upload className="w-4 h-4 text-gold-800" /> Choose an image (max 4 MB)
                          </label>
                        )}
                        {err("file")}
                      </div>

                      <Button type="submit" variant="solid" className="w-full" disabled={submitting}>
                        <Send className="w-4 h-4" /> {submitting ? "Sending enquiry…" : "Submit custom order enquiry"}
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-forest text-cream flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="text-[11px] tracking-[0.26em] uppercase text-gold-800 mb-2">Enquiry recorded</p>
                    <h2 className="font-serif text-3xl sm:text-4xl leading-tight">Thank you, {form.name}</h2>
                    <p className="mt-3 text-sm text-forest-dark/80 font-sans max-w-md mx-auto leading-relaxed">
                      Your custom order enquiry has been saved with reference <strong>{savedId}</strong>. Please note that submitting an enquiry does not confirm an order yet — ERAYA will review your request and reach out to discuss feasibility, timeline, and pricing.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      <Button variant="solid" onClick={closeCustomOrder}>Done</Button>
                      <Button variant="line" href={INSTAGRAM_URL} isExternal>
                        <Instagram className="w-4 h-4" /> Follow {INSTAGRAM_HANDLE}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

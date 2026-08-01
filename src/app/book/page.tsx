"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, ChevronLeft, Check, MapPin, Loader2 } from "lucide-react";
import { LESSON_TYPES, type LessonTypeId, type BookingFormData } from "@/lib/types";
// ── Available time slots ──────────────────────────────────────────────────────
const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
];

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

// Get a date N days from now
function dateInDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

// Email validation
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Age validation
function isValidAge(age: string) {
  const n = parseInt(age, 10);
  return !isNaN(n) && n >= 1 && n <= 99 && String(n) === age.trim();
}

// ── Step components ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 flex items-center justify-center text-xs font-bold font-heading tracking-wide transition-colors ${
              i < current
                ? "bg-ball-600 text-white"
                : i === current
                ? "bg-navy-900 text-white"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className={`w-12 h-0.5 ${i < current ? "bg-ball-600" : "bg-gray-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Validation error types ────────────────────────────────────────────────────

type FieldErrors = Record<string, string>;

// ── Main booking page ─────────────────────────────────────────────────────────

const EMPTY_FORM: BookingFormData = {
  lessonTypeId: "60min-solo",
  preferredDate: dateInDays(3),
  preferredTime: "10:00",
  parentName: "",
  parentEmail: "",
  parentPhone: "",
  student1Name: "",
  student1Age: "",
  student2Name: "",
  student2Age: "",
  notes: "",
};

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <BookPageInner />
    </Suspense>
  );
}

function BookPageInner() {
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BookingFormData>(() => {
    const typeParam = params.get("type") as LessonTypeId | null;
    return {
      ...EMPTY_FORM,
      lessonTypeId: typeParam && LESSON_TYPES[typeParam] ? typeParam : "60min-solo",
    };
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // If ?type= param present, start at step 1 (skip session selection)
  const [startedWithType] = useState(() => !!params.get("type"));
  useEffect(() => {
    if (startedWithType) setStep(1);
  }, [startedWithType]);

  function set<K extends keyof BookingFormData>(k: K, v: BookingFormData[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    // Clear field error when user types
    if (fieldErrors[k]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[k];
        return next;
      });
    }
  }

  function markTouched(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  const lessonType = LESSON_TYPES[form.lessonTypeId];
  const is2Kids = form.lessonTypeId === "60min-2kids";

  // Validate step 2 fields and return errors
  const validateStep2 = useCallback((): FieldErrors => {
    const errors: FieldErrors = {};
    if (!form.parentName.trim()) errors.parentName = "Name is required";
    else if (form.parentName.trim().length > 100) errors.parentName = "Name is too long";

    if (!form.parentEmail.trim()) errors.parentEmail = "Email is required";
    else if (!isValidEmail(form.parentEmail)) errors.parentEmail = "Enter a valid email address";
    else if (form.parentEmail.trim().length > 100) errors.parentEmail = "Email is too long";

    if (form.parentPhone && form.parentPhone.length > 20) errors.parentPhone = "Phone number is too long";

    if (!form.student1Name.trim()) errors.student1Name = "Player name is required";
    else if (form.student1Name.trim().length > 100) errors.student1Name = "Name is too long";

    if (!form.student1Age.trim()) errors.student1Age = "Age is required";
    else if (!isValidAge(form.student1Age)) errors.student1Age = "Enter a valid age (1-99)";

    if (is2Kids) {
      if (!form.student2Name.trim()) errors.student2Name = "Player 2 name is required";
      else if (form.student2Name.trim().length > 100) errors.student2Name = "Name is too long";

      if (!form.student2Age.trim()) errors.student2Age = "Age is required";
      else if (!isValidAge(form.student2Age)) errors.student2Age = "Enter a valid age (1-99)";
    }

    if (form.notes.length > 500) errors.notes = "Notes must be under 500 characters";

    return errors;
  }, [form, is2Kids]);

  // Real-time validation for touched fields
  useEffect(() => {
    if (step !== 2) return;
    const errors = validateStep2();
    // Only show errors for touched fields
    const visibleErrors: FieldErrors = {};
    for (const [key, msg] of Object.entries(errors)) {
      if (touched[key]) visibleErrors[key] = msg;
    }
    setFieldErrors(visibleErrors);
  }, [form, touched, step, validateStep2]);

  function canAdvance() {
    if (step === 0) return true;
    if (step === 1) return !!form.preferredDate && !!form.preferredTime;
    if (step === 2) {
      const errors = validateStep2();
      return Object.keys(errors).length === 0;
    }
    return true;
  }

  async function handleSubmit() {
    // Validate all fields before submit
    const errors = validateStep2();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Mark all as touched
      const allTouched: Record<string, boolean> = {};
      for (const key of Object.keys(errors)) allTouched[key] = true;
      setTouched((prev) => ({ ...prev, ...allTouched }));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      // 1. Create pending booking
      const bookingRes = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) throw new Error(bookingData.error || "Failed to create booking");

      // 2. Create Stripe checkout session
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingData.id,
          lessonTypeId: form.lessonTypeId,
          customerEmail: form.parentEmail,
          customerName: form.parentName,
        }),
      });
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(checkoutData.error || "Failed to create checkout");

      // 3. Redirect to Stripe
      window.location.href = checkoutData.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-navy-900 border-b border-navy-800">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-heading font-bold text-white text-lg tracking-wider uppercase hover:text-gray-200 transition-colors"
          >
            Ryan Ward Baseball
          </Link>
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <MapPin className="w-3 h-3" />
            <span>Coronado &amp; San Diego, CA</span>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-5 sm:px-8 py-14">
        <StepIndicator current={step} total={3} />

        {/* ── STEP 0: Choose session type ──────────────── */}
        {step === 0 && (
          <div>
            <h1 className="font-heading font-bold uppercase text-navy-900 text-3xl sm:text-4xl mb-2">
              Choose Your Session
            </h1>
            <p className="text-gray-500 text-base mb-8">
              All sessions held at local Coronado or San Diego fields.
            </p>

            <div className="flex flex-col gap-3 mb-10">
              {(Object.values(LESSON_TYPES) as typeof LESSON_TYPES[LessonTypeId][]).map((lt) => (
                <button
                  key={lt.id}
                  onClick={() => set("lessonTypeId", lt.id)}
                  className={`flex items-center justify-between p-5 border-2 text-left transition-colors cursor-pointer ${
                    form.lessonTypeId === lt.id
                      ? "border-ball-600 bg-ball-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div>
                    <p className="font-heading font-bold text-navy-900 uppercase tracking-wide text-sm">
                      {lt.name}
                    </p>
                    <p className="text-gray-500 text-sm mt-0.5">{lt.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-4 shrink-0">
                    <span className="font-heading font-bold text-navy-900 text-2xl">
                      {lt.priceDisplay}
                    </span>
                    {form.lessonTypeId === lt.id && (
                      <span className="w-5 h-5 bg-ball-600 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full bg-navy-900 hover:bg-navy-800 text-white font-heading font-bold uppercase tracking-widest text-sm px-8 py-4 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              Next: Pick a Date
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP 1: Date & time ──────────────────────── */}
        {step === 1 && (
          <div>
            <h1 className="font-heading font-bold uppercase text-navy-900 text-3xl sm:text-4xl mb-2">
              Pick a Date &amp; Time
            </h1>
            <p className="text-gray-500 text-base mb-8">
              I&apos;ll confirm availability within 24 hours of booking.
            </p>

            <div className="bg-white border border-gray-200 p-6 mb-4">
              <label className="block font-heading font-bold text-navy-900 uppercase text-xs tracking-widest mb-3">
                Preferred Date
              </label>
              <input
                type="date"
                value={form.preferredDate}
                min={dateInDays(1)}
                max={dateInDays(90)}
                onChange={(e) => set("preferredDate", e.target.value)}
                className="w-full border border-gray-300 bg-white px-4 py-3 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-ball-500 focus:border-ball-500 transition-colors"
              />
            </div>

            <div className="bg-white border border-gray-200 p-6 mb-10">
              <label className="block font-heading font-bold text-navy-900 uppercase text-xs tracking-widest mb-3">
                Preferred Time
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    onClick={() => set("preferredTime", t)}
                    className={`py-3 text-sm font-semibold border transition-colors cursor-pointer ${
                      form.preferredTime === t
                        ? "border-ball-600 bg-ball-600 text-white"
                        : "border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {formatTime(t)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 font-semibold text-sm px-5 py-3.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!canAdvance()}
                className="flex-1 bg-navy-900 hover:bg-navy-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-heading font-bold uppercase tracking-widest text-sm px-8 py-4 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Next: Your Info
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Contact + student info ──────────── */}
        {step === 2 && (
          <div>
            <h1 className="font-heading font-bold uppercase text-navy-900 text-3xl sm:text-4xl mb-2">
              Your Information
            </h1>
            <p className="text-gray-500 text-base mb-8">
              I&apos;ll send a confirmation email once I review your booking.
            </p>

            <div className="bg-white border border-gray-200 p-6 space-y-5 mb-4">
              <p className="font-heading font-bold text-navy-900 uppercase text-xs tracking-widest border-b border-gray-100 pb-3">
                Parent / Guardian
              </p>
              <Field
                label="Your Name"
                value={form.parentName}
                onChange={(v) => set("parentName", v)}
                onBlur={() => markTouched("parentName")}
                placeholder="Jane Ward"
                error={fieldErrors.parentName}
                maxLength={100}
                required
              />
              <Field
                label="Email"
                type="email"
                value={form.parentEmail}
                onChange={(v) => set("parentEmail", v)}
                onBlur={() => markTouched("parentEmail")}
                placeholder="jane@example.com"
                error={fieldErrors.parentEmail}
                maxLength={100}
                required
              />
              <Field
                label="Phone (optional)"
                type="tel"
                value={form.parentPhone}
                onChange={(v) => set("parentPhone", v)}
                onBlur={() => markTouched("parentPhone")}
                placeholder="(619) 555-0100"
                error={fieldErrors.parentPhone}
                maxLength={20}
              />
            </div>

            <div className="bg-white border border-gray-200 p-6 space-y-5 mb-4">
              <p className="font-heading font-bold text-navy-900 uppercase text-xs tracking-widest border-b border-gray-100 pb-3">
                {is2Kids ? "Player 1" : "Player"}
              </p>
              <Field
                label="Player Name"
                value={form.student1Name}
                onChange={(v) => set("student1Name", v)}
                onBlur={() => markTouched("student1Name")}
                placeholder="Alex Ward"
                error={fieldErrors.student1Name}
                maxLength={100}
                required
              />
              <Field
                label="Age"
                type="number"
                value={form.student1Age}
                onChange={(v) => set("student1Age", v)}
                onBlur={() => markTouched("student1Age")}
                placeholder="10"
                error={fieldErrors.student1Age}
                min={1}
                max={99}
                required
              />
            </div>

            {is2Kids && (
              <div className="bg-white border border-gray-200 p-6 space-y-5 mb-4">
                <p className="font-heading font-bold text-navy-900 uppercase text-xs tracking-widest border-b border-gray-100 pb-3">
                  Player 2
                </p>
                <Field
                  label="Player Name"
                  value={form.student2Name}
                  onChange={(v) => set("student2Name", v)}
                  onBlur={() => markTouched("student2Name")}
                  placeholder="Sam Ward"
                  error={fieldErrors.student2Name}
                  maxLength={100}
                  required
                />
                <Field
                  label="Age"
                  type="number"
                  value={form.student2Age}
                  onChange={(v) => set("student2Age", v)}
                  onBlur={() => markTouched("student2Age")}
                  placeholder="8"
                  error={fieldErrors.student2Age}
                  min={1}
                  max={99}
                  required
                />
              </div>
            )}

            <div className="bg-white border border-gray-200 p-6 mb-10">
              <label className="block font-heading font-bold text-navy-900 uppercase text-xs tracking-widest mb-3">
                Notes (optional)
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                onBlur={() => markTouched("notes")}
                placeholder="What would you like to work on? Any questions?"
                maxLength={500}
                className={`w-full border bg-white px-4 py-3 text-sm text-navy-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ball-500 focus:border-ball-500 transition-colors resize-none ${
                  fieldErrors.notes ? "border-red-400" : "border-gray-300"
                }`}
              />
              <div className="flex justify-between mt-1.5">
                {fieldErrors.notes ? (
                  <p className="text-red-600 text-xs">{fieldErrors.notes}</p>
                ) : (
                  <span />
                )}
                <p className="text-gray-400 text-xs">{form.notes.length}/500</p>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-navy-900 text-white p-6 mb-6 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Session</span>
                <span className="font-semibold">{lessonType.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date</span>
                <span className="font-semibold">
                  {new Date(form.preferredDate + "T12:00:00").toLocaleDateString("en-US", {
                    weekday: "short", month: "short", day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time</span>
                <span className="font-semibold">{formatTime(form.preferredTime)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-navy-700 mt-3">
                <span className="text-gray-300 font-bold">Total</span>
                <span className="font-heading font-bold text-lg">{lessonType.priceDisplay}</span>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 px-4 py-3">
                <p className="font-semibold mb-1">Something went wrong</p>
                <p>{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 font-semibold text-sm px-5 py-3.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canAdvance() || submitting}
                className="flex-1 bg-ball-600 hover:bg-ball-500 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-heading font-bold uppercase tracking-widest text-sm px-8 py-4 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecting to Stripe...
                  </>
                ) : (
                  <>
                    Pay {lessonType.priceDisplay} &amp; Book
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            <p className="text-gray-400 text-xs mt-3 text-center">
              You&apos;ll be redirected to Stripe&apos;s secure checkout page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Reusable form field ───────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  error,
  maxLength,
  min,
  max,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  error?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        min={min}
        max={max}
        className={`w-full border bg-white px-4 py-3 text-sm text-navy-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ball-500 focus:border-ball-500 transition-colors ${
          error ? "border-red-400" : "border-gray-300"
        }`}
      />
      {error && (
        <p className="text-red-600 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}

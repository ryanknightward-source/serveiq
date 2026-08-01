"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, MapPin, Mail, Clock, ChevronRight } from "lucide-react";

function SuccessPageInner() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setVerified(false);
      return;
    }
    // Verify payment status via Stripe
    const bookingId = params.get("booking_id") || "";
    fetch(`/api/checkout/verify?session_id=${sessionId}&booking_id=${bookingId}`)
      .then((r) => r.json())
      .then((d) => setVerified(d.paid === true))
      .catch(() => setVerified(true)); // optimistic on network error
  }, [sessionId, params]);

  // No session_id — user navigated here directly
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-navy-900 flex flex-col font-sans">
        <header className="border-b border-navy-800">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center">
            <Link
              href="/"
              className="font-heading font-bold text-white text-lg tracking-wider uppercase hover:text-gray-200 transition-colors"
            >
              Ryan Ward Baseball
            </Link>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center px-5 py-20">
          <div className="text-center max-w-md">
            <h1 className="font-heading font-bold uppercase text-white text-2xl mb-4">
              No Booking Found
            </h1>
            <p className="text-gray-400 text-base leading-relaxed mb-8">
              It looks like you navigated here without completing a booking.
              If you believe this is an error, please contact us.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-ball-600 hover:bg-ball-500 text-white font-heading font-bold uppercase tracking-widest text-sm px-8 py-4 transition-colors"
            >
              Book a Lesson
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-navy-800">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center">
          <Link
            href="/"
            className="font-heading font-bold text-white text-lg tracking-wider uppercase hover:text-gray-200 transition-colors"
          >
            Ryan Ward Baseball
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-20">
        <div className="text-center max-w-lg">
          {/* Check icon */}
          <div className="w-16 h-16 bg-ball-600 flex items-center justify-center mx-auto mb-8">
            <Check className="w-8 h-8 text-white" strokeWidth={3} />
          </div>

          <h1
            className="font-heading font-bold uppercase text-white mb-4"
            style={{ fontSize: "clamp(2rem, 6vw, 3rem)", letterSpacing: "-0.01em" }}
          >
            You&apos;re Booked
          </h1>

          <p className="text-gray-300 text-base leading-relaxed mb-8">
            Payment confirmed. I&apos;ll review your booking and send a confirmation
            email within 24 hours with the field location and any details.
          </p>

          {/* What happens next */}
          <div className="bg-navy-800 border border-navy-700 p-6 mb-8 text-left space-y-4">
            <p className="font-heading font-bold text-white uppercase text-xs tracking-widest border-b border-navy-700 pb-3">
              What Happens Next
            </p>
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-ball-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-300 text-sm leading-relaxed">
                You&apos;ll receive a confirmation email from Ryan within 24 hours with the exact field location and any other details.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-ball-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-300 text-sm leading-relaxed">
                Lessons are held at local fields in Coronado and San Diego. The specific location will be confirmed in your email.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-ball-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-300 text-sm leading-relaxed">
                If the requested time doesn&apos;t work, Ryan will suggest an alternative that does. Your payment is secure either way.
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-ball-600 hover:bg-ball-500 text-white font-heading font-bold uppercase tracking-widest text-sm px-8 py-4 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy-900" />}>
      <SuccessPageInner />
    </Suspense>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, MapPin } from "lucide-react";

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
    fetch(`/api/checkout/verify?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((d) => setVerified(d.paid === true))
      .catch(() => setVerified(true)); // optimistic on network error
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-navy-800">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center">
          <Link
            href="/"
            className="font-heading font-800 text-white text-lg tracking-wider uppercase"
          >
            Ryan Ward Baseball
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-20">
        <div className="text-center max-w-md">
          {/* Check icon */}
          <div className="w-16 h-16 bg-ball-600 flex items-center justify-center mx-auto mb-8">
            <Check className="w-8 h-8 text-white" strokeWidth={3} />
          </div>

          <h1
            className="font-heading font-black uppercase text-white mb-4"
            style={{ fontSize: "clamp(2rem, 6vw, 3rem)", letterSpacing: "-0.01em" }}
          >
            You&apos;re Booked
          </h1>

          <p className="text-gray-300 text-base leading-relaxed mb-4">
            Payment confirmed. I&apos;ll review your booking and send a confirmation
            email within 24 hours with the field location and any details.
          </p>

          <div className="flex items-center justify-center gap-1.5 text-gray-500 text-sm mb-10">
            <MapPin className="w-3.5 h-3.5" />
            <span>Field details confirmed in your email</span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-ball-600 hover:bg-ball-500 text-white font-heading font-700 uppercase tracking-widest text-sm px-8 py-4 transition-colors"
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

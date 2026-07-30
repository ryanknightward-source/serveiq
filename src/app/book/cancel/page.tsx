"use client";

import { Suspense } from "react";
import Link from "next/link";
import { X } from "lucide-react";

function CancelPageInner() {
  return (
    <div className="min-h-screen bg-navy-900 flex flex-col font-sans">
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
          <div className="w-16 h-16 bg-navy-800 border border-navy-700 flex items-center justify-center mx-auto mb-8">
            <X className="w-8 h-8 text-gray-400" strokeWidth={2} />
          </div>

          <h1
            className="font-heading font-black uppercase text-white mb-4"
            style={{ fontSize: "clamp(2rem, 6vw, 3rem)", letterSpacing: "-0.01em" }}
          >
            Booking Cancelled
          </h1>

          <p className="text-gray-400 text-base leading-relaxed mb-10">
            No charge was made. You can go back and try again whenever you&apos;re ready.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-ball-600 hover:bg-ball-500 text-white font-heading font-700 uppercase tracking-widest text-sm px-8 py-4 transition-colors"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="text-gray-400 hover:text-white text-sm font-semibold transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy-900" />}>
      <CancelPageInner />
    </Suspense>
  );
}

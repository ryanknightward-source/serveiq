import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center px-4 py-16 text-center">
      <span className="font-heading font-bold text-white text-xl tracking-wider uppercase">
        Ryan Ward Baseball
      </span>
      <div className="mt-6 text-xs font-semibold uppercase tracking-wider text-ball-400">
        404
      </div>
      <h1 className="mt-2 text-3xl sm:text-4xl font-heading font-bold uppercase text-white tracking-tight">
        Page not found
      </h1>
      <p className="mt-3 text-sm text-gray-400 max-w-md">
        We couldn&apos;t find the page you were looking for. It may have moved,
        or the link might be out of date.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-ball-600 hover:bg-ball-500 text-white font-heading font-bold uppercase tracking-widest text-sm px-6 py-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        <Link
          href="/book"
          className="inline-flex items-center gap-2 border border-navy-600 hover:border-ball-500 text-gray-300 hover:text-white font-heading font-bold uppercase tracking-widest text-sm px-6 py-3 transition-colors"
        >
          Book a lesson
        </Link>
      </div>
    </div>
  );
}

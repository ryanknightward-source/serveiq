import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-amber-50/30 to-white flex flex-col items-center justify-center px-4 py-16 text-center">
      <Image
        src="/serveiq-logo.svg"
        alt="ServeIQ"
        width={180}
        height={50}
        priority
      />
      <div className="mt-6 text-xs font-semibold uppercase tracking-wider text-amber-600">
        404
      </div>
      <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
        Page not found
      </h1>
      <p className="mt-3 text-sm text-gray-600 max-w-md">
        We couldn&apos;t find the page you were looking for. It may have moved,
        or the link might be out of date.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/dashboard">
            <ArrowLeft />
            Back to dashboard
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go to homepage</Link>
        </Button>
      </div>
    </div>
  );
}

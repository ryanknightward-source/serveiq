import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  Zap,
  Star,
  Sparkles,
  Check,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-amber-50/30 to-white">
      <header className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <Image
            src="/serveiq-logo.svg"
            alt="ServeIQ"
            width={140}
            height={40}
            priority
            className="h-9 w-auto"
          />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/pricing"
            className="hidden sm:inline-block text-sm text-gray-600 hover:text-gray-900 px-3 py-2"
          >
            Pricing
          </Link>
          <Link
            href="/setup"
            className="hidden sm:inline-block text-sm text-gray-600 hover:text-gray-900 px-3 py-2"
          >
            Setup
          </Link>
          <Link
            href="/dashboard"
            className="hidden sm:inline-block text-sm text-gray-600 hover:text-gray-900 px-3 py-2"
          >
            Dashboard
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            Try the demo
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-20 sm:pb-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <Sparkles className="w-3 h-3" />
            For pest control & pool service companies
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-gray-900 leading-[1.05]">
            Never miss a lead again.
          </h1>
          <p className="mt-5 text-lg text-gray-600 max-w-2xl leading-relaxed">
            ServeIQ is an AI assistant that texts back new customers in seconds, follows up on
            cold quotes, and re-engages lapsed customers — all in your business's voice.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/setup"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#1a1a2e] hover:bg-[#2d2d4e] text-white text-sm font-medium shadow-lg shadow-gray-300 transition-colors"
            >
              Set up your AI in 60 seconds
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 text-sm font-medium text-gray-900 transition-colors"
            >
              See it in action
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-600">
            <li className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              No coding required
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              Powered by Claude
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              SMS & email
            </li>
          </ul>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-5">
          <Feature
            icon={MessageSquare}
            title="Instant lead replies"
            description="The first 5 minutes matter most. ServeIQ answers in under 60 seconds, 24/7."
          />
          <Feature
            icon={Zap}
            title="Smart cold-quote follow-ups"
            description="Automatically re-engages quotes that went cold without sounding pushy."
          />
          <Feature
            icon={Star}
            title="Review requests on autopilot"
            description="Asks happy customers for a Google review at exactly the right moment."
          />
        </div>
      </main>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="w-10 h-10 rounded-lg bg-[#1a1a2e] flex items-center justify-center text-amber-400 shadow-md shadow-gray-200">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-gray-900">{title}</h3>
      <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  MessageSquare,
  Zap,
  Star,
  Check,
  Settings,
  Smartphone,
  TrendingUp,
  Clock,
  Timer,
  Activity,
  HelpCircle,
} from "lucide-react";
import { Marquee } from "@/components/ui/marquee";
import { NumberTicker } from "@/components/ui/number-ticker";

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const MARQUEE_ITEMS = [
  "Built for pest control companies",
  "Built for pool service companies",
  "Built for lawn care companies",
  "AI-powered lead response",
  "Responds in under 30 seconds",
  "Works 24/7 while you sleep",
  "Follows up on cold quotes",
  "Re-engages lapsed customers",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="relative max-w-6xl mx-auto px-4 sm:px-6 py-4 border-t-2 border-[#1a1a2e]">
        <div className="flex items-center justify-between">
          {/* Logo — left */}
          <Link href="/" className="shrink-0">
            <Image
              src="/serveiq-logo.png"
              alt="ServeIQ"
              width={220}
              height={58}
              priority
              unoptimized
              className="object-contain"
            />
          </Link>

          {/* Nav links — center */}
          <nav className="hidden sm:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link
              href="/pricing"
              className="text-base font-semibold text-gray-800 hover:text-amber-600 px-3 py-2 transition-colors border-b-2 border-transparent hover:border-amber-500"
            >
              Pricing
            </Link>
            <Link
              href="/setup"
              className="text-base font-semibold text-gray-800 hover:text-amber-600 px-3 py-2 transition-colors border-b-2 border-transparent hover:border-amber-500"
            >
              Setup
            </Link>
            <Link
              href="/dashboard"
              className="text-base font-semibold text-gray-800 hover:text-amber-600 px-3 py-2 transition-colors border-b-2 border-transparent hover:border-amber-500"
            >
              Dashboard
            </Link>
          </nav>

          {/* CTA — right */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-[#1a1a2e] text-white hover:bg-[#2d2d4e] transition-colors"
            >
              Start free trial
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-50/80 via-white to-white" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-gradient-to-br from-amber-100/60 via-amber-50/30 to-transparent blur-3xl animate-pulse [animation-duration:6s]" />
          <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-blue-50/40 to-transparent blur-3xl animate-pulse [animation-duration:8s] [animation-delay:2s]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16">
          <div className="text-center">
            <FadeIn>
              <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mx-auto text-center">
                Your customers text.
                <br />
                You&apos;re on a job.
                <br />
                <span className="text-[#D97706]">ServeIQ texts back.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.1}>
              <p className="mt-6 text-xl md:text-2xl text-gray-500 max-w-lg mx-auto text-center leading-relaxed">
                AI that responds to new leads in seconds, follows up on cold
                quotes, and re-engages lapsed customers — in your voice, 24/7.
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#1a1a2e] hover:bg-[#2d2d4e] text-white text-sm font-medium shadow-lg shadow-gray-300/50 transition-all hover:shadow-xl hover:shadow-gray-300/60"
                >
                  Start free trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 text-sm font-medium text-gray-900 transition-colors"
                >
                  Watch demo
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-600">
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
                  14-day free trial, no credit card required
                </li>
              </ul>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="border-y border-gray-100 bg-gray-50/50 py-3 overflow-hidden">
        <Marquee className="[--duration:30s]" pauseOnHover repeat={2}>
          {MARQUEE_ITEMS.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 whitespace-nowrap px-4"
            >
              <span className="w-1 h-1 rounded-full bg-amber-400" />
              {item}
            </span>
          ))}
        </Marquee>
      </section>

      {/* Stats Bar */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <FadeIn>
          <div className="border border-gray-200 rounded-2xl py-8 px-6">
            <div className="grid grid-cols-3 gap-0">
              <StatBlock
                icon={Timer}
                prefix="< "
                value={30}
                suffix=" sec"
                label="Average response time"
                highlight
              />
              <StatBlock
                icon={Clock}
                staticValue={47}
                suffix=" min"
                label="Industry average response time"
              />
              <StatBlock
                icon={Activity}
                text="24/7"
                label="Never takes a day off"
              />
            </div>
          </div>
        </FadeIn>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50/80 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                Up and running in 20 minutes
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                No developers needed. No complicated setup. Just tell ServeIQ
                about your business and let it work.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FadeIn delay={0}>
              <Step
                number={1}
                icon={Settings}
                title="Set up in 20 minutes"
                description="Add your services, pricing, and tone. Paste a few examples of how you actually text customers."
              />
            </FadeIn>
            <FadeIn delay={0.1}>
              <Step
                number={2}
                icon={Smartphone}
                title="Connect your number"
                description="Customers text you like they always have. ServeIQ responds instantly — they won't know it's AI."
              />
            </FadeIn>
            <FadeIn delay={0.2}>
              <Step
                number={3}
                icon={TrendingUp}
                title="Watch leads convert"
                description="Follow-ups happen automatically while you're on a job. Cold quotes get warmed back up."
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Why ServeIQ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <FadeIn>
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
              Common questions
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FadeIn delay={0}>
            <Objection
              question="Will my customers know it's AI?"
              answer="Not if it sounds like you. During setup you train ServeIQ with examples of how you actually text customers. It matches your tone, your style, even your sign-offs. Most customers have no idea."
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <Objection
              question="What if the AI gives incorrect information?"
              answer="It only works with information you give it — your services, your prices, your policies. If anything sounds off, you update it in 30 seconds. And if a message is urgent, it flags you immediately instead of guessing."
            />
          </FadeIn>
          <FadeIn delay={0.2}>
            <Objection
              question="Is it worth $99 a month?"
              answer="The average pest control or pool company misses 8-12 leads a month from slow response times. At $150 per job that's $1,200-$1,800 in lost revenue every month. One extra job booked pays for ServeIQ. Most customers see 3-5."
            />
          </FadeIn>
          <FadeIn delay={0.3}>
            <Objection
              question="How long does setup take?"
              answer="Setup takes 20 minutes. Add your services, pricing, and a few examples of how you text customers. That's it. No technical knowledge required."
            />
          </FadeIn>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <FadeIn>
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
              What ServeIQ handles for you
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FadeIn delay={0}>
            <Feature
              icon={MessageSquare}
              title="Instant lead replies"
              description="A customer texts at 9pm on a Friday. ServeIQ responds in under 30 seconds — while you're still on the job."
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <Feature
              icon={Zap}
              title="Smart cold-quote follow-ups"
              description="Sent a quote that went quiet? ServeIQ follows up automatically so you don't have to chase."
            />
          </FadeIn>
          <FadeIn delay={0.2}>
            <Feature
              icon={Star}
              title="Review requests on autopilot"
              description="After every completed job, ServeIQ texts the customer asking for a Google review at exactly the right moment."
            />
          </FadeIn>
        </div>
      </section>

      {/* Lost Revenue Calculator */}
      <section className="bg-[#1a1a2e]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-16 text-center">
              <div>
                <p className="text-4xl sm:text-5xl font-bold text-amber-400 tracking-tight">
                  8–12 leads
                </p>
                <p className="mt-3 text-sm sm:text-base text-gray-400 max-w-xs mx-auto">
                  The average service company misses every month from slow
                  response times
                </p>
              </div>
              <div>
                <p className="text-4xl sm:text-5xl font-bold text-amber-400 tracking-tight">
                  $1,200–$1,800
                </p>
                <p className="mt-3 text-sm sm:text-base text-gray-400 max-w-xs mx-auto">
                  In lost revenue. Every single month.
                </p>
              </div>
            </div>
            <p className="mt-10 text-center text-xs text-gray-500">
              ServeIQ pays for itself with one extra job.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <FadeIn>
          <div className="rounded-2xl bg-[#1a1a2e] px-6 sm:px-12 py-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Never miss another lead.
            </h2>
            <p className="mt-4 text-base text-gray-400">
              Free 14-day trial. No credit card required. Cancel anytime.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Plans start at $99/mo after your trial. No contracts. Cancel anytime.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-900 text-sm font-semibold transition-colors"
              >
                Start your free trial — it&apos;s free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-gray-600 hover:border-gray-500 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                View pricing
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-gray-500">
            Questions? Email us at{" "}
            <a
              href="mailto:ryanknightward@gmail.com"
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              ryanknightward@gmail.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function StatBlock({
  icon: Icon,
  value,
  staticValue,
  prefix,
  suffix,
  text,
  label,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value?: number;
  staticValue?: number;
  prefix?: string;
  suffix?: string;
  text?: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center px-6">
      <Icon
        className={`w-5 h-5 mb-2 ${highlight ? "text-amber-600" : "text-gray-400"}`}
      />
      <div
        className={`text-3xl sm:text-4xl font-semibold tracking-tight ${
          highlight ? "text-amber-600" : "text-gray-900"
        }`}
      >
        {text ? (
          text
        ) : (
          <>
            {prefix}
            {staticValue != null ? (
              <span className="text-4xl font-bold text-foreground">{staticValue}</span>
            ) : (
              <NumberTicker value={value!} delay={0.3} />
            )}
            {suffix}
          </>
        )}
      </div>
      <div className="mt-1 text-xs text-gray-500">{label}</div>
    </div>
  );
}

function Step({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="relative rounded-xl border border-gray-200 bg-white p-8 shadow-sm text-center">
      <div className="flex justify-center mb-5">
        <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
          {number}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
      <p className="mt-3 text-lg text-gray-600 leading-loose">
        {description}
      </p>
    </div>
  );
}

function Objection({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-8">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <HelpCircle className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {question}
          </h3>
          <p className="mt-3 text-lg text-gray-600 leading-loose">
            {answer}
          </p>
        </div>
      </div>
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
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-lg bg-[#1a1a2e] flex items-center justify-center text-amber-400 shadow-md shadow-gray-200">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-gray-900">{title}</h3>
      <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

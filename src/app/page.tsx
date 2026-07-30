"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, ChevronRight } from "lucide-react";

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
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const SKILLS = [
  "Hitting",
  "Fielding",
  "Throwing",
  "Footwork",
  "Confidence",
  "All Ages",
];

const PRICES = [
  {
    duration: "30 MIN",
    label: "SINGLE SESSION",
    price: "$50",
    note: null,
  },
  {
    duration: "60 MIN",
    label: "SINGLE SESSION",
    price: "$80",
    note: null,
    featured: true,
  },
  {
    duration: "60 MIN",
    label: "2-KID SESSION",
    price: "$120",
    note: "Siblings or teammates",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAV ──────────────────────────────────────── */}
      <header className="bg-navy-900 border-b border-navy-800">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <span className="font-heading font-800 text-white text-lg tracking-wider uppercase">
            Ryan Ward Baseball
          </span>
          <Link
            href="/book"
            className="inline-flex items-center gap-1.5 bg-ball-600 hover:bg-ball-500 text-white text-sm font-semibold px-4 py-2 transition-colors uppercase tracking-wide"
          >
            Book a Lesson
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="bg-navy-900 relative overflow-hidden">
        {/* Diagonal accent stripe */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(26,79,160,0.15) 0%, transparent 50%)",
          }}
        />
        {/* Thin top-border accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-ball-600" />

        <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-16 pb-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            {/* Overline */}
            <p className="font-heading font-semibold text-ball-400 text-sm tracking-[0.2em] uppercase mb-5">
              Coronado &amp; San Diego, CA
            </p>

            {/* Main headline */}
            <h1
              className="font-heading font-black uppercase leading-none text-white"
              style={{ fontSize: "clamp(3rem, 10vw, 7.5rem)", letterSpacing: "-0.01em" }}
            >
              Private
              <br />
              Baseball
              <br />
              <span className="text-ball-400">Lessons</span>
            </h1>

            {/* Credential line */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="font-heading font-700 text-white text-base sm:text-lg tracking-wide uppercase">
                Former D1 Collegiate Player
              </span>
              <span className="hidden sm:block text-navy-600 font-bold">·</span>
              <span className="text-gray-400 text-sm sm:text-base font-semibold tracking-wide">
                University of Arkansas
              </span>
              <span className="text-navy-600 font-bold">·</span>
              <span className="text-gray-400 text-sm sm:text-base font-semibold tracking-wide">
                University of San Diego
              </span>
            </div>

            {/* Location */}
            <div className="mt-3 flex items-center gap-1.5 text-gray-500 text-sm">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Local fields in Coronado &amp; San Diego</span>
            </div>

            {/* CTA */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/book"
                className="inline-flex items-center gap-2 bg-ball-600 hover:bg-ball-500 text-white font-heading font-700 uppercase tracking-widest text-sm px-8 py-4 transition-colors"
              >
                Book a Lesson
                <ChevronRight className="w-4 h-4" />
              </Link>
              <a
                href="#pricing"
                className="text-gray-400 hover:text-white text-sm font-semibold tracking-wide transition-colors"
              >
                See pricing ↓
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SKILLS STRIP ─────────────────────────────── */}
      <div className="bg-ball-700 py-3">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1">
            {SKILLS.map((s) => (
              <span
                key={s}
                className="font-heading font-700 uppercase text-white text-sm tracking-[0.15em]"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRICING ──────────────────────────────────── */}
      <section id="pricing" className="bg-navy-900 py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <FadeIn>
            <h2
              className="font-heading font-black uppercase text-white text-center mb-2"
              style={{ fontSize: "clamp(2rem, 6vw, 4rem)", letterSpacing: "-0.01em" }}
            >
              Session Pricing
            </h2>
            <p className="text-center text-gray-400 text-sm mb-12">
              Payment collected at time of booking
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PRICES.map((p, i) => (
              <FadeIn key={p.duration + p.label} delay={i * 0.08}>
                <div
                  className={`relative border p-8 flex flex-col ${
                    p.featured
                      ? "border-ball-500 bg-navy-800"
                      : "border-navy-700 bg-navy-800"
                  }`}
                >
                  {p.featured && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-ball-500" />
                  )}
                  <p className="font-heading font-800 text-ball-400 text-xs tracking-[0.2em] uppercase mb-1">
                    {p.duration}
                  </p>
                  <p className="font-heading font-700 text-white text-sm tracking-[0.1em] uppercase mb-6">
                    {p.label}
                  </p>
                  <p
                    className="font-heading font-black text-white leading-none mb-6"
                    style={{ fontSize: "clamp(3rem, 8vw, 4.5rem)" }}
                  >
                    {p.price}
                  </p>
                  {p.note && (
                    <p className="text-gray-500 text-xs mb-6">{p.note}</p>
                  )}
                  <div className="mt-auto">
                    <Link
                      href={`/book?type=${i === 0 ? "30min-solo" : i === 1 ? "60min-solo" : "60min-2kids"}`}
                      className="block text-center bg-ball-600 hover:bg-ball-500 text-white font-heading font-700 uppercase tracking-widest text-xs px-6 py-3 transition-colors"
                    >
                      Book This
                    </Link>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT TO EXPECT ───────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <FadeIn>
            <h2
              className="font-heading font-black uppercase text-navy-900 mb-2"
              style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", letterSpacing: "-0.01em" }}
            >
              What We Work On
            </h2>
            <p className="text-gray-500 text-base mb-12 max-w-xl">
              Every session is hands-on and player-focused. We work on fundamentals
              and the mental game — whatever your kid needs most.
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-gray-100 border border-gray-100">
            {[
              { skill: "Hitting", desc: "Stance, swing mechanics, bat path, contact zones" },
              { skill: "Fielding", desc: "Glove work, positioning, reads off the bat" },
              { skill: "Throwing", desc: "Arm mechanics, accuracy, arm care" },
              { skill: "Footwork", desc: "First-step quickness, base running, infield/outfield movement" },
              { skill: "Confidence", desc: "Mindset, in-game pressure, building a short memory" },
              { skill: "All Ages", desc: "T-ball through high school. Beginners welcome." },
            ].map(({ skill, desc }, i) => (
              <FadeIn key={skill} delay={i * 0.06}>
                <div className="bg-white p-7 h-full">
                  <p className="font-heading font-800 text-navy-900 text-lg uppercase tracking-wide mb-2">
                    {skill}
                  </p>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────── */}
      <section className="bg-navy-900 py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl">
            <FadeIn>
              <p className="font-heading font-semibold text-ball-400 text-xs tracking-[0.2em] uppercase mb-4">
                About the Coach
              </p>
              <h2
                className="font-heading font-black uppercase text-white mb-6"
                style={{ fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.01em" }}
              >
                Ryan Ward
              </h2>
              <p className="text-gray-300 text-base leading-relaxed mb-4">
                I played D1 baseball at the University of Arkansas and the University
                of San Diego. After my playing career, I stayed in the game because
                I love teaching it.
              </p>
              <p className="text-gray-300 text-base leading-relaxed mb-4">
                I work with players of all skill levels — from kids picking up a
                glove for the first time to high school players competing for college
                opportunities. Every kid is different and every session is built
                around what that player actually needs.
              </p>
              <p className="text-gray-300 text-base leading-relaxed mb-8">
                Lessons are held at local fields in Coronado and San Diego. I keep
                scheduling simple — book online and I&apos;ll confirm your spot within
                24 hours.
              </p>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>Coronado &amp; San Diego fields — location confirmed at booking</span>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────── */}
      <section className="bg-ball-700 py-16">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center">
          <FadeIn>
            <h2
              className="font-heading font-black uppercase text-white mb-4"
              style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", letterSpacing: "-0.01em" }}
            >
              Ready to Train?
            </h2>
            <p className="text-blue-100 text-base mb-8">
              Pick your session and book online. Payment at booking. I&apos;ll confirm
              your time within 24 hours.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-ball-700 font-heading font-800 uppercase tracking-widest text-sm px-10 py-4 transition-colors"
            >
              Book a Lesson
              <ChevronRight className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="bg-navy-950 py-8">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-heading font-700 text-white text-sm uppercase tracking-widest">
            Ryan Ward Baseball
          </span>
          <a
            href="mailto:ryanknightward@gmail.com"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            ryanknightward@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
}

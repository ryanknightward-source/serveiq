"use client";

import Link from "next/link";
import {
  Check,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Crown,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Tier {
  key: string;
  name: string;
  price: number;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  popular?: boolean;
  cta: string;
}

const TIERS: Tier[] = [
  {
    key: "starter",
    name: "Starter",
    price: 99,
    tagline: "Everything you need to stop missing leads.",
    icon: Zap,
    features: [
      "AI lead response (SMS & email)",
      "Automatic review requests",
      "Up to 50 leads per month",
      "Business voice training",
      "Standard support",
    ],
    cta: "Start with Starter",
  },
  {
    key: "pro",
    name: "Pro",
    price: 199,
    tagline: "For growing crews that can't afford a cold pipeline.",
    icon: Sparkles,
    popular: true,
    features: [
      "Everything in Starter",
      "Smart quote follow-ups",
      "Cold lead re-engagement",
      "Unlimited leads",
      "SMS + email automation",
      "Priority email support",
    ],
    cta: "Start with Pro",
  },
  {
    key: "growth",
    name: "Growth",
    price: 349,
    tagline: "Purpose-built for multi-location service companies.",
    icon: Crown,
    features: [
      "Everything in Pro",
      "Advanced voice training",
      "Urgent escalation alerts",
      "Multi-location support",
      "Dedicated priority support",
      "Onboarding call + voice review",
    ],
    cta: "Start with Growth",
  },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "Is there a contract?",
    answer:
      "Nope — ServeIQ is month-to-month. We think the product should earn your business every 30 days, not lock you into a year you regret in the first week.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. You can cancel from your dashboard in two clicks and you'll keep access through the end of your current billing cycle. No phone call, no guilt trip.",
  },
  {
    question: "Does it work for both pest control and pool companies?",
    answer:
      "Yes. ServeIQ was built for both. Every response is grounded in the services, pricing, and tone you set up, so the AI understands whether it's quoting a quarterly pest treatment or a green-pool emergency call.",
  },
  {
    question: "What happens if the AI gets a question it can't answer?",
    answer:
      "It doesn't guess. If a message looks urgent (wasp in the house, green pool, booking emergencies) or mentions something outside your configured services, ServeIQ flags it, escalates it to you, and offers the customer a quick owner callback.",
  },
];

export default function PricingPage() {
  return (
    <AppShell title="Pricing">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <Badge variant="amber" className="normal-case tracking-normal">
            <Sparkles className="w-3 h-3 mr-1" />
            Simple, transparent pricing
          </Badge>
          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
            Plans that pay for themselves in one saved lead.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-500">
            One missed lead can cost more than a year of ServeIQ. Pick the plan
            that fits — upgrade, downgrade, or cancel any time.
          </p>
        </div>

        {/* Tiers */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {TIERS.map((tier) => (
            <TierCard key={tier.key} tier={tier} />
          ))}
        </div>

        {/* Reassurance strip */}
        <div className="mt-10 rounded-xl border border-gray-200 bg-white p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                14-day free trial, no credit card required
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Try any plan for two weeks — no card on file, no hoops. If
                ServeIQ doesn&apos;t earn its keep, just walk away.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/demo">
              See a live demo
              <ArrowRight />
            </Link>
          </Button>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              Frequently asked questions
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Can&apos;t find what you&apos;re looking for?{" "}
              <a
                href="mailto:ryanknightward@gmail.com"
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                Email us
              </a>{" "}
              — we read every message.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQS.map((faq) => (
              <Card key={faq.question}>
                <CardHeader className="px-5 py-4 pb-2">
                  <CardTitle className="text-[15px]">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-0">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function TierCard({ tier }: { tier: Tier }) {
  const Icon = tier.icon;

  return (
    <Card
      className={`relative flex flex-col h-full ${
        tier.popular
          ? "border-amber-300 shadow-xl shadow-amber-100 ring-1 ring-amber-100"
          : ""
      }`}
    >
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge
            variant="default"
            className="bg-amber-600 border-transparent text-white normal-case tracking-normal shadow-md shadow-amber-200"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="p-6 pb-4">
        <div
          className={`w-11 h-11 rounded-lg flex items-center justify-center ${
            tier.popular
              ? "bg-[#1a1a2e] text-amber-400 shadow-md shadow-gray-200"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <CardTitle className="mt-4 text-lg">{tier.name}</CardTitle>
        <CardDescription className="mt-1 text-[13px] text-gray-500 leading-relaxed">
          {tier.tagline}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 pt-2 flex-1 flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-semibold text-gray-900 tracking-tight">
            ${tier.price}
          </span>
          <span className="text-sm text-gray-500">/mo</span>
        </div>

        <ul className="mt-6 space-y-3 flex-1">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm">
              <Check
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  tier.popular ? "text-amber-600" : "text-emerald-500"
                }`}
              />
              <span className="text-gray-700 leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          asChild
          className={`mt-8 w-full ${
            tier.popular
              ? "bg-[#1a1a2e] hover:bg-[#2d2d4e] text-white shadow-md"
              : ""
          }`}
          variant={tier.popular ? "default" : "outline"}
        >
          <Link href="/setup">
            {tier.cta}
            <ArrowRight />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

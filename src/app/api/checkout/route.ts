/**
 * POST /api/checkout
 * Creates a Stripe Checkout Session and returns the redirect URL.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY  — from Stripe dashboard → Developers → API keys
 *   NEXT_PUBLIC_BASE_URL — e.g. https://ryanwardbaseball.com (or http://localhost:3000 locally)
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { LESSON_TYPES, type LessonTypeId } from "@/lib/types";

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe is not configured. Add STRIPE_SECRET_KEY to your environment." },
      { status: 503 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-07-29.dahlia",
  });

  let body: {
    bookingId: string;
    lessonTypeId: LessonTypeId;
    customerEmail: string;
    customerName: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { bookingId, lessonTypeId, customerEmail, customerName } = body;

  const lessonType = LESSON_TYPES[lessonTypeId];
  if (!lessonType) {
    return NextResponse.json({ error: "Invalid lesson type" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: lessonType.name,
              description: `Private baseball lesson with Ryan Ward · Coronado/San Diego, CA`,
            },
            unit_amount: lessonType.priceCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/book/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${baseUrl}/book/cancel?booking_id=${bookingId}`,
      metadata: {
        booking_id: bookingId,
        lesson_type_id: lessonTypeId,
        customer_name: customerName,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error("Stripe checkout error:", err);
    const message = err instanceof Stripe.errors.StripeError ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

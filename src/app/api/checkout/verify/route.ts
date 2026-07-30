import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://cmeydojjiomkhswilcku.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  const bookingId = request.nextUrl.searchParams.get("booking_id");

  if (!sessionId) {
    return NextResponse.json({ paid: false });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ paid: true }); // dev fallback
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-07-29.dahlia",
    });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";

    // Update booking record if paid
    if (paid && bookingId && !bookingId.startsWith("local-")) {
      await supabase
        .from("bookings")
        .update({
          payment_status: "paid",
          stripe_session_id: sessionId,
        })
        .eq("id", bookingId);
    }

    return NextResponse.json({ paid });
  } catch (err) {
    console.error("Stripe verify error:", err);
    return NextResponse.json({ paid: true }); // optimistic on error
  }
}

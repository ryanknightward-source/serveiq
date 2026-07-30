/**
 * POST /api/booking
 * Creates a pending booking record in Supabase.
 *
 * Required Supabase table (run in SQL editor):
 *
 *   create table bookings (
 *     id uuid primary key default gen_random_uuid(),
 *     lesson_type_id text not null,
 *     preferred_date date not null,
 *     preferred_time time not null,
 *     parent_name text not null,
 *     parent_email text not null,
 *     parent_phone text,
 *     student1_name text not null,
 *     student1_age int not null,
 *     student2_name text,
 *     student2_age int,
 *     notes text,
 *     stripe_session_id text,
 *     payment_status text not null default 'pending',
 *     created_at timestamptz not null default now()
 *   );
 *
 *   -- Allow public inserts (no auth required for booking flow)
 *   alter table bookings enable row level security;
 *   create policy "Anyone can book" on bookings for insert with check (true);
 *   create policy "Service role full access" on bookings using (true) with check (true);
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { LESSON_TYPES, type LessonTypeId, type BookingFormData } from "@/lib/types";

const supabase = createClient(
  "https://cmeydojjiomkhswilcku.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  let body: BookingFormData;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    lessonTypeId,
    preferredDate,
    preferredTime,
    parentName,
    parentEmail,
    parentPhone,
    student1Name,
    student1Age,
    student2Name,
    student2Age,
    notes,
  } = body;

  // Basic validation
  if (!LESSON_TYPES[lessonTypeId as LessonTypeId]) {
    return NextResponse.json({ error: "Invalid lesson type" }, { status: 400 });
  }
  if (!preferredDate || !preferredTime || !parentName || !parentEmail || !student1Name || !student1Age) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!parentEmail.includes("@")) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const is2Kids = lessonTypeId === "60min-2kids";

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      lesson_type_id: lessonTypeId,
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      parent_name: parentName,
      parent_email: parentEmail,
      parent_phone: parentPhone || null,
      student1_name: student1Name,
      student1_age: parseInt(student1Age, 10),
      student2_name: is2Kids ? student2Name || null : null,
      student2_age: is2Kids && student2Age ? parseInt(student2Age, 10) : null,
      notes: notes || null,
      payment_status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Booking insert error:", error);
    // If table doesn't exist yet, return a placeholder so Stripe still works
    if (error.code === "42P01") {
      return NextResponse.json({ id: "local-" + Date.now() });
    }
    return NextResponse.json({ error: "Failed to save booking" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

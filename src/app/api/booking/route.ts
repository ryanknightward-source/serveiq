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

const SUPABASE_URL = "https://cmeydojjiomkhswilcku.supabase.co";

export async function POST(request: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is not set");
    return NextResponse.json(
      { error: "Booking service is not configured. Contact the site owner." },
      { status: 503 }
    );
  }

  const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
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
  if (!parentEmail.includes("@") || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail.trim())) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Server-side input length limits
  if (typeof parentName !== "string" || parentName.trim().length > 100) {
    return NextResponse.json({ error: "Parent name must be under 100 characters" }, { status: 400 });
  }
  if (typeof parentEmail !== "string" || parentEmail.trim().length > 100) {
    return NextResponse.json({ error: "Email must be under 100 characters" }, { status: 400 });
  }
  if (parentPhone && (typeof parentPhone !== "string" || parentPhone.length > 20)) {
    return NextResponse.json({ error: "Phone number must be under 20 characters" }, { status: 400 });
  }
  if (typeof student1Name !== "string" || student1Name.trim().length > 100) {
    return NextResponse.json({ error: "Student name must be under 100 characters" }, { status: 400 });
  }
  if (notes && (typeof notes !== "string" || notes.length > 500)) {
    return NextResponse.json({ error: "Notes must be under 500 characters" }, { status: 400 });
  }

  // Age validation — must be integer 1-99
  const age1 = parseInt(String(student1Age), 10);
  if (isNaN(age1) || age1 < 1 || age1 > 99) {
    return NextResponse.json({ error: "Student age must be between 1 and 99" }, { status: 400 });
  }

  const is2Kids = lessonTypeId === "60min-2kids";

  if (is2Kids) {
    if (!student2Name || typeof student2Name !== "string" || student2Name.trim().length === 0) {
      return NextResponse.json({ error: "Student 2 name is required for 2-kid sessions" }, { status: 400 });
    }
    if (student2Name.trim().length > 100) {
      return NextResponse.json({ error: "Student 2 name must be under 100 characters" }, { status: 400 });
    }
    if (!student2Age) {
      return NextResponse.json({ error: "Student 2 age is required for 2-kid sessions" }, { status: 400 });
    }
    const age2 = parseInt(String(student2Age), 10);
    if (isNaN(age2) || age2 < 1 || age2 > 99) {
      return NextResponse.json({ error: "Student 2 age must be between 1 and 99" }, { status: 400 });
    }
  }

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
      student1_age: age1,
      student2_name: is2Kids ? student2Name || null : null,
      student2_age: is2Kids && student2Age ? parseInt(String(student2Age), 10) : null,
      notes: notes || null,
      payment_status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Booking insert error — code:", error.code, "message:", error.message, "details:", error.details, "hint:", error.hint);
    // Table doesn't exist yet — return a placeholder so Stripe still works in dev
    if (error.code === "42P01") {
      return NextResponse.json({ id: "local-" + Date.now() });
    }
    return NextResponse.json(
      { error: `Failed to save booking (${error.code}: ${error.message})` },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data.id });
}

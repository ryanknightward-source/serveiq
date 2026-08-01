/**
 * Temporary diagnostic route — DELETE after fixing env var issues.
 * GET /api/debug-env
 * Returns which environment variables are present (not their values).
 */
import { NextResponse } from "next/server";

export async function GET() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  return NextResponse.json({
    STRIPE_SECRET_KEY: stripeKey
      ? `present (starts with: ${stripeKey.slice(0, 8)}..., length: ${stripeKey.length})`
      : "MISSING",
    SUPABASE_SERVICE_ROLE_KEY: supabaseKey
      ? `present (starts with: ${supabaseKey.slice(0, 8)}..., length: ${supabaseKey.length})`
      : "MISSING",
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl
      ? `present (${supabaseUrl})`
      : "MISSING",
    NEXT_PUBLIC_BASE_URL: baseUrl
      ? `present (${baseUrl})`
      : "MISSING",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { sql, isValidEmail } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let payload: { email?: string; company?: string };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = payload.email?.trim().toLowerCase();

  // Honeypot: a hidden field real visitors never fill in. Bots that
  // auto-fill every field will trip this, and we quietly no-op.
  if (payload.company) {
    return NextResponse.json({ ok: true });
  }

  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  try {
    await sql`
      insert into subscribers (email, source)
      values (${email}, 'sovereign-dispatch')
      on conflict (email)
      do update set status = 'subscribed'
      where subscribers.status = 'unsubscribed'
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Newsletter signup failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again in a moment." },
      { status: 500 }
    );
  }
}

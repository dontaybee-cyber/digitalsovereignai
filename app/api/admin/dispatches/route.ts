import { NextRequest, NextResponse } from "next/server";
import { sql, type Dispatch } from "@/lib/db";
import { sendDispatch } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 60; // batched sends can take a few seconds per 90 recipients

// GET /api/admin/dispatches — all dispatches, newest first.
export async function GET() {
  try {
    const { rows } = await sql<Dispatch>`
      select * from dispatches order by created_at desc
    `;
    return NextResponse.json({ dispatches: rows });
  } catch (error) {
    console.error("Failed to load dispatches:", error);
    return NextResponse.json({ error: "Could not load dispatches." }, { status: 500 });
  }
}

// POST /api/admin/dispatches
// { subject, bodyText, action: 'draft' | 'send' }
export async function POST(request: NextRequest) {
  let payload: {
    subject?: string;
    bodyText?: string;
    action?: "draft" | "send";
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const subject = payload.subject?.trim();
  const bodyText = payload.bodyText?.trim();
  const action = payload.action ?? "draft";

  if (!subject || !bodyText) {
    return NextResponse.json(
      { error: "Subject and body are required." },
      { status: 400 }
    );
  }

  try {
    const { rows } = await sql<Dispatch>`
      insert into dispatches (subject, body_text, status)
      values (${subject}, ${bodyText}, 'draft')
      returning *
    `;
    const dispatch = rows[0];

    if (action === "send") {
      const { recipientCount } = await sendDispatch(dispatch.id);
      return NextResponse.json({ ok: true, recipientCount, status: "sent" });
    }

    return NextResponse.json({ ok: true, dispatch });
  } catch (error) {
    console.error("Failed to create dispatch:", error);
    return NextResponse.json({ error: "Could not save dispatch." }, { status: 500 });
  }
}

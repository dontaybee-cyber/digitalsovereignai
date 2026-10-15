import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

// One-click unsubscribe: every dispatch email links here with the
// recipient's personal token. No login, no confirmation page before the
// update — that's what CAN-SPAM and most mailbox providers (Gmail's
// List-Unsubscribe included) expect for a one-click unsubscribe.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${SITE_URL}/unsubscribed?status=error`);
  }

  try {
    const { rowCount } = await sql`
      update subscribers
      set status = 'unsubscribed'
      where unsubscribe_token = ${token}
    `;

    if (rowCount === 0) {
      return NextResponse.redirect(`${SITE_URL}/unsubscribed?status=error`);
    }

    return NextResponse.redirect(`${SITE_URL}/unsubscribed?status=ok`);
  } catch (error) {
    console.error("Unsubscribe failed:", error);
    return NextResponse.redirect(`${SITE_URL}/unsubscribed?status=error`);
  }
}

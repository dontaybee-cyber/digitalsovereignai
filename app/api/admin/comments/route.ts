import { NextRequest, NextResponse } from "next/server";
import { sql, type Comment } from "@/lib/db";

export const runtime = "nodejs";

// GET /api/admin/comments — all pending comments, oldest first.
export async function GET() {
  try {
    const { rows } = await sql<Comment>`
      select id, post_slug, parent_id, author_name, author_email, body, status, created_at
      from comments
      where status = 'pending'
      order by created_at asc
    `;

    return NextResponse.json({ comments: rows });
  } catch (error) {
    console.error("Failed to load pending comments:", error);
    return NextResponse.json(
      { error: "Could not load pending comments." },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/comments — { id, status: 'approved' | 'rejected' }
export async function PATCH(request: NextRequest) {
  let payload: { id?: string; status?: string };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { id, status } = payload;

  if (!id || (status !== "approved" && status !== "rejected")) {
    return NextResponse.json({ error: "Invalid id or status." }, { status: 400 });
  }

  try {
    await sql`
      update comments set status = ${status} where id = ${id}
    `;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update comment:", error);
    return NextResponse.json(
      { error: "Could not update comment." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { sql, type Comment } from "@/lib/db";

export const runtime = "nodejs";

const MAX_BODY_LENGTH = 2000;
const MAX_NAME_LENGTH = 80;

interface CommentThread extends Comment {
  replies: Comment[];
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug." }, { status: 400 });
  }

  try {
    const { rows } = await sql<Comment>`
      select id, post_slug, parent_id, author_name, body, status, created_at
      from comments
      where post_slug = ${slug} and status = 'approved'
      order by created_at asc
    `;

    // Nest replies (one level deep, matching the UI) under their parent.
    const topLevel = rows.filter((c) => !c.parent_id);
    const threads: CommentThread[] = topLevel.map((comment) => ({
      ...comment,
      replies: rows.filter((c) => c.parent_id === comment.id),
    }));

    return NextResponse.json({ comments: threads });
  } catch (error) {
    console.error("Failed to load comments:", error);
    return NextResponse.json(
      { error: "Could not load comments right now." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let payload: {
    postSlug?: string;
    parentId?: string;
    authorName?: string;
    authorEmail?: string;
    body?: string;
    company?: string; // honeypot
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (payload.company) {
    // Honeypot tripped — pretend success, do nothing.
    return NextResponse.json({ ok: true });
  }

  const postSlug = payload.postSlug?.trim();
  const authorName = payload.authorName?.trim();
  const body = payload.body?.trim();
  const parentId = payload.parentId?.trim() || null;
  const authorEmail = payload.authorEmail?.trim() || null;

  if (!postSlug || !authorName || !body) {
    return NextResponse.json(
      { error: "Name and comment are required." },
      { status: 400 }
    );
  }

  if (authorName.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: "Name is too long." }, { status: 400 });
  }

  if (body.length > MAX_BODY_LENGTH) {
    return NextResponse.json(
      { error: `Comments are limited to ${MAX_BODY_LENGTH} characters.` },
      { status: 400 }
    );
  }

  try {
    await sql`
      insert into comments (post_slug, parent_id, author_name, author_email, body, status)
      values (${postSlug}, ${parentId}, ${authorName}, ${authorEmail}, ${body}, 'pending')
    `;

    return NextResponse.json({
      ok: true,
      message: "Thanks — your comment is awaiting moderation.",
    });
  } catch (error) {
    console.error("Failed to post comment:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again in a moment." },
      { status: 500 }
    );
  }
}

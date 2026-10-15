import { NextRequest, NextResponse } from "next/server";
import { sql, type Dispatch } from "@/lib/db";
import { sendDispatch } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 60;

async function getDispatch(id: string): Promise<Dispatch | undefined> {
  const { rows } = await sql<Dispatch>`select * from dispatches where id = ${id}`;
  return rows[0];
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const dispatch = await getDispatch(params.id);
  if (!dispatch) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ dispatch });
}

// PATCH /api/admin/dispatches/:id — { subject?, bodyText?, action?: 'save' | 'send' }
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const dispatch = await getDispatch(params.id);
  if (!dispatch) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (dispatch.status === "sent") {
    return NextResponse.json(
      { error: "This dispatch has already been sent and can't be edited." },
      { status: 400 }
    );
  }

  let payload: {
    subject?: string;
    bodyText?: string;
    action?: "save" | "send";
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const action = payload.action ?? "save";
  const subject = payload.subject?.trim() ?? dispatch.subject;
  const bodyText = payload.bodyText?.trim() ?? dispatch.body_text;

  if (!subject || !bodyText) {
    return NextResponse.json(
      { error: "Subject and body are required." },
      { status: 400 }
    );
  }

  try {
    if (action === "send") {
      await sql`
        update dispatches
        set subject = ${subject}, body_text = ${bodyText}, updated_at = now()
        where id = ${params.id}
      `;
      const { recipientCount } = await sendDispatch(params.id);
      return NextResponse.json({ ok: true, recipientCount, status: "sent" });
    }

    // action === "save": update copy, keep current status as-is
    const { rows } = await sql<Dispatch>`
      update dispatches
      set subject = ${subject}, body_text = ${bodyText}, updated_at = now()
      where id = ${params.id}
      returning *
    `;
    return NextResponse.json({ ok: true, dispatch: rows[0] });
  } catch (error) {
    console.error("Failed to update dispatch:", error);
    return NextResponse.json({ error: "Could not update dispatch." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const dispatch = await getDispatch(params.id);
  if (!dispatch) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (dispatch.status === "sent") {
    return NextResponse.json(
      { error: "Sent dispatches can't be deleted." },
      { status: 400 }
    );
  }

  try {
    await sql`delete from dispatches where id = ${params.id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete dispatch:", error);
    return NextResponse.json({ error: "Could not delete dispatch." }, { status: 500 });
  }
}

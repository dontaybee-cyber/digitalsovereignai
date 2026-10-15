import { NextRequest, NextResponse } from "next/server";
import { sql, type Subscriber } from "@/lib/db";

export const runtime = "nodejs";

// GET /api/admin/subscribers           -> JSON list
// GET /api/admin/subscribers?format=csv -> CSV download
export async function GET(request: NextRequest) {
  try {
    const { rows } = await sql<Subscriber>`
      select email, status, source, created_at
      from subscribers
      order by created_at desc
    `;

    const format = request.nextUrl.searchParams.get("format");

    if (format === "csv") {
      const header = "email,status,source,created_at";
      const lines = rows.map(
        (r) => `${r.email},${r.status},${r.source ?? ""},${r.created_at}`
      );
      const csv = [header, ...lines].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="subscribers-${new Date()
            .toISOString()
            .slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({ subscribers: rows, count: rows.length });
  } catch (error) {
    console.error("Failed to load subscribers:", error);
    return NextResponse.json(
      { error: "Could not load subscribers." },
      { status: 500 }
    );
  }
}

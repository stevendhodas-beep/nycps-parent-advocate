import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const approved = body.approved_fields ?? [];
  return NextResponse.json({
    consent_id: body.consent_id,
    status: approved.length > 0 ? "approved" : "denied",
    approved_fields: approved,
    denied_fields: [],
    expires_at: "2026-03-26T00:00:00Z",
  });
}

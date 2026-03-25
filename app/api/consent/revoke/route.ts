import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json({ consent_id: body.consent_id, status: "revoked" });
}

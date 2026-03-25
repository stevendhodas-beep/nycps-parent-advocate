import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const SENSITIVE_FIELDS = new Set(["discipline_record", "mental_health_flags", "income_data"]);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const fieldsRequested: string[] = body.fields_requested ?? [];
  return NextResponse.json({
    consent_id: `consent-${randomBytes(6).toString("hex")}`,
    status: "pending",
    fields_requiring_explicit_consent: fieldsRequested.filter(f => SENSITIVE_FIELDS.has(f)),
    expires_at: "2026-03-26T00:00:00Z",
  });
}

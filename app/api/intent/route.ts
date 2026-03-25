import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.message || !body?.token) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 422 });
  }

  return NextResponse.json({
    run_id: randomUUID(),
    status: "completed",
    intent: body.message,
    workflows_executed: ["transfer_and_transition"],
    steps_completed: 4,
    steps_failed: 0,
    parent_coordinator_notified: false,
    summary:
      "Here's what we've set in motion for your child's transfer:\n\n" +
      "• Your new address qualifies for District 8. Nearby schools: PS 123, MS 456.\n" +
      "• Residency update submitted (ref: SIS-A1B2C3D4). District will confirm enrollment within 5 business days.\n" +
      "• Special Education records are being transferred (ref: IEP-E5F6G7H8). Expected in 3–5 business days.\n" +
      "• Medical conditions flagged for the new school nurse. They will contact you within 2 business days.\n\n" +
      "You will receive updates by SMS/email as each step is confirmed.",
    ambiguities: [],
    channel: body.channel ?? "app",
    mode: "preview",
  });
}

import { NextRequest, NextResponse } from "next/server";

const LANE1_CONTEXT = {
  grade_band: "9-10",
  borough_code: "BK",
  program_type: "General Education",
  engagement_trend: "improving",
  academic_band: "approaching_proficiency",
  interest_tags: ["robotics", "basketball", "art"],
  language_preference: "English",
  iep_flag_binary: true,
  ell_flag_binary: false,
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tool, token, parameters } = body;
  const lane = typeof token === "string" && token.startsWith("L2-") ? "lane2" : "lane1";

  if (tool === "get_student_context") {
    return NextResponse.json({
      context: LANE1_CONTEXT,
      lane,
      purpose: parameters?.purpose ?? "discovery",
      fields_returned: Object.keys(LANE1_CONTEXT),
    });
  }

  if (tool === "escalate_crisis") {
    const { randomBytes } = await import("crypto");
    return NextResponse.json({
      escalation_id: `ESC-${randomBytes(4).toString("hex").toUpperCase()}`,
      counselor_notified: true,
      eta_seconds: 60,
      fallback_hotline: "1-800-NYC-SAFE",
    });
  }

  if (tool === "request_consent") {
    const { randomBytes } = await import("crypto");
    return NextResponse.json({
      consent_id: `consent-${randomBytes(6).toString("hex")}`,
      status: "pending",
      fields_requiring_explicit_consent: ["discipline_record"],
      expires_at: "2026-03-26T00:00:00Z",
    });
  }

  return NextResponse.json({ tool, status: "ok", mode: "preview" });
}

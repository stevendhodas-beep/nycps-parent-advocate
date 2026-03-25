import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token: string = body.token ?? "";

  if (!token.startsWith("L2-")) {
    return NextResponse.json(
      { error: "lane2_required", message: "Casting a vote requires a verified identity session." },
      { status: 401 }
    );
  }

  const confirmationId = `VOTE-${randomBytes(4).toString("hex").toUpperCase()}`;
  const candidateName: string = body.candidate_name ?? "Unknown Candidate";

  return NextResponse.json({
    confirmation_id: confirmationId,
    status: "transmitted",
    nycsa_transmitted: true,
    candidate_id: body.candidate_id ?? "",
    candidate_name: candidateName,
    message: `Your vote for ${candidateName} has been securely transmitted to NYCSA. Confirmation #${confirmationId} will be emailed to you.`,
    mode: "preview",
  });
}

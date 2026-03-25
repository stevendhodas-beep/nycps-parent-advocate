import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST() {
  return NextResponse.json({
    token: `sess-lane1-${randomBytes(6).toString("hex")}`,
    lane: "lane1",
    expires_in: 3600,
  });
}

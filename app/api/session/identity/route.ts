import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST() {
  return NextResponse.json({
    token: `L2-lane2-${randomBytes(6).toString("hex")}`,
    lane: "lane2",
    expires_in: 900,
  });
}

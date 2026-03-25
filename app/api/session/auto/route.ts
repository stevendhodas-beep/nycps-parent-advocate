import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST() {
  return NextResponse.json({
    token: `L2-auto-${randomBytes(6).toString("hex")}`,
    lane: "lane2",
    expires_in: 900,
    account_found: true,
    display_name: "Alex Rivera",
    source: "nycsa_sso",
  });
}

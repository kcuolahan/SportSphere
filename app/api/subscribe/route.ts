import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { strongRate, filteredRate, totalPicks } from "@/lib/siteData";

const resend = new Resend(process.env.RESEND_API_KEY);
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID ?? "";
const FROM = "SportSphere HQ <picks@sportspherehq.com>";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function POST(req: NextRequest) {
  let email: string;
  try {
    const body = await req.json();
    email = (body.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY ?? "";
  if (!apiKey || apiKey.startsWith("your_") || apiKey === "re_placeholder") {
    console.error("RESEND_API_KEY is missing or placeholder");
    return NextResponse.json({ error: "Email service not configured — check back soon" }, { status: 503 });
  }

  try {
    // 1. Add to audience list (if audience ID is configured)
    if (AUDIENCE_ID) {
      const contactResult = await resend.contacts.create({
        email,
        audienceId: AUDIENCE_ID,
        unsubscribed: false,
      });
      console.log("Resend contact result:", JSON.stringify(contactResult));
    }

    // 2. Send confirmation email to subscriber
    const emailResult = await resend.emails.send({
      from: FROM,
      to: email,
      subject: "You're on the SportSphere HQ list",
      text: [
        "Welcome to SportSphere HQ — Australia's sharpest AFL disposal model.",
        "",
        "You'll get Round picks in your inbox each week before the games start.",
        "",
        `Model stats: ${strongRate}% HC win rate | ${filteredRate}% filtered win rate | ${totalPicks} picks tracked`,
        "",
        "We don't spam. One email per round, every Tuesday.",
        "",
        "— SportSphere HQ",
        "https://sportspherehq.com",
      ].join("\n"),
    });
    console.log("Resend email result:", JSON.stringify(emailResult));

    if (emailResult.error) {
      console.error("Resend email error:", JSON.stringify(emailResult.error));
      return NextResponse.json({ error: `Email failed: ${emailResult.error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Subscribe error (full):", message);

    // Resend returns a specific error for duplicate contacts
    if (message.includes("already exists") || message.includes("Contact already")) {
      return NextResponse.json({ success: true, note: "already_subscribed" });
    }

    return NextResponse.json({ error: `Subscribe failed: ${message}` }, { status: 500 });
  }
}

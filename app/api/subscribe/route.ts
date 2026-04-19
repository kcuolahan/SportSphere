import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID ?? "";
const FROM = "SportSphere <picks@sportsphere.com.au>";

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

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
  }

  try {
    // 1. Add to audience list (if audience ID is configured)
    if (AUDIENCE_ID) {
      await resend.contacts.create({
        email,
        audienceId: AUDIENCE_ID,
        unsubscribed: false,
      });
    }

    // 2. Send confirmation email to subscriber
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "You're on the SportSphere list",
      text: [
        "Welcome to SportSphere — Australia's sharpest AFL disposal model.",
        "",
        "You'll get Round picks in your inbox each week before the games start.",
        "",
        "Model stats: 58.8% filtered win rate | 66.7% STRONG tier | 457 picks tracked",
        "",
        "We don't spam. One email per round, every Tuesday.",
        "",
        "— SportSphere",
        "https://sport-sphere-ruddy.vercel.app",
      ].join("\n"),
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    // Resend returns a specific error for duplicate contacts
    if (message.includes("already exists") || message.includes("Contact already")) {
      // Still count as success — they're already subscribed
      return NextResponse.json({ success: true, note: "already_subscribed" });
    }

    console.error("Subscribe error:", message);
    return NextResponse.json({ error: "Failed to subscribe — please try again" }, { status: 500 });
  }
}

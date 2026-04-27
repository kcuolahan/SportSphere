import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { strongRate, filteredRate, totalPicks, strongPicks, filteredPicks, overallRate } from "@/lib/siteData";

const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID ?? "";
const FROM_PRIMARY = "SportSphere HQ <picks@sportspherehq.com>";
const FROM_FALLBACK = "SportSphere HQ <onboarding@resend.dev>";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function buildEmailBody(): string {
  return [
    "Welcome to SportSphere HQ — Australia's sharpest AFL disposal model.",
    "",
    "You'll get Round picks in your inbox each Tuesday before games start.",
    "",
    "Season track record:",
    `- HC tier: ${strongRate}% win rate (${strongPicks} picks)`,
    `- Filtered: ${filteredRate}% win rate (${filteredPicks} picks)`,
    `- Overall: ${overallRate}% (${totalPicks} picks)`,
    "",
    "Full analysis and picks: sportspherehq.com/predictions",
    "",
    "No spam. Unsubscribe anytime.",
    "— SportSphere HQ",
  ].join("\n");
}

async function sendEmail(resend: Resend, from: string, to: string): Promise<{ error: { message: string } | null }> {
  const result = await resend.emails.send({
    from,
    to,
    subject: "You're on the SportSphere HQ list 🏈",
    text: buildEmailBody(),
  });
  console.log(`Resend email result (from: ${from}):`, JSON.stringify(result));
  return result;
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

  const resend = new Resend(process.env.RESEND_API_KEY!)

  try {
    // 1. Add to audience list (if configured)
    if (AUDIENCE_ID) {
      const contactResult = await resend.contacts.create({
        email,
        audienceId: AUDIENCE_ID,
        unsubscribed: false,
      });
      console.log("Resend contact result:", JSON.stringify(contactResult));
    }

    // 2. Send confirmation — try verified domain, fall back to resend.dev
    let emailResult = await sendEmail(resend, FROM_PRIMARY, email);

    if (emailResult.error) {
      const msg = emailResult.error.message ?? "";
      const isDomainError = msg.toLowerCase().includes("domain") || msg.toLowerCase().includes("not verified") || msg.toLowerCase().includes("sender");
      if (isDomainError) {
        console.warn("Primary domain failed, retrying with fallback:", msg);
        emailResult = await sendEmail(resend, FROM_FALLBACK, email);
      }
    }

    if (emailResult.error) {
      console.error("Resend email error (both attempts):", JSON.stringify(emailResult.error));
      return NextResponse.json({ error: `Email failed: ${emailResult.error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Subscribe error (full):", message);

    if (message.includes("already exists") || message.includes("Contact already")) {
      return NextResponse.json({ success: true, note: "already_subscribed" });
    }

    return NextResponse.json({ error: `Subscribe failed: ${message}` }, { status: 500 });
  }
}

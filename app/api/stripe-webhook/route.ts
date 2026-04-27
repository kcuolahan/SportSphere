import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const runtime = "nodejs";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function sendWelcomeEmail(email: string) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    await resend.emails.send({
      from: "SportSphere HQ <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to SportSphere HQ Pro",
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:48px 24px;">
  <div style="text-align:center;margin-bottom:32px;">
    <div style="display:inline-block;background:#f97316;color:#000;font-weight:900;font-size:20px;padding:8px 16px;border-radius:4px;">SportSphere HQ</div>
  </div>
  <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:32px;text-align:center;margin-bottom:24px;">
    <div style="width:56px;height:56px;border-radius:50%;background:rgba(34,197,94,0.12);border:2px solid rgba(34,197,94,0.3);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:24px;">&#x2713;</div>
    <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0 0 12px;">You're in.</h1>
    <p style="color:#888;font-size:15px;margin:0 0 24px;line-height:1.6;">Pro access is now active. HC picks, DvP rankings, and the full model are all unlocked.</p>
    <a href="https://www.sportspherehq.com/predictions" style="display:inline-block;background:#f97316;color:#000;font-weight:800;font-size:15px;padding:14px 32px;border-radius:6px;text-decoration:none;">View This Round's Picks &rarr;</a>
  </div>
  <div style="color:#444;font-size:12px;text-align:center;line-height:1.7;">
    <p style="margin:0 0 6px;">Manage your subscription from your <a href="https://www.sportspherehq.com/dashboard" style="color:#666;text-decoration:none;">dashboard</a>.</p>
    <p style="margin:0;">Questions? <a href="mailto:support@sportspherehq.com" style="color:#666;text-decoration:none;">support@sportspherehq.com</a></p>
  </div>
</div>
</body></html>`,
    });
    console.log("Welcome email sent to:", email);
  } catch (err) {
    console.error("Welcome email failed:", err);
  }
}

export async function POST(req: Request) {
  console.log("=== STRIPE WEBHOOK CALLED ===");
  console.log("Has signature:", !!req.headers.get("stripe-signature"));
  console.log("Has webhook secret:", !!process.env.STRIPE_WEBHOOK_SECRET);
  console.log("Webhook secret prefix:", process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10));

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook error";
    console.error("Stripe webhook verification failed:", message);
    return new Response(`Webhook error: ${message}`, { status: 400 });
  }

  console.log("Stripe webhook event:", event.type);
  const supabase = getSupabaseAdmin();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email || session.customer_email;
    const subscriptionId = session.subscription as string;

    console.log("checkout.session.completed — email:", email, "subscriptionId:", subscriptionId);

    if (!email || !subscriptionId) {
      console.error("Missing email or subscriptionId — dropping event", { email, subscriptionId });
      return Response.json({ received: true });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const periodEnd = subscription.items?.data?.[0]?.current_period_end;
    const currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : null;

    const { error } = await supabase.from("user_profiles").upsert(
      {
        email,
        is_pro: true,
        pro_until: currentPeriodEnd?.toISOString() ?? null,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscriptionId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" },
    );

    if (error) {
      console.error("Supabase upsert failed:", error);
    } else {
      console.log("is_pro set to true for:", email);
      await sendWelcomeEmail(email);
    }
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;

    if (customerId) {
      const customer = await stripe.customers.retrieve(customerId);
      if (!customer.deleted) {
        const c = customer as Stripe.Customer;
        if (c.email) {
          const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
          const sub = subscriptions.data[0];
          const periodEnd = sub?.items?.data?.[0]?.current_period_end;
          const currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : null;

          await supabase.from("user_profiles").upsert(
            {
              email: c.email,
              is_pro: true,
              ...(currentPeriodEnd && { pro_until: currentPeriodEnd.toISOString() }),
              ...(sub?.id && { stripe_subscription_id: sub.id }),
              stripe_customer_id: customerId,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "email" },
          );
          console.log("invoice.paid — renewed is_pro for:", c.email);
        }
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    const customer = await stripe.customers.retrieve(customerId);
    if (!customer.deleted) {
      const c = customer as Stripe.Customer;
      if (c.email) {
        await supabase
          .from("user_profiles")
          .update({ is_pro: false, pro_until: null, updated_at: new Date().toISOString() })
          .eq("email", c.email);
        console.log("subscription.deleted — is_pro set to false for:", c.email);
      }
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;

    const customer = await stripe.customers.retrieve(customerId);
    if (!customer.deleted) {
      const c = customer as Stripe.Customer;
      if (c.email) {
        await supabase
          .from("user_profiles")
          .update({ is_pro: false, updated_at: new Date().toISOString() })
          .eq("email", c.email);
        console.log("invoice.payment_failed — is_pro set to false for:", c.email);
      }
    }
  }

  return Response.json({ received: true });
}

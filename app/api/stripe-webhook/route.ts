import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const runtime = "nodejs";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: Request) {
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

  const supabase = getSupabaseAdmin();

  if (event.type === "checkout.session.completed") {
    // In Stripe v22 the type lives under Stripe.Checkout.Session
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email;
    const subscriptionId = session.subscription as string;

    if (!email || !subscriptionId) {
      return Response.json({ received: true });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    // current_period_end is on the first SubscriptionItem in v22
    const periodEnd = subscription.items?.data?.[0]?.current_period_end;
    const currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : null;

    await supabase.from("user_profiles").upsert(
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
      }
    }
  }

  return Response.json({ received: true });
}

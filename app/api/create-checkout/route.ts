import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_IDS: Record<string, string | undefined> = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY,
  annual: process.env.STRIPE_PRICE_ID_ANNUAL,
};

export async function POST(req: Request) {
  try {
    const { plan, userEmail } = await req.json();

    const priceId = PRICE_IDS[plan as string];
    if (!priceId) {
      return Response.json({ error: `Unknown plan: ${plan}` }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: "https://www.sportspherehq.com/pro-welcome?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://www.sportspherehq.com/pricing",
      customer_email: userEmail || undefined,
      metadata: { source: "sportspherehq", plan },
      billing_address_collection: "auto",
      allow_promotion_codes: true,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

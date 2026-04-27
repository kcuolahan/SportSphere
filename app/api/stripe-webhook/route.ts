import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// CRITICAL: nodejs runtime required for raw body reading
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/*
Run this in Supabase SQL Editor if webhook upserts fail silently:

-- Check RLS policies on user_profiles
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- Grant service role full access (bypasses RLS)
CREATE POLICY IF NOT EXISTS "service_role_all"
ON public.user_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Verify upsert works manually
INSERT INTO user_profiles (email, is_pro, pro_until)
VALUES ('test@test.com', true, NOW() + INTERVAL '1 year')
ON CONFLICT (email) DO UPDATE SET is_pro = true;

-- Clean up
DELETE FROM user_profiles WHERE email = 'test@test.com';
*/

export async function POST(request: Request) {
  console.log('=== STRIPE WEBHOOK RECEIVED ===')

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-04-10' as any,
  })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  console.log('Body length:', body.length)
  console.log('Signature present:', !!sig)
  console.log('Webhook secret present:', !!process.env.STRIPE_WEBHOOK_SECRET)
  console.log('Webhook secret prefix:', process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10))

  if (!sig) {
    console.error('ERROR: No stripe-signature header')
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('ERROR: STRIPE_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    console.log('Event verified:', event.type, event.id)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook verification FAILED:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      console.log('Checkout session:', session.id)
      console.log('Payment status:', session.payment_status)

      const email =
        session.customer_details?.email ||
        session.customer_email ||
        null

      console.log('Customer email:', email)
      console.log('Customer ID:', session.customer)
      console.log('Subscription ID:', session.subscription)

      if (!email) {
        console.error('ERROR: No email found in session — attempting customer lookup')
        if (session.customer) {
          const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer
          console.log('Customer object email:', customer.email)
        }
        return NextResponse.json({ received: true, warning: 'no email' })
      }

      console.log('Upserting user_profiles for:', email)

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          email,
          is_pro: true,
          pro_until: new Date(Date.now() + 366 * 24 * 60 * 60 * 1000).toISOString(),
          stripe_customer_id: (session.customer as string) || null,
          stripe_subscription_id: (session.subscription as string) || null,
        }, {
          onConflict: 'email',
          ignoreDuplicates: false,
        })
        .select()

      if (error) {
        console.error('SUPABASE ERROR:', JSON.stringify(error))
        return NextResponse.json({ error: 'Database update failed', details: error }, { status: 500 })
      }

      console.log('SUCCESS: is_pro set for', email, 'data:', JSON.stringify(data))

      if (process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY)
          await resend.emails.send({
            from: 'SportSphere HQ <onboarding@resend.dev>',
            to: email,
            subject: 'Pro access active — SportSphere HQ',
            html: `
              <div style="max-width:560px;margin:0 auto;background:#0a0a0a;color:#ffffff;font-family:-apple-system,sans-serif;padding:48px 32px;">
                <div style="margin-bottom:32px;">
                  <span style="background:#f97316;color:#000;font-weight:900;font-size:16px;padding:6px 12px;border-radius:4px;">SportSphere HQ</span>
                </div>
                <h1 style="font-size:28px;font-weight:900;margin:0 0 16px 0;">Pro access is active.</h1>
                <p style="color:#888;font-size:16px;margin:0 0 32px 0;">
                  Your account is now live. HC picks are available now.
                </p>
                <a href="https://www.sportspherehq.com/predictions"
                   style="display:inline-block;background:#f97316;color:#000;font-weight:900;font-size:16px;padding:16px 32px;border-radius:6px;text-decoration:none;margin-bottom:32px;">
                  View This Round's Picks
                </a>
                <div style="border-top:1px solid #1a1a1a;padding-top:24px;color:#666;font-size:13px;">
                  <p style="margin:0 0 8px 0;">Every Thursday: picks go live when bookmaker lines release.</p>
                  <p style="margin:0 0 8px 0;">Every Monday: full results digest in your inbox.</p>
                  <p style="margin:0;">Questions? support@sportspherehq.com</p>
                </div>
                <p style="color:#444;font-size:11px;margin-top:24px;">Not financial advice. 18+ only. Gamble responsibly.</p>
              </div>
            `,
          })
          console.log('Welcome email sent to:', email)
        } catch (emailErr) {
          console.error('Email send failed (non-critical):', emailErr)
        }
      }
    }

    else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription
      const customer = await stripe.customers.retrieve(sub.customer as string) as Stripe.Customer

      if (customer.email) {
        await supabase
          .from('user_profiles')
          .update({ is_pro: false, updated_at: new Date().toISOString() })
          .eq('email', customer.email)
        console.log('Pro cancelled for:', customer.email)
      }
    }

    else if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice
      const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer

      if (customer.email) {
        await supabase
          .from('user_profiles')
          .update({
            is_pro: true,
            pro_until: new Date(Date.now() + 366 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('email', customer.email)
        console.log('Renewal confirmed for:', customer.email)
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

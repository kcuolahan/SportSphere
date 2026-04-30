'use client'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const FAQS = [
  {
    q: 'How do picks get generated?',
    a: 'A six-factor weighted model — season averages, opponent adjustment, TOG-adjusted rate, CBA form, play style, and conditions. Picks with Edge/Vol ≥ 0.50 and STRONG confidence are published as HC (High Conviction).',
  },
  {
    q: 'When are picks released?',
    a: 'Every Thursday when bookmaker lines come out. Pro subscribers get an email alert.',
  },
  {
    q: 'What is the track record?',
    a: '67.6% win rate on 71 HC picks across Rounds 3–7 of the 2026 season. $18,760 gross profit at $1,000 flat stake. All results verified against official AFL game data.',
  },
  {
    q: 'How much does it cost?',
    a: '$29/month. Cancel anytime. No annual contract.',
  },
  {
    q: 'Is this betting advice?',
    a: 'No. SportSphere provides analytics only. Past performance does not guarantee future results. 18+ only. Gamble responsibly. If gambling is affecting you or someone you know, call Gambling Help on 1800 858 858.',
  },
  {
    q: 'Can I cancel?',
    a: 'Yes, anytime via your Stripe customer portal. You keep access until the end of your billing period.',
  },
  {
    q: 'When does NBA launch?',
    a: 'October 2026. Included in your Pro subscription at no extra cost.',
  },
]

export default function FAQPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#f0f0f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Nav />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
            SportSphere HQ
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 12px' }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
            Everything you need to know about the model, the picks, and the subscription.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {FAQS.map(({ q, a }) => (
            <div
              key={q}
              style={{ borderBottom: '1px solid #111', padding: '24px 0' }}
            >
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', margin: '0 0 10px' }}>{q}</h2>
              <p style={{ fontSize: 14, color: '#888', margin: 0, lineHeight: 1.75 }}>{a}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 12, padding: '28px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: 15, color: '#888', margin: '0 0 16px' }}>
            Ready to get started? See this week&apos;s picks.
          </p>
          <Link
            href="/auth/payment"
            style={{
              display: 'inline-block', background: '#f97316', color: '#000',
              fontWeight: 800, fontSize: 15, textDecoration: 'none',
              padding: '12px 28px', borderRadius: 8,
            }}
          >
            Get Pro — $29/month
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}

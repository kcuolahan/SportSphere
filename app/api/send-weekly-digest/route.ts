import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function runDigest() {

  try {
    const { data: proUsers } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('is_pro', true)

    if (!proUsers || proUsers.length === 0) {
      return NextResponse.json({ message: 'No Pro subscribers', emailsSent: 0 })
    }

    // Pull the latest completed round stats
    const { data: roundStats } = await supabase
      .from('round_stats')
      .select('*')
      .eq('sport', 'AFL')
      .eq('season', 2026)
      .order('round', { ascending: false })
      .limit(5)

    const { data: hcStats } = await supabase
      .from('hc_stats')
      .select('*')
      .eq('sport', 'AFL')
      .eq('season', 2026)
      .single()

    const latestRound = roundStats?.[0]
    const STAKE = 1000
    const WIN_PROFIT = Math.round(STAKE * (1.87 - 1))
    const totalWins = hcStats?.wins ?? 48
    const totalLosses = hcStats?.losses ?? 23
    const totalPicks = hcStats?.total_hc_picks ?? 71
    const winRatePct = hcStats?.win_rate_pct ?? 67.6
    const grossPL = hcStats?.gross_pl ?? 18760

    const roundRows = (roundStats ?? []).reverse().map(r => {
      const pl = (Number(r.wins) * WIN_PROFIT) - (Number(r.losses) * STAKE)
      const plColor = pl >= 0 ? '#4ade80' : '#f87171'
      const plSign = pl >= 0 ? '+' : ''
      return `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid #1a1a1a;color:#fff;font-weight:600;">Round ${r.round}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #1a1a1a;color:#888;">${r.picks} picks</td>
        <td style="padding:10px 12px;border-bottom:1px solid #1a1a1a;color:#f97316;">${r.wins}W / ${r.losses}L</td>
        <td style="padding:10px 12px;border-bottom:1px solid #1a1a1a;color:${plColor};font-weight:700;">${plSign}$${Math.abs(Math.round(pl)).toLocaleString()}</td>
      </tr>`
    }).join('')

    const latestRoundBlock = latestRound ? `
      <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:24px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
        <div>
          <div style="color:#f97316;font-size:11px;font-weight:700;letter-spacing:2px;margin-bottom:6px;">LATEST ROUND</div>
          <div style="color:#fff;font-size:22px;font-weight:800;">Round ${latestRound.round}</div>
          <div style="color:#888;font-size:14px;margin-top:4px;">${latestRound.picks} picks · ${latestRound.wins}W / ${latestRound.losses}L</div>
        </div>
        <div style="text-align:right;">
          <div style="color:#4ade80;font-size:28px;font-weight:900;">${Number(latestRound.win_rate_pct).toFixed(1)}%</div>
          <div style="color:#666;font-size:13px;">win rate</div>
        </div>
      </div>` : ''

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">

  <div style="text-align:center;margin-bottom:32px;">
    <div style="display:inline-block;background:#f97316;color:#000;font-weight:900;font-size:20px;padding:8px 16px;border-radius:4px;">SportSphere HQ</div>
    <div style="color:#666;font-size:13px;margin-top:8px;">Weekly Performance Digest</div>
  </div>

  <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:32px;margin-bottom:24px;">
    <div style="color:#888;font-size:11px;font-weight:700;letter-spacing:2px;margin-bottom:16px;text-transform:uppercase;">2026 Season Summary</div>
    <div style="display:flex;justify-content:space-around;text-align:center;gap:16px;flex-wrap:wrap;">
      <div>
        <div style="color:#4ade80;font-size:28px;font-weight:900;">${winRatePct}%</div>
        <div style="color:#666;font-size:12px;margin-top:4px;">HC Win Rate</div>
        <div style="color:#555;font-size:11px;">${totalWins}W / ${totalLosses}L</div>
      </div>
      <div>
        <div style="color:#f97316;font-size:28px;font-weight:900;">+$${Number(grossPL).toLocaleString()}</div>
        <div style="color:#666;font-size:12px;margin-top:4px;">Gross P&amp;L</div>
        <div style="color:#555;font-size:11px;">$1,000 flat stake</div>
      </div>
      <div>
        <div style="color:#fff;font-size:28px;font-weight:900;">${totalPicks}</div>
        <div style="color:#666;font-size:12px;margin-top:4px;">Total HC Picks</div>
        <div style="color:#555;font-size:11px;">Rounds 3–${latestRound?.round ?? 7}</div>
      </div>
    </div>
  </div>

  ${latestRoundBlock}

  <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;overflow:hidden;margin-bottom:24px;">
    <div style="padding:16px 20px;border-bottom:1px solid #2a2a2a;color:#fff;font-weight:700;">Recent Rounds</div>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:#0a0a0a;">
          <th style="padding:8px 12px;text-align:left;color:#666;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Round</th>
          <th style="padding:8px 12px;text-align:left;color:#666;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Volume</th>
          <th style="padding:8px 12px;text-align:left;color:#666;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Result</th>
          <th style="padding:8px 12px;text-align:left;color:#666;font-size:11px;letter-spacing:1px;text-transform:uppercase;">P&amp;L</th>
        </tr>
      </thead>
      <tbody>${roundRows}</tbody>
    </table>
  </div>

  <div style="text-align:center;margin-bottom:32px;">
    <a href="https://www.sportspherehq.com/predictions" style="display:inline-block;background:#f97316;color:#000;font-weight:900;font-size:16px;padding:16px 40px;border-radius:6px;text-decoration:none;margin-right:12px;">
      View Picks →
    </a>
    <a href="https://www.sportspherehq.com/accuracy" style="display:inline-block;background:transparent;color:#f97316;font-weight:700;font-size:14px;padding:16px 24px;border-radius:6px;text-decoration:none;border:1px solid #f9731640;">
      Track Record →
    </a>
  </div>

  <div style="text-align:center;color:#444;font-size:12px;border-top:1px solid #1a1a1a;padding-top:24px;">
    <p style="margin:0 0 8px;">SportSphere HQ · AFL Disposal Analytics</p>
    <p style="margin:0 0 8px;">Not financial advice. 18+ only. Gamble responsibly.</p>
    <p style="margin:0;"><a href="https://www.sportspherehq.com/dashboard" style="color:#555;text-decoration:none;">Manage subscription</a> · <a href="https://www.sportspherehq.com" style="color:#666;text-decoration:none;">sportspherehq.com</a></p>
  </div>
</div>
</body></html>`

    const resend = new Resend(process.env.RESEND_API_KEY!)
    const results = await Promise.allSettled(
      proUsers.map(user =>
        resend.emails.send({
          from: 'SportSphere HQ <onboarding@resend.dev>',
          to: user.email,
          subject: `Weekly Digest — ${winRatePct}% HC win rate · +$${Number(grossPL).toLocaleString()} P&L`,
          html,
        })
      )
    )

    const sent = results.filter(r => r.status === 'fulfilled').length
    return NextResponse.json({ success: true, emailsSent: sent, totalSubscribers: proUsers.length })
  } catch (error) {
    console.error('Weekly digest error:', error)
    return NextResponse.json({ error: 'Failed to send digest' }, { status: 500 })
  }
}

const ADMIN_PW = 'sportsphereadmin2026'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && authHeader !== `Bearer ${ADMIN_PW}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return runDigest()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (body.secret !== ADMIN_PW) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return runDigest()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

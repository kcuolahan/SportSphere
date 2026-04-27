import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { roundNumber, secret } = await request.json()

    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all Pro subscribers
    const { data: proUsers } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('is_pro', true)

    if (!proUsers || proUsers.length === 0) {
      return NextResponse.json({ message: 'No Pro subscribers to email', emailsSent: 0 })
    }

    // Get HC picks for this round ordered by E/V
    const { data: picks } = await supabase
      .from('live_picks')
      .select('*')
      .eq('round', roundNumber)
      .eq('tier', 'HC')
      .order('edge_vol', { ascending: false })

    const pickCount = picks?.length ?? 0
    const topPick = picks?.[0]

    const picksRows = (picks ?? []).map(pick => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #2a2a2a;color:#ffffff;font-weight:700;">${pick.player_name}</td>
        <td style="padding:12px;border-bottom:1px solid #2a2a2a;color:#888888;">${pick.team} · ${pick.position}</td>
        <td style="padding:12px;border-bottom:1px solid #2a2a2a;color:#f97316;font-weight:700;">${pick.prediction} ${pick.line}</td>
        <td style="padding:12px;border-bottom:1px solid #2a2a2a;color:#4ade80;">E/V ${Number(pick.edge_vol).toFixed(2)}</td>
      </tr>`).join('')

    const topPickBlock = topPick ? `
      <div style="background:#1a1a1a;border:1px solid #f97316;border-radius:8px;padding:24px;margin-bottom:24px;">
        <div style="color:#f97316;font-size:11px;font-weight:700;letter-spacing:2px;margin-bottom:12px;">TOP PICK THIS ROUND</div>
        <div style="display:flex;justify-content:space-between;">
          <div>
            <div style="color:#ffffff;font-size:20px;font-weight:700;">${topPick.player_name}</div>
            <div style="color:#888888;font-size:14px;">${topPick.team} · ${topPick.position}</div>
          </div>
          <div style="text-align:right;">
            <div style="color:#f97316;font-size:22px;font-weight:900;">${topPick.prediction} ${topPick.line}</div>
            <div style="color:#4ade80;font-size:14px;">E/V ${Number(topPick.edge_vol).toFixed(2)}</div>
          </div>
        </div>
      </div>` : ''

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">

  <div style="text-align:center;margin-bottom:32px;">
    <div style="display:inline-block;background:#f97316;color:#000;font-weight:900;font-size:20px;padding:8px 16px;border-radius:4px;">SportSphere HQ</div>
  </div>

  <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:32px;margin-bottom:24px;text-align:center;">
    <div style="color:#f97316;font-size:12px;font-weight:700;letter-spacing:2px;margin-bottom:8px;">ROUND ${roundNumber} · 2026 AFL SEASON</div>
    <h1 style="color:#fff;font-size:28px;font-weight:900;margin:0 0 8px;">${pickCount} HC Pick${pickCount !== 1 ? 's' : ''} Are Live</h1>
    <p style="color:#888;margin:0;font-size:16px;">High Conviction picks for Round ${roundNumber} are ready.</p>
  </div>

  ${topPickBlock}

  <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;overflow:hidden;margin-bottom:24px;">
    <div style="padding:16px 20px;border-bottom:1px solid #2a2a2a;color:#fff;font-weight:700;">All Round ${roundNumber} HC Picks</div>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:#0a0a0a;">
          <th style="padding:10px 12px;text-align:left;color:#666;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Player</th>
          <th style="padding:10px 12px;text-align:left;color:#666;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Team</th>
          <th style="padding:10px 12px;text-align:left;color:#666;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Pick</th>
          <th style="padding:10px 12px;text-align:left;color:#666;font-size:11px;letter-spacing:1px;text-transform:uppercase;">E/V</th>
        </tr>
      </thead>
      <tbody>${picksRows}</tbody>
    </table>
  </div>

  <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:24px;margin-bottom:24px;">
    <div style="color:#888;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">2026 Season Track Record</div>
    <table style="width:100%;border-collapse:collapse;text-align:center;">
      <tr>
        <td style="padding:8px;"><div style="color:#4ade80;font-size:24px;font-weight:900;">67.6%</div><div style="color:#666;font-size:12px;">HC Win Rate</div></td>
        <td style="padding:8px;"><div style="color:#f97316;font-size:24px;font-weight:900;">$18,760</div><div style="color:#666;font-size:12px;">Gross P&L</div></td>
        <td style="padding:8px;"><div style="color:#fff;font-size:24px;font-weight:900;">71</div><div style="color:#666;font-size:12px;">HC Picks</div></td>
      </tr>
    </table>
  </div>

  <div style="text-align:center;margin-bottom:32px;">
    <a href="https://www.sportspherehq.com/predictions" style="display:inline-block;background:#f97316;color:#000;font-weight:900;font-size:16px;padding:16px 40px;border-radius:6px;text-decoration:none;">
      View All Picks →
    </a>
  </div>

  <div style="text-align:center;color:#444;font-size:12px;border-top:1px solid #1a1a1a;padding-top:24px;">
    <p style="margin:0 0 8px;">SportSphere HQ · AFL Disposal Analytics</p>
    <p style="margin:0 0 8px;">Not financial advice. 18+ only. Gamble responsibly.</p>
    <p style="margin:0;"><a href="https://www.sportspherehq.com" style="color:#666;text-decoration:none;">sportspherehq.com</a></p>
  </div>
</div>
</body></html>`

    const resend = new Resend(process.env.RESEND_API_KEY!)
    const results = await Promise.allSettled(
      proUsers.map(user =>
        resend.emails.send({
          from: 'SportSphere HQ <onboarding@resend.dev>',
          to: user.email,
          subject: `Round ${roundNumber} HC Picks Are Live — ${pickCount} picks ready`,
          html,
        })
      )
    )

    const sent = results.filter(r => r.status === 'fulfilled').length

    await supabase
      .from('rounds')
      .update({ picks_alert_sent_at: new Date().toISOString() })
      .eq('round_number', roundNumber)
      .eq('sport', 'AFL')

    return NextResponse.json({ success: true, emailsSent: sent, pickCount })
  } catch (error) {
    console.error('Email alert error:', error)
    return NextResponse.json({ error: 'Failed to send alerts' }, { status: 500 })
  }
}

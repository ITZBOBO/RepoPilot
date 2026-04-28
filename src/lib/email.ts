import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// The from address must match a domain you've verified in Resend.
// Set RESEND_FROM_EMAIL in your .env (e.g. "RepoPilot <hello@repopilot.com>")
const FROM = process.env.RESEND_FROM_EMAIL ?? 'RepoPilot <onboarding@resend.dev>'

// ─── Welcome Email ─────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, githubUsername: string) {
  if (!process.env.RESEND_API_KEY) return // silently skip if not configured

  await resend.emails.send({
    from:    FROM,
    to,
    subject: `Welcome to RepoPilot, @${githubUsername} 🚀`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#050A15;font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;color:#E2E8F0;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:40px;">
      <div style="display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,rgba(99,102,241,.15),rgba(34,211,238,.08));border:1px solid rgba(99,102,241,.25);border-radius:16px;padding:14px 24px;">
        <span style="font-size:22px;font-weight:900;background:linear-gradient(135deg,#6366F1,#22D3EE);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">✦ RepoPilot</span>
      </div>
    </div>

    <!-- Hero -->
    <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(99,102,241,.2);border-radius:20px;padding:36px;margin-bottom:24px;">
      <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
        Welcome aboard, @${githubUsername} 👋
      </h1>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#94A3B8;">
        You're now connected to RepoPilot. Here's what you can do right now to build a portfolio that actually gets you hired:
      </p>

      <!-- Steps -->
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${[
          ['💡', 'Get AI project suggestions', 'Tell us your stack and goals — we\'ll generate 3 tailored project ideas.'],
          ['📅', 'Set up a commit scheduler', 'Automate daily commits to keep your GitHub streak alive and your history active.'],
          ['🛡️', 'Enable Streak Shield', 'Never lose your streak again. RepoPilot will cover for you if you miss a day.'],
        ].map(([icon, title, desc]) => `
          <div style="display:flex;gap:14px;padding:14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;">
            <span style="font-size:20px;flex-shrink:0;">${icon}</span>
            <div>
              <div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:3px;">${title}</div>
              <div style="font-size:12px;color:#64748B;line-height:1.5;">${desc}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${process.env.NEXTAUTH_URL ?? 'https://repopilot.com'}/dashboard"
         style="display:inline-block;padding:16px 36px;background:linear-gradient(135deg,#6366F1,#22D3EE);border-radius:14px;color:#fff;font-weight:800;font-size:15px;text-decoration:none;letter-spacing:-0.3px;">
        Open Your Dashboard ✦
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;font-size:12px;color:#334155;line-height:1.6;">
      You're receiving this because you signed in to RepoPilot with GitHub.<br>
      RepoPilot · Built for developers who want to get hired.
    </div>
  </div>
</body>
</html>`,
  })
}

// ─── Streak Warning Email ───────────────────────────────────────────────────────

export async function sendStreakWarningEmail(to: string, githubUsername: string) {
  if (!process.env.RESEND_API_KEY) return

  const dashboardUrl = `${process.env.NEXTAUTH_URL ?? 'https://repopilot.com'}/dashboard`
  const shieldUrl    = `${process.env.NEXTAUTH_URL ?? 'https://repopilot.com'}/settings`

  await resend.emails.send({
    from:    FROM,
    to,
    subject: `⚠️ @${githubUsername} — you haven't committed today`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#050A15;font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;color:#E2E8F0;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.25);border-radius:16px;padding:14px 24px;">
        <span style="font-size:18px;">⚠️</span>
        <span style="font-size:18px;font-weight:800;color:#FBBF24;">Streak Warning</span>
      </div>
    </div>

    <!-- Body -->
    <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(245,158,11,.2);border-radius:20px;padding:36px;margin-bottom:24px;">
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
        Your streak is in danger, @${githubUsername} 🔥
      </h1>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#94A3B8;">
        It's past 7 PM and we can't see any commits from you today. Your GitHub streak could break at midnight if you don't push something.
      </p>

      <div style="padding:16px;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:12px;margin-bottom:24px;">
        <div style="font-size:13px;font-weight:700;color:#FBBF24;margin-bottom:8px;">What you can do right now:</div>
        <ul style="margin:0;padding-left:20px;font-size:13px;color:#94A3B8;line-height:1.8;">
          <li>Push a small fix or doc update to any repo</li>
          <li>Run a <strong style="color:#fff;">RepoPilot Scheduler</strong> to auto-commit</li>
          <li>Enable <strong style="color:#fff;">Streak Shield</strong> so this never happens again</li>
        </ul>
      </div>

      <div style="display:flex;gap:12px;">
        <a href="${dashboardUrl}" style="flex:1;display:block;text-align:center;padding:14px;background:linear-gradient(135deg,#6366F1,#22D3EE);border-radius:12px;color:#fff;font-weight:700;font-size:14px;text-decoration:none;">
          Run a Scheduler Now
        </a>
        <a href="${shieldUrl}" style="flex:1;display:block;text-align:center;padding:14px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3);border-radius:12px;color:#FBBF24;font-weight:700;font-size:14px;text-decoration:none;">
          Enable Streak Shield
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;font-size:12px;color:#334155;line-height:1.6;">
      You're getting this because your Streak Shield is off.<br>
      <a href="${shieldUrl}" style="color:#475569;text-decoration:underline;">Enable Shield</a> to never worry about this again.
    </div>
  </div>
</body>
</html>`,
  })
}

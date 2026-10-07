import { env } from "../config/env.js";
import { logger } from "./logger.js";

/**
 * Account mail through Resend's HTTP API.
 *
 * RESEND_API_KEY turns sending on. Without it nothing is sent and the magic link
 * falls back to the dev token, so local work still runs. MAIL_FROM defaults to the
 * johanthegoat.xyz sender, which is verified in Resend and reaches any inbox.
 */

const RESEND_URL = "https://api.resend.com/emails";

export function mailIsConfigured(): boolean {
  return Boolean(env.RESEND_API_KEY);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function send(to: string, subject: string, text: string, html: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;

  try {
    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: env.MAIL_FROM, to: [to], subject, text, html }),
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) {
      const body = (await response.json().catch(() => ({}))) as { id?: string };
      logger.info({ providerId: body.id }, "Mail sent");
      return true;
    }

    const detail = await response.text().catch(() => "");
    logger.error({ status: response.status, detail: detail.slice(0, 200) }, "Mail rejected");
  } catch (error) {
    logger.error({ error: (error as Error).message }, "Mail provider unreachable");
  }
  return false;
}

export async function sendMagicLinkEmail(to: string, link: string, ttlMinutes: number): Promise<boolean> {
  const intro = `Use this link to sign in to FairDev. It works once and expires in ${ttlMinutes} minutes.`;
  const note = "If you did not ask to sign in, ignore this message.";

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;color:#1a1a1a">
      <h1 style="font-size:20px;margin:0 0 12px">Sign in to FairDev</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 0 20px">${escapeHtml(intro)}</p>
      <p style="margin:0 0 20px">
        <a href="${escapeHtml(link)}"
           style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;
                  padding:12px 22px;border-radius:6px;font-weight:600">Sign in</a>
      </p>
      <p style="font-size:13px;color:#555;line-height:1.6;margin:0">
        ${escapeHtml(note)}<br>If the button does not work, paste this into your browser:<br>
        <span style="word-break:break-all">${escapeHtml(link)}</span>
      </p>
    </div>
  `.trim();

  return send(to, "Your FairDev sign-in link", `${intro}\n\n${link}\n\n${note}`, html);
}

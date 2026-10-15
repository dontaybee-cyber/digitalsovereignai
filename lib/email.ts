import { Resend } from "resend";
import { sql, type Dispatch, type Subscriber } from "@/lib/db";
import { SITE_NAME, SITE_URL, COMPANY_POSTAL_ADDRESS } from "@/lib/site";

// Resend's batch endpoint accepts up to 100 messages per call. We stay a
// little under that so one slow/odd request never brushes the real limit.
const BATCH_SIZE = 90;

let client: Resend | null = null;

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to your environment before sending a dispatch."
    );
  }
  if (!client) client = new Resend(apiKey);
  return client;
}

function getFromAddress(): string {
  return process.env.DISPATCH_FROM_EMAIL || `${SITE_NAME} <dispatch@digitalsovereignai.com>`;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Turns plain-text dispatch copy into paragraphs: a blank line starts a
 * new <p>, a single line break becomes <br>. Everything is HTML-escaped
 * first, so the composer can stay a plain textarea with no injection risk.
 */
function renderBodyHtml(bodyText: string): string {
  return bodyText
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => escapeHtml(paragraph.trim()).replace(/\n/g, "<br>"))
    .map((paragraph) => `<p style="margin: 0 0 20px; line-height: 1.6;">${paragraph}</p>`)
    .join("\n");
}

/**
 * Renders the full HTML email. Inline styles throughout — email clients
 * strip <style> blocks unpredictably, so every rule that matters lives on
 * the element itself.
 */
export function renderDispatchEmail({
  subject,
  bodyText,
  unsubscribeUrl,
}: {
  subject: string;
  bodyText: string;
  unsubscribeUrl: string;
}): string {
  const bodyHtml = renderBodyHtml(bodyText);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 10px; overflow: hidden;">
            <tr>
              <td style="background-color: #0B0B0E; padding: 24px 32px;">
                <span style="color: #F3F4F6; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;">
                  ${escapeHtml(SITE_NAME)}
                </span>
                <div style="color: #9CA3AF; font-size: 12px; margin-top: 2px;">The Sovereign Dispatch</div>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px;">
                <h1 style="margin: 0 0 20px; font-size: 20px; line-height: 1.3; color: #0B0B0E;">
                  ${escapeHtml(subject)}
                </h1>
                <div style="font-size: 15px; color: #27272a;">
                  ${bodyHtml}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 32px 32px;">
                <a href="${SITE_URL}" style="display: inline-block; background-color: #0077B6; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 6px;">
                  Read on the Journal
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 32px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
                <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; line-height: 1.6;">
                  You're receiving this because you subscribed to the Sovereign Dispatch at ${escapeHtml(
                    SITE_NAME
                  )}.
                  <a href="${unsubscribeUrl}" style="color: #71717a; text-decoration: underline;">Unsubscribe</a>
                </p>
                <p style="margin: 0; font-size: 11px; color: #a1a1aa; line-height: 1.6;">
                  ${escapeHtml(COMPANY_POSTAL_ADDRESS)}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildUnsubscribeUrl(token: string): string {
  return `${SITE_URL}/api/unsubscribe?token=${encodeURIComponent(token)}`;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Sends a dispatch to every currently-subscribed address and marks it
 * sent. Called directly from the admin "Send now" action. Throws if the
 * dispatch doesn't exist or has already been sent — callers should catch
 * and surface that rather than silently resending.
 */
export async function sendDispatch(dispatchId: string): Promise<{ recipientCount: number }> {
  const { rows: dispatchRows } = await sql<Dispatch>`
    select * from dispatches where id = ${dispatchId}
  `;
  const dispatch = dispatchRows[0];

  if (!dispatch) {
    throw new Error("Dispatch not found.");
  }
  if (dispatch.status === "sent") {
    throw new Error("This dispatch has already been sent.");
  }

  const { rows: subscribers } = await sql<Subscriber>`
    select * from subscribers where status = 'subscribed'
  `;

  const resend = getResendClient();
  const from = getFromAddress();
  const batches = chunk(subscribers, BATCH_SIZE);
  let sentCount = 0;

  for (const batch of batches) {
    const messages = batch.map((subscriber) => ({
      from,
      to: [subscriber.email],
      subject: dispatch.subject,
      html: renderDispatchEmail({
        subject: dispatch.subject,
        bodyText: dispatch.body_text,
        unsubscribeUrl: buildUnsubscribeUrl(subscriber.unsubscribe_token),
      }),
    }));

    try {
      const { error } = await resend.batch.send(messages);
      if (error) {
        console.error(`Dispatch ${dispatchId}: batch send failed:`, error);
        continue;
      }
      sentCount += batch.length;
    } catch (err) {
      console.error(`Dispatch ${dispatchId}: batch send threw:`, err);
    }
  }

  await sql`
    update dispatches
    set status = 'sent', sent_at = now(), recipient_count = ${sentCount}, updated_at = now()
    where id = ${dispatchId}
  `;

  return { recipientCount: sentCount };
}

import type { NotificationEventKey } from "@/lib/communications/events";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderTradeTuterEmail({
  recipientName,
  subject,
  body,
  eventKey,
  actionUrl,
}: {
  recipientName: string;
  subject: string;
  body: string;
  eventKey: NotificationEventKey | string;
  actionUrl?: string;
}) {
  const safeActionUrl = escapeHtml(
    actionUrl ?? "https://tradetuter.local/portal",
  );
  return `<!doctype html>
<html><body style="margin:0;background:#f3f4f4;font-family:Inter,Arial,sans-serif;color:#27311f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:600px;background:#fff;border-radius:18px;overflow:hidden">
<tr><td style="padding:24px 30px;background:linear-gradient(135deg,#34452a,#78866b);color:#fff"><strong style="font-size:22px">Drive the Market</strong><div style="color:#d9dfd4;font-size:12px;margin-top:4px">Trading education, delivered clearly</div></td></tr>
<tr><td style="padding:30px"><p style="margin-top:0">Hello ${escapeHtml(recipientName)},</p><h1 style="font-size:24px">${escapeHtml(subject)}</h1><p style="line-height:1.7;color:#52604a">${escapeHtml(body)}</p><a href="${safeActionUrl}" style="display:inline-block;margin-top:12px;padding:12px 18px;border-radius:10px;background:#5d704f;color:#fff;text-decoration:none">Open Drive the Market</a><p style="margin-top:28px;font-size:11px;color:#899184">Notification: ${escapeHtml(eventKey)}</p></td></tr>
</table></td></tr></table></body></html>`;
}

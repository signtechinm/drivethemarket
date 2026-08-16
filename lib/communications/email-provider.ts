import "server-only";

import nodemailer from "nodemailer";

import { getServerEnvironment } from "@/lib/env/server";
import { logger } from "@/lib/logger";

export async function sendTransactionalEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const provider = getServerEnvironment().EMAIL_PROVIDER;
  if (provider === "log") {
    logger.info(
      { event: "email.delivery.mock", subject, contentBytes: html.length },
      "Development email accepted by log provider",
    );
    return { success: true as const };
  }
  const environment = getServerEnvironment();
  if (provider === "gmail") {
    if (!environment.GMAIL_USER || !environment.GMAIL_APP_PASSWORD)
      return {
        success: false as const,
        error: "Gmail address or App Password is not configured.",
      };
    try {
      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: environment.GMAIL_USER,
          pass: environment.GMAIL_APP_PASSWORD.replaceAll(" ", ""),
        },
      });
      await transport.sendMail({
        from: environment.EMAIL_FROM ?? environment.GMAIL_USER,
        to,
        subject,
        html,
      });
      return { success: true as const };
    } catch (error) {
      logger.error(
        { error: error instanceof Error ? error.message : String(error) },
        "Gmail SMTP delivery failed",
      );
      return {
        success: false as const,
        error: "Gmail SMTP delivery failed.",
      };
    }
  }
  if (
    !environment.EMAIL_API_URL ||
    !environment.EMAIL_API_TOKEN ||
    !environment.EMAIL_FROM
  )
    return {
      success: false as const,
      error: "Transactional email credentials are incomplete.",
    };
  try {
    const response = await fetch(environment.EMAIL_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${environment.EMAIL_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: environment.EMAIL_FROM,
        to: [to],
        subject,
        html,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok)
      return {
        success: false as const,
        error: `Email provider returned HTTP ${response.status}.`,
      };
    return { success: true as const };
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Transactional email request failed",
    );
    return {
      success: false as const,
      error: "Transactional email request failed.",
    };
  }
}

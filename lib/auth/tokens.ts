import "server-only";

import { createHash, randomBytes } from "node:crypto";

export const INVITATION_TTL_HOURS = 72;
export const PASSWORD_RESET_TTL_MINUTES = 30;

export function createOpaqueToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashOpaqueToken(token) };
}

export function hashOpaqueToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function expiresInHours(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export function expiresInMinutes(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

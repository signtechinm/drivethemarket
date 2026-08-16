import { createHmac, timingSafeEqual } from "node:crypto";

export interface MaterialAccessClaims {
  materialId: string;
  userId: string;
  expiresAt: number;
}

function signature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createMaterialAccessToken(
  claims: Omit<MaterialAccessClaims, "expiresAt">,
  secret: string,
  now = Date.now(),
  ttlSeconds = 5 * 60,
) {
  const payload = Buffer.from(
    JSON.stringify({ ...claims, expiresAt: now + ttlSeconds * 1000 }),
  ).toString("base64url");
  return `${payload}.${signature(payload, secret)}`;
}

export function verifyMaterialAccessToken(
  token: string,
  secret: string,
  now = Date.now(),
): MaterialAccessClaims | null {
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) return null;
  const expectedSignature = signature(payload, secret);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  )
    return null;
  try {
    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as MaterialAccessClaims;
    if (
      !claims.materialId ||
      !claims.userId ||
      !Number.isFinite(claims.expiresAt) ||
      claims.expiresAt < now
    )
      return null;
    return claims;
  } catch {
    return null;
  }
}

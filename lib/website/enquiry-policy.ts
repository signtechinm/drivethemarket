export function isLikelySpamSubmission({
  honeypot,
  startedAt,
  now = Date.now(),
}: {
  honeypot: string;
  startedAt: number;
  now?: number;
}) {
  const elapsed = now - startedAt;
  return (
    Boolean(honeypot) ||
    !Number.isFinite(elapsed) ||
    elapsed < 2_000 ||
    elapsed > 60 * 60 * 1000
  );
}

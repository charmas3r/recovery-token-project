/**
 * Google reCAPTCHA v3 Verification
 *
 * Server-side token verification against Google's siteverify endpoint.
 * v3 returns a 0.0-1.0 score rather than a pass/fail, so the threshold below
 * decides what counts as a bot.
 *
 * Fails open when unconfigured or when Google is unreachable — losing real
 * customer inquiries to an outage is worse than letting some spam through.
 * See docs/superpowers/specs/2026-08-05-recaptcha-v3-contact-design.md
 */

const SITEVERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

/**
 * Google's default threshold. Scores below this are treated as bots.
 * Every verification logs its score, so this can be tuned against real traffic.
 */
const MIN_SCORE = 0.5;

/** Give up on Google rather than holding the request open indefinitely. */
const TIMEOUT_MS = 5000;

type FailureReason =
  | 'not-configured'
  | 'missing-token'
  | 'invalid-token'
  | 'action-mismatch'
  | 'low-score'
  | 'network-error';

export type RecaptchaResult =
  | {ok: true; score?: number; skipped?: boolean}
  | {ok: false; reason: FailureReason; score?: number};

interface SiteVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

interface RecaptchaEnv {
  RECAPTCHA_SECRET_KEY?: string;
}

/**
 * Verify a reCAPTCHA v3 token.
 *
 * @param env - Oxygen environment, for RECAPTCHA_SECRET_KEY
 * @param token - The `g-recaptcha-response` value from the client
 * @param expectedAction - The action name the client used (e.g. 'contact').
 *   Checked explicitly: without it, a token harvested from any other page using
 *   the same site key can be replayed against this form.
 * @param remoteIp - Optional client IP, improves Google's scoring
 */
export async function verifyRecaptcha(
  env: RecaptchaEnv,
  token: string | undefined | null,
  expectedAction: string,
  remoteIp?: string | null,
): Promise<RecaptchaResult> {
  const secret = env.RECAPTCHA_SECRET_KEY;

  // Not configured: accept the submission so a missing env var can't take the
  // form down. Honeypot validation still applies upstream.
  if (!secret) {
    console.warn(
      '[recaptcha] RECAPTCHA_SECRET_KEY is not set — skipping verification',
    );
    return {ok: true, skipped: true};
  }

  if (!token) {
    return {ok: false, reason: 'missing-token'};
  }

  const body = new URLSearchParams({secret, response: token});
  if (remoteIp) {
    body.set('remoteip', remoteIp);
  }

  let data: SiteVerifyResponse;

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(
        `[recaptcha] siteverify returned HTTP ${response.status} — accepting submission`,
      );
      return {ok: true, skipped: true};
    }

    data = (await response.json()) as SiteVerifyResponse;
  } catch (error) {
    // Network failure or timeout: fail open rather than drop a real inquiry.
    console.error('[recaptcha] siteverify request failed:', error);
    return {ok: true, skipped: true};
  }

  if (!data.success) {
    console.warn(
      `[recaptcha] token rejected: ${data['error-codes']?.join(', ') || 'unknown'}`,
    );
    return {ok: false, reason: 'invalid-token'};
  }

  // Reject tokens issued for a different action (replay protection).
  if (data.action !== expectedAction) {
    console.warn(
      `[recaptcha] action mismatch: expected "${expectedAction}", got "${data.action}"`,
    );
    return {ok: false, reason: 'action-mismatch'};
  }

  const score = data.score ?? 0;

  // Logged on every request so MIN_SCORE can be tuned against real traffic.
  // (console.warn rather than log: the repo's lint config permits warn/error
  // only, and this endpoint is low-volume enough that it won't drown the logs.)
  console.warn(
    `[recaptcha] action="${expectedAction}" score=${score} threshold=${MIN_SCORE}`,
  );

  if (score < MIN_SCORE) {
    return {ok: false, reason: 'low-score', score};
  }

  return {ok: true, score};
}

/**
 * User-facing message for a failed verification.
 *
 * Privacy extensions (uBlock Origin, Brave, Firefox strict mode) block
 * reCAPTCHA outright, so a blocked visitor may well be a real customer — the
 * message names the likely cause and points at the email fallback.
 */
export function getRecaptchaErrorMessage(reason: FailureReason): string {
  switch (reason) {
    case 'missing-token':
    case 'invalid-token':
    case 'action-mismatch':
    case 'network-error':
      return "We couldn't verify your submission. If you're using an ad blocker or privacy extension, please disable it for this page and try again — or email us directly at support@custommilestones.com.";
    case 'low-score':
      return "Your submission was flagged as automated traffic. If you're a real person, we're sorry — please email us directly at support@custommilestones.com and we'll get right back to you.";
    default:
      return 'Something went wrong verifying your submission. Please try again or email us at support@custommilestones.com.';
  }
}

/**
 * HMAC token utilities for Q&A signed answer links.
 *
 * Generates and verifies time-limited tokens that allow community members
 * to submit answers to product questions via signed URLs. Tokens are
 * HMAC-SHA256 signed using the session secret and expire after 7 days.
 *
 * Runs on Cloudflare Workers (Shopify Oxygen) using the Web Crypto API.
 */

const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generate a signed HMAC-SHA256 token for an answer link.
 *
 * @param sessionSecret - The SESSION_SECRET env var used as the HMAC key
 * @param productHandle - The product handle the question belongs to
 * @param questionId - The ID of the question being answered
 * @returns A signed token string in the format `base64Payload.urlEncodedBase64Signature`
 */
export async function generateAnswerToken(
  sessionSecret: string,
  productHandle: string,
  questionId: string,
): Promise<string> {
  const encoder = new TextEncoder();

  const expiryTimestamp = Date.now() + TOKEN_EXPIRY_MS;
  const payload = `${productHandle}:${questionId}:${expiryTimestamp}`;
  const base64Payload = btoa(payload);

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(sessionSecret),
    {name: 'HMAC', hash: 'SHA-256'},
    false,
    ['sign'],
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(base64Payload),
  );

  const base64Signature = btoa(
    String.fromCharCode(...new Uint8Array(signatureBuffer)),
  );

  return `${base64Payload}.${encodeURIComponent(base64Signature)}`;
}

/**
 * Verify a signed HMAC-SHA256 answer token.
 *
 * @param sessionSecret - The SESSION_SECRET env var used as the HMAC key
 * @param token - The token string to verify
 * @param productHandle - The expected product handle
 * @param questionId - The expected question ID
 * @returns `true` if the token is valid, unexpired, and matches the expected values
 */
export async function verifyAnswerToken(
  sessionSecret: string,
  token: string,
  productHandle: string,
  questionId: string,
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();

    const dotIndex = token.indexOf('.');
    if (dotIndex === -1) return false;

    const base64Payload = token.slice(0, dotIndex);
    const urlEncodedSignature = token.slice(dotIndex + 1);

    // Decode and parse the payload
    const payload = atob(base64Payload);
    const parts = payload.split(':');
    if (parts.length !== 3) return false;

    const [tokenHandle, tokenQuestionId, tokenExpiry] = parts;

    // Verify payload matches expected values
    if (tokenHandle !== productHandle || tokenQuestionId !== questionId) {
      return false;
    }

    // Check expiry
    const expiryTimestamp = parseInt(tokenExpiry, 10);
    if (isNaN(expiryTimestamp) || Date.now() > expiryTimestamp) {
      return false;
    }

    // Verify HMAC signature
    const base64Signature = decodeURIComponent(urlEncodedSignature);
    const signatureBytes = Uint8Array.from(atob(base64Signature), (c) =>
      c.charCodeAt(0),
    );

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(sessionSecret),
      {name: 'HMAC', hash: 'SHA-256'},
      false,
      ['verify'],
    );

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(base64Payload),
    );

    return valid;
  } catch {
    return false;
  }
}

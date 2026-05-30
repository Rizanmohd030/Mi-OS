const AUTH_COOKIE_NAME = "mi-os-session";
const AUTH_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

const textEncoder = new TextEncoder();

function getAppPassword() {
  const password = process.env.APP_PASSWORD;

  return password || null;
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(message));
  return toHex(new Uint8Array(signature));
}

function constantTimeEquals(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

export function createAuthCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: AUTH_SESSION_TTL_SECONDS,
  };
}

export async function createAuthSessionValue() {
  const secret = getAppPassword();

  if (!secret) {
    throw new Error("APP_PASSWORD is not configured");
  }

  const token = crypto.randomUUID();
  const expiresAt = Date.now() + AUTH_SESSION_TTL_SECONDS * 1000;
  const payload = `${token}.${expiresAt}`;
  const signature = await hmacHex(secret, payload);

  return `${payload}.${signature}`;
}

export async function verifyAuthSessionValue(value: string | undefined | null) {
  if (!value) {
    return false;
  }

  const lastDotIndex = value.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return false;
  }

  const payload = value.slice(0, lastDotIndex);
  const signature = value.slice(lastDotIndex + 1);
  const payloadDotIndex = payload.lastIndexOf(".");
  if (payloadDotIndex === -1) {
    return false;
  }

  const token = payload.slice(0, payloadDotIndex);
  const expiresAtValue = payload.slice(payloadDotIndex + 1);
  const expiresAt = Number(expiresAtValue);

  if (!token || !Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  const secret = getAppPassword();
  if (!secret) {
    return false;
  }

  const expectedSignature = await hmacHex(secret, payload);
  return constantTimeEquals(signature, expectedSignature);
}

export { AUTH_COOKIE_NAME, AUTH_SESSION_TTL_SECONDS };

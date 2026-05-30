import { NextRequest, NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  AUTH_SESSION_TTL_SECONDS,
  createAuthCookieOptions,
  createAuthSessionValue,
} from "@/lib/auth";

const MAX_FAILED_ATTEMPTS = 5;
const COOLDOWN_MS = 10 * 60 * 1000;
const WINDOW_MS = 5 * 60 * 1000;

type AttemptState = {
  failures: number;
  windowStartsAt: number;
  blockedUntil: number;
};

const attempts = new Map<string, AttemptState>();

function getClientKey(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();
  return forwardedIp || request.headers.get("x-real-ip") || "unknown";
}

function getAttemptState(clientKey: string) {
  const now = Date.now();
  const existing = attempts.get(clientKey);

  if (!existing) {
    const created: AttemptState = { failures: 0, windowStartsAt: now, blockedUntil: 0 };
    attempts.set(clientKey, created);
    return created;
  }

  if (existing.blockedUntil && existing.blockedUntil <= now) {
    existing.failures = 0;
    existing.windowStartsAt = now;
    existing.blockedUntil = 0;
  }

  if (now - existing.windowStartsAt > WINDOW_MS) {
    existing.failures = 0;
    existing.windowStartsAt = now;
  }

  return existing;
}

function registerFailure(clientKey: string) {
  const now = Date.now();
  const state = getAttemptState(clientKey);
  state.failures += 1;

  if (state.failures >= MAX_FAILED_ATTEMPTS) {
    state.blockedUntil = now + COOLDOWN_MS;
  }

  attempts.set(clientKey, state);
  return state;
}

function secondsUntil(timestamp: number) {
  return Math.max(1, Math.ceil((timestamp - Date.now()) / 1000));
}

export async function POST(request: NextRequest) {
  const clientKey = getClientKey(request);
  const state = getAttemptState(clientKey);

  if (state.blockedUntil && state.blockedUntil > Date.now()) {
    return NextResponse.json(
      {
        ok: false,
        error: "rate_limited",
        retryAfterSeconds: secondsUntil(state.blockedUntil),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(secondsUntil(state.blockedUntil)),
        },
      }
    );
  }

  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  const submittedPassword = body?.password?.trim() || "";
  const expectedPassword = process.env.APP_PASSWORD;

  if (!expectedPassword) {
    return NextResponse.json(
      { ok: false, error: "auth_not_configured" },
      { status: 500 }
    );
  }

  if (!submittedPassword || submittedPassword !== expectedPassword) {
    const nextState = registerFailure(clientKey);
    const status = nextState.blockedUntil ? 429 : 401;

    return NextResponse.json(
      {
        ok: false,
        error: nextState.blockedUntil ? "rate_limited" : "invalid_password",
        retryAfterSeconds: nextState.blockedUntil ? secondsUntil(nextState.blockedUntil) : undefined,
      },
      {
        status,
        headers: nextState.blockedUntil
          ? { "Retry-After": String(secondsUntil(nextState.blockedUntil)) }
          : undefined,
      }
    );
  }

  attempts.delete(clientKey);

  const sessionValue = await createAuthSessionValue();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, sessionValue, createAuthCookieOptions());

  return response;
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}

import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, verifyAuthSessionValue } from "@/lib/auth";

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname === "/favicon.ico"
  );
}

function isAuthRoute(pathname: string) {
  return pathname === "/api/auth";
}

function isUnlockRoute(pathname: string) {
  return pathname === "/unlock";
}

function isProtectedPath(pathname: string) {
  const normalized = pathname.toLowerCase();

  return (
    normalized.startsWith("/workspace") ||
    normalized.startsWith("/dashboard") ||
    normalized.startsWith("/finance") ||
    normalized.startsWith("/api/")
  );
}

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/")) {
    return "/";
  }

  return value;
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (isPublicAsset(pathname) || isAuthRoute(pathname)) {
    return NextResponse.next();
  }

  const session = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const authenticated = await verifyAuthSessionValue(session);

  if (isUnlockRoute(pathname)) {
    if (!authenticated) {
      return NextResponse.next();
    }

    const nextPath = safeNextPath(searchParams.get("next")) || "/";
    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  if (isProtectedPath(pathname) && !authenticated) {
    const unlockUrl = new URL("/unlock", request.url);
    unlockUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(unlockUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

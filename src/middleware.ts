import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { JwtPayload } from "./types";

async function verifyJwt(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const data = enc.encode(`${headerB64}.${payloadB64}`);

    const base64 = signatureB64
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(signatureB64.length + ((4 - (signatureB64.length % 4)) % 4), "=");

    const binarySig = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify("HMAC", key, binarySig, data);

    if (!isValid) return null;

    const payloadJsonStr = atob(
      payloadB64
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(payloadB64.length + ((4 - (payloadB64.length % 4)) % 4), "=")
    );

    const payload: JwtPayload = JSON.parse(payloadJsonStr);

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;
  const jwtSecret = process.env.JWT_SECRET || "";

  const payload = token && jwtSecret ? await verifyJwt(token, jwtSecret) : null;
  const isAuthenticated = !!payload;
  const isAdmin = payload?.e_admin === true;

  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const isAdminRoute = pathname.startsWith("/members");
  if (isAdminRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  const isProtectedUserRoute = pathname.startsWith("/settings");
  if (isProtectedUserRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

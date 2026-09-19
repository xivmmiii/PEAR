import { NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth";
import { usersCollection } from "@/lib/mongodb";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const stateCookie = request.headers.get("cookie")?.match(/(?:^|;\s*)google_oauth_state=([^;]+)/)?.[1];
  if (!state || !code || !stateCookie || state !== stateCookie) return NextResponse.json({ message: "Invalid Google OAuth state." }, { status: 400 });
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? `${url.origin}/api/auth/google/callback`;
  if (!clientId || !clientSecret) return NextResponse.json({ message: "Google sign-in is not configured." }, { status: 503 });
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }) });
  if (!tokenResponse.ok) return NextResponse.json({ message: "Google sign-in could not be completed." }, { status: 502 });
  const token = await tokenResponse.json() as { access_token?: string };
  if (!token.access_token) return NextResponse.json({ message: "Google did not return an access token." }, { status: 502 });
  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { Authorization: `Bearer ${token.access_token}` } });
  if (!profileResponse.ok) return NextResponse.json({ message: "Google profile lookup failed." }, { status: 502 });
  const profile = await profileResponse.json() as { email?: string; given_name?: string; family_name?: string };
  if (!profile.email) return NextResponse.json({ message: "Google did not provide an email." }, { status: 400 });
  const users = await usersCollection();
  const existing = await users.findOne({ email: profile.email.toLowerCase() });
  const user = existing ?? { firstName: profile.given_name ?? "PEAR", lastName: profile.family_name ?? "Shopper", email: profile.email.toLowerCase(), role: "shopper" as const, createdAt: new Date(), updatedAt: new Date() };
  if (!existing) await users.insertOne(user);
  const session = await createSessionToken({ id: existing?._id?.toString() ?? profile.email, email: user.email, role: user.role });
  const response = NextResponse.redirect(new URL("/dashboard", url.origin));
  response.cookies.set("pear_session", session, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  response.cookies.set("google_oauth_state", "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}

import { SignJWT, jwtVerify } from "jose";

export const roles = ["shopper", "seller", "admin"] as const;
export type Role = (typeof roles)[number];
function getSecret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET must be configured before using authentication.");
  return new TextEncoder().encode(value);
}

export async function createSessionToken(user: { id: string; email: string; firstName: string; role: Role }) {
  return new SignJWT(user).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(getSecret());
}

export async function createOAuthState(state: string) {
  return new SignJWT({ state, purpose: "google-oauth" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("10m").sign(getSecret());
}

export async function readOAuthState(token: string, expectedState: string) {
  const { payload } = await jwtVerify(token, getSecret());
  if (payload.purpose !== "google-oauth" || payload.state !== expectedState) throw new Error("Invalid OAuth state.");
}

export async function readSessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as { id: string; email: string; firstName: string; role: Role };
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && roles.includes(value as Role);
}

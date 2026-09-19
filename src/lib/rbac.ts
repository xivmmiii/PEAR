import { cookies } from "next/headers";
import { readSessionToken, type Role } from "./auth";

export async function getCurrentUser() {
  const token = (await cookies()).get("pear_session")?.value;
  if (!token) return null;
  try {
    return await readSessionToken(token);
  } catch {
    return null;
  }
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await getCurrentUser();
  if (!user || !allowedRoles.includes(user.role)) return null;
  return user;
}

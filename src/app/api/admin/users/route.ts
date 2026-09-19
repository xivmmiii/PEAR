import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { usersCollection } from "@/lib/mongodb";

export async function PATCH(request: Request) {
  const user = await requireRole(["admin"]);
  if (!user) return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  const body = await request.json() as { email?: string; role?: "shopper" | "seller" | "admin"; suspended?: boolean };
  if (!body.email || (!body.role && typeof body.suspended !== "boolean")) return NextResponse.json({ message: "Email and an update are required." }, { status: 400 });
  const users = await usersCollection();
  await users.updateOne({ email: body.email.toLowerCase() }, { $set: { ...(body.role ? { role: body.role } : {}), ...(typeof body.suspended === "boolean" ? { suspended: body.suspended } : {}), updatedAt: new Date() } });
  return NextResponse.json({ ok: true });
}

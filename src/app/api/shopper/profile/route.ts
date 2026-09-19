import { NextResponse } from "next/server";
import { usersCollection } from "@/lib/mongodb";
import { requireRole } from "@/lib/rbac";

export async function GET() {
  const user = await requireRole(["shopper"]);
  if (!user) return NextResponse.json({ message: "Shopper access required." }, { status: 403 });
  const users = await usersCollection();
  const profile = await users.findOne({ email: user.email }, { projection: { passwordHash: 0 } });
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const user = await requireRole(["shopper"]);
  if (!user) return NextResponse.json({ message: "Shopper access required." }, { status: 403 });
  const body = await request.json() as { firstName?: string; lastName?: string; phone?: string; address?: Record<string, string> };
  const users = await usersCollection();
  await users.updateOne({ email: user.email }, { $set: { ...(body.firstName ? { firstName: body.firstName.trim() } : {}), ...(body.lastName ? { lastName: body.lastName.trim() } : {}), ...(body.phone ? { phone: body.phone.trim() } : {}), ...(body.address ? { address: body.address } : {}), updatedAt: new Date() } });
  return NextResponse.json({ ok: true });
}

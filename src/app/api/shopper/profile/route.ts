import { NextResponse } from "next/server";
import { usersCollection, type Address } from "@/lib/mongodb";
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
  const body = await request.json() as { firstName?: string; lastName?: string; phone?: string; address?: Partial<Address> };
  const address = body.address ? {
    flatNo: String(body.address.flatNo ?? "").trim(),
    landmark: String(body.address.landmark ?? "").trim(),
    area: String(body.address.area ?? "").trim(),
    city: String(body.address.city ?? "").trim(),
    state: String(body.address.state ?? "").trim(),
    pincode: String(body.address.pincode ?? "").trim(),
    country: String(body.address.country ?? "India").trim(),
  } : undefined;
  const users = await usersCollection();
  await users.updateOne({ email: user.email }, { $set: {
    ...(body.firstName !== undefined ? { firstName: body.firstName.trim() } : {}),
    ...(body.lastName !== undefined ? { lastName: body.lastName.trim() } : {}),
    ...(body.phone !== undefined ? { phone: body.phone.trim() } : {}),
    ...(address ? { address } : {}),
    updatedAt: new Date(),
  } });
  return NextResponse.json({ ok: true });
}

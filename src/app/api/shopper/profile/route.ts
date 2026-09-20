import { NextResponse } from "next/server";
import { usersCollection, type Address } from "@/lib/mongodb";
import { requireRole } from "@/lib/rbac";
import { limits, phonePattern, pincodePattern, sentenceCase, validText } from "@/lib/validation";

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
  if (body.firstName !== undefined && !validText(body.firstName, limits.name.min, limits.name.max)) return NextResponse.json({ message: "First name must be 2 to 40 characters." }, { status: 400 });
  if (body.lastName !== undefined && !validText(body.lastName, limits.name.min, limits.name.max)) return NextResponse.json({ message: "Last name must be 2 to 40 characters." }, { status: 400 });
  if (body.phone !== undefined && body.phone && (!phonePattern.test(body.phone.trim()) || body.phone.trim().length !== limits.phone.length)) return NextResponse.json({ message: "Phone number must contain exactly 10 digits." }, { status: 400 });
  if (address && (!validText(address.flatNo, 1, limits.address.max) || !validText(address.area, limits.address.min, limits.address.max) || !validText(address.city, limits.address.min, limits.address.max) || !validText(address.state, limits.address.min, limits.address.max) || !pincodePattern.test(address.pincode) || !validText(address.country, limits.address.min, limits.address.max))) return NextResponse.json({ message: "Enter valid address details and a six-digit pincode." }, { status: 400 });
  const users = await usersCollection();
  await users.updateOne({ email: user.email }, { $set: {
    ...(body.firstName !== undefined ? { firstName: sentenceCase(body.firstName) } : {}),
    ...(body.lastName !== undefined ? { lastName: sentenceCase(body.lastName) } : {}),
    ...(body.phone !== undefined ? { phone: body.phone.trim() } : {}),
    ...(address ? { address } : {}),
    updatedAt: new Date(),
  } });
  return NextResponse.json({ ok: true });
}

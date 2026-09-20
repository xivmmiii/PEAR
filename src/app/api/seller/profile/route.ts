import { NextResponse } from "next/server";
import { usersCollection } from "@/lib/mongodb";
import { requireRole } from "@/lib/rbac";
import { limits, phonePattern, sentenceCase, validText } from "@/lib/validation";

export async function GET() {
  const user = await requireRole(["seller"]);
  if (!user) return NextResponse.json({ message: "Seller access required." }, { status: 403 });
  const users = await usersCollection();
  const profile = await users.findOne({ email: user.email }, { projection: { passwordHash: 0 } });
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const user = await requireRole(["seller"]);
  if (!user) return NextResponse.json({ message: "Seller access required." }, { status: 403 });
  const body = await request.json() as { brandName?: string; storeDescription?: string; phone?: string };
  const brandName = body.brandName?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const description = body.storeDescription?.trim() ?? "";
  if (!validText(brandName, limits.brand.min, limits.brand.max)) return NextResponse.json({ message: "Store name must be 2 to 60 characters." }, { status: 400 });
  if (description && !validText(description, limits.description.min, limits.description.max)) return NextResponse.json({ message: "Description must be 10 to 500 characters." }, { status: 400 });
  if (phone && (!phonePattern.test(phone) || phone.length !== limits.phone.length)) return NextResponse.json({ message: "Phone number must contain exactly 10 digits." }, { status: 400 });
  const users = await usersCollection();
  await users.updateOne({ email: user.email }, { $set: { brandName: sentenceCase(brandName), storeDescription: description ? sentenceCase(description) : "", phone, updatedAt: new Date() } });
  return NextResponse.json({ ok: true });
}

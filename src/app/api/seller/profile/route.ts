import { NextResponse } from "next/server";
import { usersCollection } from "@/lib/mongodb";
import { requireRole } from "@/lib/rbac";

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
  if (!brandName) return NextResponse.json({ message: "Store name is required." }, { status: 400 });
  const users = await usersCollection();
  await users.updateOne({ email: user.email }, { $set: { brandName, storeDescription: body.storeDescription?.trim() ?? "", phone: body.phone?.trim() ?? "", updatedAt: new Date() } });
  return NextResponse.json({ ok: true });
}

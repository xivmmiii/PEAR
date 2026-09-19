import { NextResponse } from "next/server";
import { usersCollection } from "@/lib/mongodb";
import { requireRole } from "@/lib/rbac";

export async function GET() {
  const user = await requireRole(["shopper"]);
  if (!user) return NextResponse.json({ message: "Shopper access required." }, { status: 403 });
  const users = await usersCollection();
  const row = await users.findOne({ email: user.email }, { projection: { bag: 1 } });
  return NextResponse.json({ bag: row?.bag ?? [] });
}

export async function POST(request: Request) {
  const user = await requireRole(["shopper"]);
  if (!user) return NextResponse.json({ message: "Shopper access required." }, { status: 403 });
  const item = await request.json() as { productId?: string; quantity?: number; size?: string };
  if (!item.productId || !item.quantity || item.quantity < 1) return NextResponse.json({ message: "Product and quantity are required." }, { status: 400 });
  const users = await usersCollection();
  await users.updateOne({ email: user.email }, { $push: { bag: { productId: item.productId, quantity: item.quantity, size: item.size ?? null } }, $set: { updatedAt: new Date() } });
  return NextResponse.json({ ok: true });
}

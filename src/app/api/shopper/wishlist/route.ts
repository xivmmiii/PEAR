import { NextResponse } from "next/server";
import { usersCollection } from "@/lib/mongodb";
import { requireRole } from "@/lib/rbac";

export async function GET() {
  const user = await requireRole(["shopper"]);
  if (!user) return NextResponse.json({ message: "Shopper access required." }, { status: 403 });
  const users = await usersCollection();
  const row = await users.findOne({ email: user.email }, { projection: { wishlist: 1 } });
  return NextResponse.json({ wishlist: row?.wishlist ?? [] });
}

export async function POST(request: Request) {
  const user = await requireRole(["shopper"]);
  if (!user) return NextResponse.json({ message: "Shopper access required." }, { status: 403 });
  const { productId } = await request.json() as { productId?: string };
  if (!productId) return NextResponse.json({ message: "Product ID is required." }, { status: 400 });
  const users = await usersCollection();
  await users.updateOne({ email: user.email }, { $addToSet: { wishlist: productId }, $set: { updatedAt: new Date() } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await requireRole(["shopper"]);
  if (!user) return NextResponse.json({ message: "Shopper access required." }, { status: 403 });
  const productId = new URL(request.url).searchParams.get("productId");
  if (!productId) return NextResponse.json({ message: "Product ID is required." }, { status: 400 });
  const users = await usersCollection();
  await users.updateOne({ email: user.email }, { $pull: { wishlist: productId }, $set: { updatedAt: new Date() } });
  return NextResponse.json({ ok: true });
}

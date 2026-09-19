import { NextResponse } from "next/server";
import { usersCollection } from "@/lib/mongodb";
import { requireRole } from "@/lib/rbac";
import { productsCollection } from "@/lib/catalogue";

export async function GET() {
  const user = await requireRole(["shopper"]);
  if (!user) return NextResponse.json({ message: "Shopper access required." }, { status: 403 });
  const users = await usersCollection();
  const row = await users.findOne({ email: user.email }, { projection: { bag: 1 } });
  const bag = row?.bag ?? [];
  const products = await productsCollection();
  const productRows = await products.find({ slug: { $in: bag.map((item) => item.productId) }, status: "active" }).toArray();
  return NextResponse.json({ bag: bag.map((item) => ({ ...item, product: productRows.find((product) => product.slug === item.productId) ?? null })).filter((item) => item.product) });
}

export async function POST(request: Request) {
  const user = await requireRole(["shopper"]);
  if (!user) return NextResponse.json({ message: "Shopper access required." }, { status: 403 });
  const item = await request.json() as { productId?: string; quantity?: number; size?: string };
  if (!item.productId || !item.quantity || item.quantity < 1) return NextResponse.json({ message: "Product and quantity are required." }, { status: 400 });
  const users = await usersCollection();
  const size = item.size ?? null;
  const existing = await users.updateOne(
    { email: user.email, bag: { $elemMatch: { productId: item.productId, size } } },
    { $inc: { "bag.$.quantity": item.quantity }, $set: { updatedAt: new Date() } },
  );
  if (!existing.matchedCount) {
    await users.updateOne(
      { email: user.email },
      { $push: { bag: { productId: item.productId, quantity: item.quantity, size } }, $set: { updatedAt: new Date() } },
    );
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const user = await requireRole(["shopper"]);
  if (!user) return NextResponse.json({ message: "Shopper access required." }, { status: 403 });
  const item = await request.json() as { productId?: string; quantity?: number; size?: string | null };
  if (!item.productId || !item.quantity || item.quantity < 1) return NextResponse.json({ message: "Product and quantity are required." }, { status: 400 });
  const users = await usersCollection();
  await users.updateOne({ email: user.email, "bag.productId": item.productId }, { $set: { "bag.$.quantity": item.quantity, "bag.$.size": item.size ?? null, updatedAt: new Date() } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await requireRole(["shopper"]);
  if (!user) return NextResponse.json({ message: "Shopper access required." }, { status: 403 });
  const productId = new URL(request.url).searchParams.get("productId");
  if (!productId) return NextResponse.json({ message: "Product ID is required." }, { status: 400 });
  const users = await usersCollection();
  await users.updateOne({ email: user.email }, { $pull: { bag: { productId } }, $set: { updatedAt: new Date() } });
  return NextResponse.json({ ok: true });
}

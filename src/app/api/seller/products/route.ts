import { NextResponse } from "next/server";
import { productsCollection } from "@/lib/catalogue";
import { requireRole } from "@/lib/rbac";

export async function GET() {
  const user = await requireRole(["seller", "admin"]);
  if (!user) return NextResponse.json({ message: "Seller access required." }, { status: 403 });
  const products = await productsCollection();
  return NextResponse.json({ products: await products.find({ sellerId: user.id }).sort({ createdAt: -1 }).toArray() });
}

export async function POST(request: Request) {
  const user = await requireRole(["seller"]);
  if (!user) return NextResponse.json({ message: "Seller access required." }, { status: 403 });
  const body = await request.json() as { name?: string; brand?: string; category?: string; price?: number; mrp?: number; stock?: number; imageUrl?: string; description?: string; sizes?: string[] };
  if (!body.name || !body.brand || !body.category || !body.price || !body.mrp || !body.stock || !body.imageUrl) return NextResponse.json({ message: "Name, brand, category, pricing, stock, and image are required." }, { status: 400 });
  const products = await productsCollection();
  const slug = `${body.brand}-${body.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + `-${Date.now()}`;
  const now = new Date();
  const result = await products.insertOne({ slug, name: body.name.trim(), brand: body.brand.trim(), category: body.category as never, description: body.description?.trim() ?? "", price: Number(body.price), mrp: Number(body.mrp), discountPercent: Math.max(0, Math.round((1 - Number(body.price) / Number(body.mrp)) * 100)), rating: 0, sizes: body.sizes ?? [], imageUrl: body.imageUrl, stock: Number(body.stock), sellerId: user.id, status: "active", createdAt: now, updatedAt: now });
  return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await requireRole(["seller", "admin"]);
  if (!user) return NextResponse.json({ message: "Seller access required." }, { status: 403 });
  const body = await request.json() as { slug?: string; name?: string; price?: number; mrp?: number; stock?: number; status?: "draft" | "active" | "archived" };
  if (!body.slug) return NextResponse.json({ message: "Product slug is required." }, { status: 400 });
  const products = await productsCollection();
  const filter = user.role === "admin" ? { slug: body.slug } : { slug: body.slug, sellerId: user.id };
  const update = { ...(body.name ? { name: body.name.trim() } : {}), ...(body.price ? { price: body.price } : {}), ...(body.mrp ? { mrp: body.mrp } : {}), ...(body.stock !== undefined ? { stock: body.stock } : {}), ...(body.status ? { status: body.status } : {}), updatedAt: new Date() };
  const result = await products.updateOne(filter, { $set: update });
  return NextResponse.json({ updated: result.modifiedCount > 0 });
}

export async function DELETE(request: Request) {
  const user = await requireRole(["seller", "admin"]);
  if (!user) return NextResponse.json({ message: "Seller access required." }, { status: 403 });
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ message: "Product slug is required." }, { status: 400 });
  const products = await productsCollection();
  const filter = user.role === "admin" ? { slug } : { slug, sellerId: user.id };
  const result = await products.updateOne(filter, { $set: { status: "archived", updatedAt: new Date() } });
  return NextResponse.json({ archived: result.modifiedCount > 0 });
}

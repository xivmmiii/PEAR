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
  const body = await request.json() as { name?: string; brand?: string; category?: string; price?: string; mrp?: string; stock?: string; imageUrl?: string; description?: string; sizes?: string[] };
  const parsePositiveInteger = (value?: string) => value && /^\d+$/.test(value.trim()) ? Number.parseInt(value, 10) : NaN;
  const price = parsePositiveInteger(body.price);
  const mrp = parsePositiveInteger(body.mrp);
  const stock = parsePositiveInteger(body.stock);
  if (!body.name?.trim() || !body.brand?.trim() || !body.category || !Number.isInteger(price) || price < 1 || !Number.isInteger(mrp) || mrp < 1 || !Number.isInteger(stock) || stock < 1) return NextResponse.json({ message: "Name, brand, category, and valid whole-number pricing and stock are required." }, { status: 400 });
  if (body.imageUrl) {
    const imageMatch = body.imageUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!imageMatch) return NextResponse.json({ message: "Image must be a JPG, PNG, or WebP upload." }, { status: 400 });
    if (Buffer.from(imageMatch[2], "base64").byteLength > 5 * 1024 * 1024) return NextResponse.json({ message: "Image must be 5 MB or smaller." }, { status: 400 });
  }
  const sentenceCase = (value: string) => { const trimmed = value.trim().toLowerCase(); return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : ""; };
  const products = await productsCollection();
  const name = sentenceCase(body.name);
  const brand = sentenceCase(body.brand);
  const slug = `${brand}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + `-${Date.now()}`;
  const now = new Date();
  const result = await products.insertOne({ slug, name, brand, category: body.category as never, description: body.description ? sentenceCase(body.description) : "", price, mrp, discountPercent: Math.max(0, Math.round((1 - price / mrp) * 100)), rating: 0, sizes: body.sizes ?? [], imageUrl: body.imageUrl ?? "", stock, sellerId: user.id, status: "active", createdAt: now, updatedAt: now });
  return NextResponse.json({ id: result.insertedId.toString(), slug }, { status: 201 });
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

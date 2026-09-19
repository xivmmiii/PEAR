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

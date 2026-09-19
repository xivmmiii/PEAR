import { NextResponse } from "next/server";
import { productsCollection, seedProducts } from "@/lib/catalogue";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const category = params.get("category");
  const brand = params.get("brand")?.trim();
  const search = params.get("search")?.trim();
  const sort = params.get("sort") ?? "newest";
  const products = await productsCollection();
  const query: Record<string, unknown> = { status: "active" };
  if (category) query.category = category;
  if (brand) query.brand = brand;
  if (search) query.$or = [{ name: { $regex: search, $options: "i" } }, { brand: { $regex: search, $options: "i" } }];
  const order: Record<string, 1 | -1> = sort === "price-low" ? { price: 1 } : sort === "price-high" ? { price: -1 } : sort === "discount" ? { discountPercent: -1 } : { createdAt: -1 };
  const rows = await products.find(query).sort(order).limit(48).toArray();
  const hasFilters = Boolean(category || brand || search);
  return NextResponse.json({ products: rows.length || hasFilters ? rows : seedProducts });
}

export async function POST() {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ message: "Seeding is disabled in production." }, { status: 403 });
  const products = await productsCollection();
  const now = new Date();
  await products.bulkWrite(seedProducts.map((product) => ({ updateOne: { filter: { slug: product.slug }, update: { $set: { ...product, updatedAt: now }, $setOnInsert: { createdAt: now } }, upsert: true } })));
  return NextResponse.json({ seeded: seedProducts.length });
}

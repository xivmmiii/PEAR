import { NextResponse } from "next/server";
import { productsCollection, seedProducts, type ProductDocument } from "@/lib/catalogue";

export async function GET(request: Request) {
  const category = new URL(request.url).searchParams.get("category");
  const products = await productsCollection();
  const query: Partial<Pick<ProductDocument, "category" | "status">> = category ? { category: category as ProductDocument["category"], status: "active" } : { status: "active" };
  const rows = await products.find(query).sort({ createdAt: -1 }).limit(48).toArray();
  return NextResponse.json({ products: rows.length ? rows : seedProducts });
}

export async function POST() {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ message: "Seeding is disabled in production." }, { status: 403 });
  const products = await productsCollection();
  const now = new Date();
  await products.bulkWrite(seedProducts.map((product) => ({ updateOne: { filter: { slug: product.slug }, update: { $setOnInsert: { ...product, createdAt: now, updatedAt: now } }, upsert: true } })));
  return NextResponse.json({ seeded: seedProducts.length });
}

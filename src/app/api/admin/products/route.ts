import { NextResponse } from "next/server";
import { productsCollection } from "@/lib/catalogue";
import { requireRole } from "@/lib/rbac";

export async function GET() {
  const user = await requireRole(["admin"]);
  if (!user) return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  const products = await productsCollection();
  return NextResponse.json({ products: await products.find({}).sort({ createdAt: -1 }).limit(100).toArray() });
}

export async function PATCH(request: Request) {
  const user = await requireRole(["admin"]);
  if (!user) return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  const body = await request.json() as { slug?: string; status?: "draft" | "active" | "archived" };
  if (!body.slug || !body.status) return NextResponse.json({ message: "Product slug and status are required." }, { status: 400 });
  const result = await (await productsCollection()).updateOne({ slug: body.slug }, { $set: { status: body.status, updatedAt: new Date() } });
  return NextResponse.json({ updated: result.modifiedCount > 0 });
}

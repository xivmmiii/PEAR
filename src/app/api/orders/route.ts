import { NextResponse } from "next/server";
import { ordersCollection, usersCollection } from "@/lib/mongodb";
import { productsCollection } from "@/lib/catalogue";
import { requireRole } from "@/lib/rbac";
import { createPaymentIntent, type PaymentMethod } from "@/lib/payments";

export async function GET() {
  const user = await requireRole(["shopper", "seller", "admin"]);
  if (!user) return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  const orders = await ordersCollection();
  const query = user.role === "shopper" ? { shopperId: user.id } : user.role === "seller" ? { "items.sellerId": user.id } : {};
  return NextResponse.json({ orders: await orders.find(query).sort({ createdAt: -1 }).limit(50).toArray() });
}

export async function POST(request: Request) {
  const user = await requireRole(["shopper"]);
  if (!user) return NextResponse.json({ message: "Shopper access required." }, { status: 403 });
  const body = await request.json() as { items?: { productId: string; quantity: number; size?: string }[]; paymentMethod?: PaymentMethod; address?: Record<string, string> };
  if (!body.items?.length || !body.address || !body.paymentMethod) return NextResponse.json({ message: "Items, address, and payment method are required." }, { status: 400 });
  const products = await productsCollection();
  const productIds = body.items.map((item) => item.productId);
  const rows = await products.find({ slug: { $in: productIds }, status: "active" }).toArray();
  const lineItems = body.items.map((item) => {
    const product = rows.find((row) => row.slug === item.productId);
    if (!product || product.stock < item.quantity) throw new Error(`Product ${item.productId} is unavailable.`);
    return { productId: product.slug, name: product.name, brand: product.brand, quantity: item.quantity, size: item.size ?? null, unitPrice: product.price, total: product.price * item.quantity, sellerId: product.sellerId };
  });
  const total = lineItems.reduce((sum, item) => sum + item.total, 0);
  try {
    const payment = await createPaymentIntent({ amount: total, method: body.paymentMethod });
    const orders = await ordersCollection();
    const result = await orders.insertOne({ shopperId: user.id, items: lineItems, total, address: body.address, payment, status: "placed", createdAt: new Date(), updatedAt: new Date() });
    const users = await usersCollection();
    await users.updateOne({ email: user.email }, { $set: { bag: [], updatedAt: new Date() } });
    return NextResponse.json({ orderId: result.insertedId.toString(), payment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to place order." }, { status: 400 });
  }
}

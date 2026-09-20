import { NextResponse } from "next/server";
import { ordersCollection, type OrderDocument } from "@/lib/mongodb";
import { requireRole } from "@/lib/rbac";

const demoOrders = [
  { reference: "PEAR-DEMO-1001", name: "Aarav Sharma", product: "Everyday Oxford Shirt", brand: "Northstar", quantity: 1, size: "M", unitPrice: 1499, status: "placed" as const, daysAgo: 1 },
  { reference: "PEAR-DEMO-1002", name: "Meera Kapoor", product: "Relaxed Tapered Trousers", brand: "Urban Loom", quantity: 2, size: "L", unitPrice: 1899, status: "processing" as const, daysAgo: 3 },
  { reference: "PEAR-DEMO-1003", name: "Kabir Verma", product: "Canvas Street Sneakers", brand: "Stride Co.", quantity: 1, size: "UK 8", unitPrice: 2499, status: "shipped" as const, daysAgo: 6 },
];

export async function GET() {
  const user = await requireRole(["seller", "admin"]);
  if (!user) return NextResponse.json({ message: "Seller access required." }, { status: 403 });
  const orders = await ordersCollection();
  const query = user.role === "admin" ? {} : { "items.sellerId": user.id };
  let rows = await orders.find(query).sort({ createdAt: -1 }).limit(50).toArray();

  if (user.role === "seller" && rows.length === 0) {
    const now = Date.now();
    const seedRows: OrderDocument[] = demoOrders.map((order) => {
      const total = order.unitPrice * order.quantity;
      const createdAt = new Date(now - order.daysAgo * 24 * 60 * 60 * 1000);
      return {
        shopperId: `demo-shopper-${order.reference}`,
        items: [{ productId: `demo-${order.reference.toLowerCase()}`, name: order.product, brand: order.brand, quantity: order.quantity, size: order.size, unitPrice: order.unitPrice, total, sellerId: user.id }],
        total,
        address: { name: order.name, line1: "Demo address", city: "Mumbai", postalCode: "400001" },
        payment: { status: "paid", provider: "demo", reference: order.reference },
        status: order.status,
        createdAt,
        updatedAt: createdAt,
      };
    });
    await orders.insertMany(seedRows);
    rows = await orders.find(query).sort({ createdAt: -1 }).limit(50).toArray();
  }

  return NextResponse.json({ orders: rows });
}

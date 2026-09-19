import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  const user = await requireRole(["admin"]);
  if (!user) return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  const db = await getDb();
  const [users, products, orders] = await Promise.all([db.collection("users").countDocuments(), db.collection("products").countDocuments(), db.collection("orders").countDocuments()]);
  return NextResponse.json({ users, products, orders });
}

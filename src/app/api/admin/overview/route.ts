import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const user = await requireRole(["admin"]);
  if (!user) return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB ?? "pear");
  const [users, products, orders] = await Promise.all([db.collection("users").countDocuments(), db.collection("products").countDocuments(), db.collection("orders").countDocuments()]);
  return NextResponse.json({ users, products, orders });
}

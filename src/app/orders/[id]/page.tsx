import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { ordersCollection } from "@/lib/mongodb";
import { requireRole } from "@/lib/rbac";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["shopper", "seller", "admin"]);
  if (!user) redirect("/signin");
  const { id } = await params;
  if (!ObjectId.isValid(id)) notFound();
  const order = await (await ordersCollection()).findOne({ _id: new ObjectId(id), ...(user.role === "shopper" ? { shopperId: user.id } : user.role === "seller" ? { "items.sellerId": user.id } : {}) });
  if (!order) notFound();
  return <><SiteHeader /><main className="order-detail page-width"><Link href="/orders" className="text-link">← All orders</Link><p className="eyebrow">Order details</p><h1>Order <i>#{id.slice(-8).toUpperCase()}</i></h1><div className="order-status"><strong>{order.status}</strong><span>Placed {new Date(order.createdAt).toLocaleString("en-IN")}</span></div><div className="order-items">{order.items.map((item) => <div key={`${item.name}-${item.size}`}><span>{item.brand}</span><strong>{item.name}</strong><small>Qty {item.quantity}{item.size ? ` · Size ${item.size}` : ""}</small><b>₹{Number(item.total).toLocaleString("en-IN")}</b></div>)}</div><div className="order-total"><span>Total</span><strong>₹{Number(order.total).toLocaleString("en-IN")}</strong></div></main><SiteFooter /></>;
}

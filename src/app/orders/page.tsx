import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { requireRole } from "@/lib/rbac";
import { ordersCollection } from "@/lib/mongodb";

export default async function OrdersPage() {
  const user = await requireRole(["shopper", "seller", "admin"]);
  if (!user) redirect("/signin");
  const query = user.role === "shopper" ? { shopperId: user.id } : user.role === "seller" ? { "items.sellerId": user.id } : {};
  const orders = await (await ordersCollection()).find(query).sort({ createdAt: -1 }).limit(50).toArray();
  return <><SiteHeader /><main className="orders-page page-width"><p className="eyebrow">Your marketplace history</p><h1>Orders <i>made.</i></h1>{orders.length ? <div className="orders-list">{orders.map((order) => <Link href={`/orders/${order._id.toString()}`} className="order-card" key={order._id.toString()}><div><strong>Order #{order._id.toString().slice(-8).toUpperCase()}</strong><span>{new Date(order.createdAt).toLocaleDateString("en-IN")}</span></div><p>{order.items?.length ?? 0} item(s)</p><b>₹{Number(order.total).toLocaleString("en-IN")}</b><em>{order.status}</em></Link>)}</div> : <div className="empty-state"><h2>No orders yet.</h2><p>When something good finds its way to you, it will appear here.</p><Link href="/catalogue" className="button button-dark">Explore catalogue <span>↗</span></Link></div>}</main><SiteFooter /></>;
}

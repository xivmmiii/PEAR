"use client";
import { useEffect, useState } from "react";

type SellerOrder = { _id: string; items: { name: string; brand: string; quantity: number; size?: string | null; total: number }[]; total: number; address: { name?: string }; status: string; createdAt: string };

export function SellerOrders() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/seller/orders").then((response) => response.ok ? response.json() : Promise.reject(new Error("Could not load orders."))).then((data) => setOrders(data.orders)).catch((error: Error) => setMessage(error.message));
  }, []);

  return <section className="seller-orders seller-panel-placeholder"><div className="section-heading"><div><p className="eyebrow">Customer orders</p><h2>Orders</h2><p className="seller-products-help">Orders for products sold through your label.</p></div></div>{orders.length ? <div className="seller-products-table-wrap"><table className="seller-products-table"><thead><tr><th>Order date</th><th>Customer</th><th>Item</th><th>Qty / Size</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.map((order) => { const item = order.items[0]; return <tr key={order._id}><td>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td><td>{order.address?.name ?? "Customer"}</td><td><strong>{item.brand}</strong><br />{item.name}</td><td>{item.quantity} / {item.size ?? "—"}</td><td>₹{order.total.toLocaleString("en-IN")}</td><td><em className={`status-${order.status}`}>{order.status}</em></td></tr>; })}</tbody></table></div> : <p className="empty-inline">No orders yet.</p>}{message && <p className="form-error">{message}</p>}</section>;
}

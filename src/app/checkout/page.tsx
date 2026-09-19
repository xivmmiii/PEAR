"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type Item = { productId: string; quantity: number; size?: string | null; product: { name: string; price: number } };
export default function Checkout() {
  const [items, setItems] = useState<Item[]>([]);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => { fetch("/api/shopper/bag").then((response) => response.ok ? response.json() : { bag: [] }).then((data) => setItems(data.bag)); }, []);
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setMessage("Placing your order...");
    const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: items.map((item) => ({ productId: item.productId, quantity: item.quantity, size: item.size })), paymentMethod: values.paymentMethod, address: { name: values.name, line1: values.line1, city: values.city, postalCode: values.postalCode } }) });
    const result = await response.json();
    if (!response.ok) setMessage(result.message);
    else { setMessage(`Order ${result.orderId} placed successfully.`); setDone(true); }
  }
  return <><SiteHeader /><main className="checkout page-width"><p className="eyebrow">Secure checkout</p><h1>Almost <i>yours.</i></h1>{done ? <div className="success-message"><span>✓</span><h3>Order confirmed</h3><p>{message}</p><Link className="button button-dark" href="/orders">View orders <span>↗</span></Link></div> : !items.length ? <div className="empty-state"><h2>Your bag is empty.</h2><p>Add products before checking out.</p><Link href="/catalogue" className="button button-dark">Explore catalogue <span>↗</span></Link></div> : <form className="checkout-form" onSubmit={submit}><div className="checkout-total"><span>Order total</span><strong>₹{total.toLocaleString("en-IN")}</strong></div><input name="name" placeholder="Full name" required /><input name="line1" placeholder="Address" required /><div className="form-split"><input name="city" placeholder="City" required /><input name="postalCode" placeholder="Postal code" required /></div><label className="payment-choice"><input name="paymentMethod" type="radio" value="cod" defaultChecked /> Cash on delivery</label><label className="payment-choice"><input name="paymentMethod" type="radio" value="online" /> Online payment (requires provider setup)</label><button className="button button-dark">Place order <span>↗</span></button>{message && <p className="form-error">{message}</p>}</form>}</main><SiteFooter /></>;
}

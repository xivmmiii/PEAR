"use client";
import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function Checkout() {
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Placing your order...");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: [{ productId: values.productId, quantity: Number(values.quantity), size: values.size }], paymentMethod: values.paymentMethod, address: { name: values.name, line1: values.line1, city: values.city, postalCode: values.postalCode } }) });
    const result = await response.json();
    if (!response.ok) setMessage(result.message);
    else { setMessage(`Order ${result.orderId} placed successfully.`); setDone(true); }
  }
  return <><SiteHeader /><main className="checkout page-width"><p className="eyebrow">Secure checkout</p><h1>Almost <i>yours.</i></h1>{done ? <div className="success-message"><span>✓</span><h3>Order confirmed</h3><p>{message}</p><Link className="button button-dark" href="/dashboard">View dashboard <span>↗</span></Link></div> : <form className="checkout-form" onSubmit={submit}><input name="productId" placeholder="Product slug (for example nike-air-max-everyday)" required /><div className="form-split"><input name="quantity" type="number" min="1" defaultValue="1" required /><input name="size" placeholder="Size" /></div><input name="name" placeholder="Full name" required /><input name="line1" placeholder="Address" required /><div className="form-split"><input name="city" placeholder="City" required /><input name="postalCode" placeholder="Postal code" required /></div><label className="payment-choice"><input name="paymentMethod" type="radio" value="cod" defaultChecked /> Cash on delivery</label><label className="payment-choice"><input name="paymentMethod" type="radio" value="online" /> Online payment (requires provider setup)</label><button className="button button-dark">Place order <span>↗</span></button>{message && <p className="form-error">{message}</p>}</form>}</main><SiteFooter /></>;
}

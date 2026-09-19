"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type Item = { productId: string; quantity: number; size?: string | null; product: { name: string; brand: string; price: number; mrp: number; imageUrl: string } };
export default function BagPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  async function load() { const response = await fetch("/api/shopper/bag"); if (response.ok) setItems((await response.json()).bag); setLoading(false); }
  useEffect(() => { fetch("/api/shopper/bag").then((response) => response.ok ? response.json() : { bag: [] }).then((data) => { setItems(data.bag); setLoading(false); }); }, []);
  async function update(item: Item, quantity: number) {
    if (quantity < 1) return remove(item.productId, item.size);
    await fetch("/api/shopper/bag", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: item.productId, quantity, size: item.size }) });
    void load();
  }
  async function remove(productId: string, size?: string | null) { const params = new URLSearchParams({ productId }); if (size) params.set("size", size); await fetch(`/api/shopper/bag?${params}`, { method: "DELETE" }); void load(); }
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return <><SiteHeader /><main className="bag-page page-width"><p className="eyebrow">Your saved good stuff</p><h1>Your <i>bag.</i></h1>{loading ? <p className="empty-inline">Loading your bag...</p> : items.length ? <div className="bag-layout"><div className="bag-items">{items.map((item) => <article className="bag-item" key={`${item.productId}-${item.size ?? "none"}`}><Image src={item.product.imageUrl} alt={item.product.name} width={130} height={160} /><div><p className="product-brand">{item.product.brand}</p><h2>{item.product.name}</h2><p>Size: {item.size ?? "Not selected"}</p><strong>₹{item.product.price.toLocaleString("en-IN")}</strong><div className="quantity-controls"><button onClick={() => update(item, item.quantity - 1)}>-</button><span>{item.quantity}</span><button onClick={() => update(item, item.quantity + 1)}>+</button><button className="remove-item" onClick={() => remove(item.productId, item.size)}>Remove</button></div></div></article>)}</div><aside className="bag-summary"><p className="eyebrow">Summary</p><div><span>Subtotal</span><strong>₹{total.toLocaleString("en-IN")}</strong></div><div><span>Shipping</span><span>Free over ₹999</span></div><hr /><div className="bag-total"><span>Total</span><strong>₹{total.toLocaleString("en-IN")}</strong></div><Link href="/checkout" className="button button-dark">Continue to checkout <span>↗</span></Link></aside></div> : <div className="empty-state"><h2>Your bag is waiting.</h2><p>Add something good from the catalogue to get started.</p><Link href="/catalogue" className="button button-dark">Explore catalogue <span>↗</span></Link></div>}</main><SiteFooter /></>;
}

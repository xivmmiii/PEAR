"use client";
import { useEffect, useState } from "react";
type Product = { slug: string; brand: string; name: string; status: string };
export function AdminModeration() {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  async function load() { const response = await fetch("/api/admin/products"); if (response.ok) setProducts((await response.json()).products); }
  useEffect(() => { fetch("/api/admin/products").then((response) => response.ok ? response.json() : { products: [] }).then((data) => setProducts(data.products)); }, []);
  async function setStatus(slug: string, status: string) { const response = await fetch("/api/admin/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, status }) }); setMessage(response.ok ? "Catalogue status updated." : "Could not update product."); void load(); }
  return <section className="admin-moderation"><div className="section-heading"><div><p className="eyebrow">Moderation queue</p><h2>Catalogue review</h2></div></div>{products.map((product) => <article key={product.slug}><div><strong>{product.brand}</strong><span>{product.name}</span></div><em>{product.status}</em><button className="button button-outline" onClick={() => setStatus(product.slug, "active")}>Approve</button><button className="button button-outline" onClick={() => setStatus(product.slug, "archived")}>Archive</button></article>)}{message && <p className="form-error">{message}</p>}</section>;
}

"use client";
import { useEffect, useState } from "react";

type SellerProduct = { slug: string; name: string; brand: string; price: number; stock: number; status: string };
export function SellerProducts() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [message, setMessage] = useState("");
  async function load() { const response = await fetch("/api/seller/products"); if (response.ok) setProducts((await response.json()).products); }
  useEffect(() => {
    fetch("/api/seller/products").then((response) => response.ok ? response.json() : { products: [] }).then((data) => setProducts(data.products));
  }, []);
  useEffect(() => {
    const refresh = () => void load();
    window.addEventListener("seller-product-added", refresh);
    return () => window.removeEventListener("seller-product-added", refresh);
  }, []);
  async function update(slug: string, values: object, label: string) { const response = await fetch("/api/seller/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, ...values }) }); setMessage(response.ok ? label : "Could not update product."); void load(); }
  return <section className="seller-products" id="seller-products"><div className="section-heading"><div><p className="eyebrow">Your catalogue</p><h2>Manage products</h2></div></div>{products.length ? products.map((product) => <article key={product.slug}><div><strong>{product.brand}</strong><span>{product.name}</span></div><label>Price<input type="number" defaultValue={product.price} onBlur={(event) => update(product.slug, { price: Number(event.currentTarget.value) }, "Price updated.")} /></label><label>Stock<input type="number" defaultValue={product.stock} onBlur={(event) => update(product.slug, { stock: Number(event.currentTarget.value) }, "Stock updated.")} /></label><em className={`status-${product.status}`}>{product.status}</em><button className="button button-outline" onClick={() => update(product.slug, { status: "archived" }, "Product archived.")}>Archive</button></article>) : <p className="empty-inline">Your products will appear here after you add them.</p>}{message && <p className="form-error">{message}</p>}</section>;
}

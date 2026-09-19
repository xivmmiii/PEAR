"use client";
import { useState } from "react";

export function ProductActions({ slug }: { slug: string }) {
  const [size, setSize] = useState("");
  const [message, setMessage] = useState("");
  async function add(path: string, body: object) {
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json();
    setMessage(response.ok ? "Saved to your PEAR account." : result.message ?? "Please sign in to continue.");
  }
  return <div className="product-actions"><label>Choose a size<select value={size} onChange={(event) => setSize(event.target.value)}><option value="">Select size</option><option>S</option><option>M</option><option>L</option><option>XL</option></select></label><div className="product-action-row"><button className="button button-dark" disabled={!size} onClick={() => add("/api/shopper/bag", { productId: slug, quantity: 1, size })}>Add to bag <span>↗</span></button><button className="button button-outline" onClick={() => add("/api/shopper/wishlist", { productId: slug })}>♡ Save</button></div>{message && <p className="form-error">{message}</p>}</div>;
}

"use client";

import { useEffect, useState } from "react";

type BagItem = { productId: string; quantity: number; size?: string | null };

export function ProductActions({ slug }: { slug: string }) {
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [message, setMessage] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch("/api/shopper/bag")
      .then((response) => response.ok ? response.json() : { bag: [] })
      .then((result) => {
        const item = (result.bag as BagItem[]).find((entry) => entry.productId === slug);
        if (item) {
          setQuantity(item.quantity);
          setSize(item.size ?? "");
        }
      });
  }, [slug]);

  async function add(path: string, body: object) {
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json();
    if (response.ok && path.includes("/bag")) {
      setQuantity((current) => current || 1);
      setMessage("Added to your bag.");
    } else {
      setMessage(response.ok ? "Saved to your PEAR account." : result.message ?? "Please sign in to continue.");
    }
  }

  async function updateQuantity(nextQuantity: number) {
    if (!size || nextQuantity < 1) return;
    setUpdating(true);
    const response = await fetch("/api/shopper/bag", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: slug, quantity: nextQuantity, size }),
    });
    setUpdating(false);
    if (response.ok) setQuantity(nextQuantity);
    else setMessage("Could not update your bag.");
  }

  return <div className="product-actions">
    <label>Choose a size<select value={size} onChange={(event) => setSize(event.target.value)}><option value="">Select size</option><option>S</option><option>M</option><option>L</option><option>XL</option></select></label>
    <div className="product-action-row">
      {quantity > 0 ? <div className="quantity-controls product-quantity-controls">
        <button type="button" disabled={updating} onClick={() => void updateQuantity(quantity - 1)}>-</button>
        <span>{quantity}</span>
        <button type="button" disabled={updating} onClick={() => void updateQuantity(quantity + 1)}>+</button>
      </div> : <button className="button button-dark" disabled={!size} onClick={() => void add("/api/shopper/bag", { productId: slug, quantity: 1, size })}>Add to bag <span>↗</span></button>}
      <button className="button button-outline" onClick={() => void add("/api/shopper/wishlist", { productId: slug })}>♡ Save</button>
    </div>
    {message && <p className="form-error">{message}</p>}
  </div>;
}

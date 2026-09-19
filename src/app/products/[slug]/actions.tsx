"use client";

import { useEffect, useState } from "react";

type BagItem = { productId: string; quantity: number; size?: string | null };

export function ProductActions({ slug, sizes = ["S", "M", "L", "XL"] }: { slug: string; sizes?: string[] }) {
  const [size, setSize] = useState("");
  const [bagItems, setBagItems] = useState<BagItem[]>([]);
  const [message, setMessage] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch("/api/shopper/bag")
      .then((response) => response.ok ? response.json() : { bag: [] })
      .then((result) => {
        setBagItems((result.bag as BagItem[]).filter((entry) => entry.productId === slug));
      });
  }, [slug]);

  async function add(path: string, body: object) {
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json();
    if (response.ok && path.includes("/bag")) {
      setBagItems((current) => [...current, { productId: slug, quantity: 1, size }]);
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
    if (response.ok) setBagItems((current) => current.map((item) => item.size === size ? { ...item, quantity: nextQuantity } : item));
    else setMessage("Could not update your bag.");
  }

  return <div className="product-actions">
    <fieldset className="size-picker"><legend>Choose a size</legend><div className="size-options">{sizes.map((option) => <button type="button" className={size === option ? "size-option selected" : "size-option"} key={option} onClick={() => setSize(option)}>{option}</button>)}</div></fieldset>
    <div className="product-action-row">
      {bagItems.find((item) => item.size === size)?.quantity ? <div className="quantity-controls product-quantity-controls">
        <button type="button" disabled={updating} onClick={() => void updateQuantity((bagItems.find((item) => item.size === size)?.quantity ?? 1) - 1)}>-</button>
        <span>{bagItems.find((item) => item.size === size)?.quantity}</span>
        <button type="button" disabled={updating} onClick={() => void updateQuantity((bagItems.find((item) => item.size === size)?.quantity ?? 0) + 1)}>+</button>
      </div> : <button className="button button-dark" disabled={!size} onClick={() => void add("/api/shopper/bag", { productId: slug, quantity: 1, size })}>Add to bag <span>↗</span></button>}
      <button className="button button-outline" onClick={() => void add("/api/shopper/wishlist", { productId: slug })}>♡ Save</button>
    </div>
    {message && <p className="form-error">{message}</p>}
  </div>;
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type ProductCardProps = {
  slug: string;
  name: string;
  brand: string;
  price: number;
  mrp: number;
  discountPercent: number;
  rating?: number;
  imageUrl: string;
  sizes?: string[];
};

export function ProductCard({ slug, name, brand, price, mrp, discountPercent, rating, imageUrl, sizes = ["S", "M", "L", "XL"] }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [size, setSize] = useState(sizes[0] ?? "");
  const [quantity, setQuantity] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([fetch("/api/shopper/wishlist"), fetch("/api/shopper/bag")]).then(async ([wishlistResponse, bagResponse]) => {
      const wishlist = wishlistResponse.ok ? await wishlistResponse.json() : { wishlist: [] };
      const bag = bagResponse.ok ? await bagResponse.json() : { bag: [] };
      setWishlisted(wishlist.wishlist.includes(slug));
      const item = bag.bag.find((entry: { productId: string; size?: string | null }) => entry.productId === slug && entry.size === size);
      setQuantity(item?.quantity ?? 0);
    }).catch(() => undefined);
  }, [slug, size]);

  async function toggleWishlist() {
    const response = wishlisted
      ? await fetch(`/api/shopper/wishlist?productId=${encodeURIComponent(slug)}`, { method: "DELETE" })
      : await fetch("/api/shopper/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: slug }) });
    if (response.ok) setWishlisted(!wishlisted);
    else setMessage("Sign in to save items.");
  }

  async function addToBag() {
    const response = await fetch("/api/shopper/bag", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: slug, quantity: 1, size }) });
    if (response.ok) setQuantity((current) => current + 1);
    else setMessage("Sign in to add items to your bag.");
  }

  async function updateQuantity(next: number) {
    if (next < 1) {
      const response = await fetch(`/api/shopper/bag?productId=${encodeURIComponent(slug)}&size=${encodeURIComponent(size)}`, { method: "DELETE" });
      if (response.ok) setQuantity(0);
      return;
    }
    const response = await fetch("/api/shopper/bag", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: slug, quantity: next, size }) });
    if (response.ok) setQuantity(next);
  }

  return <article className="product-card">
    <Link href={`/products/${slug}`} className="product-card-link"><div className="product-image"><Image src={imageUrl} alt={name} fill sizes="(max-width: 620px) 50vw, 25vw" /><span className="sale-tag">{discountPercent}% OFF</span></div><div className="product-info"><p className="product-brand">{brand}</p><h3>{name}</h3><div className="price-row"><strong>₹{price.toLocaleString("en-IN")}</strong><s>₹{mrp.toLocaleString("en-IN")}</s><em>{discountPercent}%</em></div>{rating !== undefined && <div className="rating">★ {rating}</div>}</div></Link>
    <div className="product-card-actions"><button className={wishlisted ? "wishlist-button active" : "wishlist-button"} onClick={() => void toggleWishlist()} aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}>♥</button><select value={size} onChange={(event) => setSize(event.target.value)} aria-label="Choose size">{sizes.map((option) => <option key={option}>{option}</option>)}</select>{quantity > 0 ? <div className="quantity-controls"><button onClick={() => void updateQuantity(quantity - 1)}>-</button><span>{quantity}</span><button onClick={() => void updateQuantity(quantity + 1)}>+</button></div> : <button className="bag-button" onClick={() => void addToBag()}>Add to bag</button>}</div>
    {message && <p className="form-error">{message}</p>}
  </article>;
}

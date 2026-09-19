"use client";
import { useState } from "react";

export function SellerProductForm() {
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Saving...");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/seller/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, price: Number(values.price), mrp: Number(values.mrp), stock: Number(values.stock), sizes: String(values.sizes ?? "").split(",").map((size) => size.trim()).filter(Boolean) }) });
    const result = await response.json();
    setMessage(response.ok ? "Product added to your catalogue." : result.message);
    if (response.ok) event.currentTarget.reset();
  }
  return <form className="seller-product-form" onSubmit={submit}><h2>Add a product</h2><div className="form-split"><input name="name" placeholder="Product name" required /><input name="brand" placeholder="Brand" required /></div><div className="form-split"><select name="category" defaultValue="men"><option value="men">Men</option><option value="women">Women</option><option value="kids">Kids</option><option value="footwear">Footwear</option><option value="accessories">Accessories</option><option value="ethnic-wear">Ethnic wear</option></select><input name="sizes" placeholder="Sizes: S, M, L" /></div><div className="form-split"><input name="price" type="number" min="1" placeholder="Selling price" required /><input name="mrp" type="number" min="1" placeholder="MRP" required /></div><div className="form-split"><input name="stock" type="number" min="1" placeholder="Stock" required /><input name="imageUrl" type="url" placeholder="Image URL" required /></div><textarea name="description" placeholder="Product description" rows={3} /><button className="button button-dark">Add product <span>↗</span></button>{message && <p className="form-error">{message}</p>}</form>;
}

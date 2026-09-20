"use client";
import { useState } from "react";

const clothingSizes = ["XS", "S", "M", "L", "XL", "XXL"];
const footwearSizes = ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"];
const maxImageSize = 5 * 1024 * 1024;

export function SellerProductForm() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageError, setImageError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [category, setCategory] = useState("men");
  const [saving, setSaving] = useState(false);

  function sentenceCase(value: string) {
    const trimmed = value.trim().toLowerCase();
    return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : "";
  }

  function validateNumber(name: string, value: string) {
    if (!value.trim()) return "This field is required.";
    if (!/^\d+$/.test(value.trim()) || Number.parseInt(value, 10) < 1) return "Enter a whole number greater than 0.";
    return "";
  }

  function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setImageError("");
    setImageUrl("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Upload a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }
    if (file.size > maxImageSize) {
      setImageError("Image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageUrl(String(reader.result));
    reader.onerror = () => setImageError("The image could not be read. Please try again.");
    reader.readAsDataURL(file);
  }

  const sizeOptions = category === "footwear" ? footwearSizes : clothingSizes;
  const showSizes = category !== "accessories";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const nextErrors = {
      price: validateNumber("price", String(values.price ?? "")),
      mrp: validateNumber("mrp", String(values.mrp ?? "")),
      stock: validateNumber("stock", String(values.stock ?? "")),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean) || imageError) return;
    setSaving(true);
    setMessage("Saving...");
    const response = await fetch("/api/seller/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: sentenceCase(String(values.name ?? "")), brand: sentenceCase(String(values.brand ?? "")), category: values.category, price: String(values.price ?? ""), mrp: String(values.mrp ?? ""), stock: String(values.stock ?? ""), sizes: selectedSizes, description: sentenceCase(String(values.description ?? "")), imageUrl }) });
    const result = await response.json().catch(() => ({ message: "Could not save the product." }));
    setMessage(response.ok ? "Product added to your catalogue." : result.message);
    setSaving(false);
    if (response.ok) {
      form.reset();
      setSelectedSizes([]);
      setImageUrl("");
      setCategory("men");
      setOpen(false);
      window.dispatchEvent(new Event("seller-product-added"));
      document.getElementById("seller-products")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  return <section className="seller-product-panel"><button className="seller-panel-trigger" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open}><span><strong>Add a product</strong><small>Create and publish a new catalogue item</small></span><b>{open ? "−" : "+"}</b></button>{open && <form className="seller-product-form" onSubmit={submit}><h2>Add a product</h2><div className="form-split"><label>Product name<input name="name" minLength={2} maxLength={40} placeholder="Product name" required /></label><label>Brand<input name="brand" minLength={2} maxLength={60} placeholder="Brand" required /></label></div><label>Category<select name="category" value={category} onChange={(event) => { const nextCategory = event.target.value; setCategory(nextCategory); if (nextCategory === "accessories") setSelectedSizes([]); else if (nextCategory === "footwear") setSelectedSizes((current) => current.filter((size) => footwearSizes.includes(size))); else setSelectedSizes((current) => current.filter((size) => clothingSizes.includes(size))); }}><option value="men">Men</option><option value="women">Women</option><option value="kids">Kids</option><option value="footwear">Footwear</option><option value="accessories">Accessories</option><option value="ethnic-wear">Ethnic wear</option></select></label>{showSizes && <fieldset><legend>{category === "footwear" ? "Available UK sizes" : "Available sizes"}</legend><div className="size-options">{sizeOptions.map((size) => <label key={size}><input type="checkbox" checked={selectedSizes.includes(size)} onChange={(event) => setSelectedSizes((current) => event.target.checked ? [...current, size] : current.filter((item) => item !== size))} />{size}</label>)}</div></fieldset>}<div className="form-split"><label>Selling price<input name="price" inputMode="numeric" pattern="[0-9]+" minLength={1} maxLength={9} placeholder="Selling price" required />{errors.price && <small className="form-error">{errors.price}</small>}</label><label>MRP<input name="mrp" inputMode="numeric" pattern="[0-9]+" minLength={1} maxLength={9} placeholder="MRP" required />{errors.mrp && <small className="form-error">{errors.mrp}</small>}</label></div><label>Stock<input name="stock" inputMode="numeric" pattern="[0-9]+" minLength={1} maxLength={6} placeholder="Stock" required />{errors.stock && <small className="form-error">{errors.stock}</small>}</label><label>Product image<input name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} /><small>Optional. JPG, PNG, or WebP, up to 5 MB.</small>{imageError && <small className="form-error">{imageError}</small>}</label><label>Description<textarea name="description" minLength={10} maxLength={500} placeholder="Product description (10-500 characters)" rows={3} /></label><button className="button button-dark" disabled={saving}>{saving ? "Saving..." : "Add product"} <span>↗</span></button>{message && <p className="form-error">{message}</p>}</form>}</section>;
}

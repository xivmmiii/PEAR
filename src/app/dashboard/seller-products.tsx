"use client";
import { useEffect, useState } from "react";

type SellerProduct = { slug: string; name: string; brand: string; price: number; stock: number; status: string };
export function SellerProducts() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
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
  function startEditing(product: SellerProduct) {
    setDrafts((current) => ({ ...current, [`${product.slug}-name`]: product.name, [`${product.slug}-brand`]: product.brand, [`${product.slug}-price`]: String(product.price), [`${product.slug}-stock`]: String(product.stock) }));
    setErrors((current) => ({ ...current, [product.slug]: "" }));
    setEditing((current) => ({ ...current, [product.slug]: true }));
  }
  async function saveProduct(product: SellerProduct) {
    const slug = product.slug;
    const name = drafts[`${slug}-name`] ?? product.name;
    const brand = drafts[`${slug}-brand`] ?? product.brand;
    const price = drafts[`${slug}-price`] ?? String(product.price);
    const stock = drafts[`${slug}-stock`] ?? String(product.stock);
    const errorsForProduct: string[] = [];
    if (!name.trim() || !brand.trim()) errorsForProduct.push("Product name and brand are required.");
    if (!/^\d+$/.test(price.trim()) || Number.parseInt(price, 10) < 1 || !/^\d+$/.test(stock.trim()) || Number.parseInt(stock, 10) < 1) errorsForProduct.push("Price and stock must be whole numbers greater than 0.");
    if (errorsForProduct.length) {
      setErrors((current) => ({ ...current, [slug]: errorsForProduct.join(" ") }));
      return;
    }
    const sentenceCase = (value: string) => value.trim().toLowerCase().replace(/^./, (character) => character.toUpperCase());
    await update(slug, { name: sentenceCase(name), brand: sentenceCase(brand), price: price.trim(), stock: stock.trim() }, "Product updated.");
    setEditing((current) => ({ ...current, [slug]: false }));
  }
  function field(product: SellerProduct, fieldName: "name" | "brand" | "price" | "stock", value: string) {
    const key = `${product.slug}-${fieldName}`;
    return <td>{editing[product.slug] ? <span className="editing-product-field"><small>Saved: {value}</small><input inputMode={fieldName === "price" || fieldName === "stock" ? "numeric" : undefined} value={drafts[key] ?? value} onChange={(event) => setDrafts((current) => ({ ...current, [key]: event.target.value }))} /></span> : <strong>{value}</strong>}</td>;
  }
  return <section className="seller-products" id="seller-products"><div className="section-heading"><div><p className="eyebrow">Your catalogue</p><h2>Manage products</h2><p className="seller-products-help">Saved product details are shown below. Select the pencil to edit this product.</p></div></div>{products.length ? <div className="seller-products-table-wrap"><table className="seller-products-table"><thead><tr><th>Brand</th><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead><tbody>{products.map((product) => <tr key={product.slug} className={editing[product.slug] ? "editing" : ""}>{field(product, "brand", product.brand)}{field(product, "name", product.name)}{field(product, "price", String(product.price))}{field(product, "stock", String(product.stock))}<td><em className={`status-${product.status}`}>{product.status}</em></td><td className="product-actions-cell">{editing[product.slug] ? <button className="button button-outline" onClick={() => void saveProduct(product)}>Update</button> : <><button type="button" className="edit-icon" onClick={() => startEditing(product)} aria-label={`Edit ${product.name}`}>✎</button><button className="button button-outline" onClick={() => update(product.slug, { status: "archived" }, "Product archived.")}>Archive</button></>}{errors[product.slug] && <small className="form-error">{errors[product.slug]}</small>}</td></tr>)}</tbody></table></div> : <p className="empty-inline">Your products will appear here after you add them.</p>}{message && <p className="form-error">{message}</p>}</section>;
}

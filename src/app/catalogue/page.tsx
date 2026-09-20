"use client";
import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ProductCard } from "@/components/product-card";

type Product = { slug: string; name: string; brand: string; category: string; price: number; mrp: number; discountPercent: number; rating: number; imageUrl: string };
export default function CataloguePage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  useEffect(() => { searchParams.then(({ search: initialSearch }) => setSearch(initialSearch ?? "")); }, [searchParams]);
  useEffect(() => { const params = new URLSearchParams({ ...(search ? { search } : {}), ...(category ? { category } : {}), sort }); fetch(`/api/products?${params}`).then((response) => response.json()).then((data) => setProducts(data.products)); }, [search, category, sort]);
  return <><SiteHeader /><main className="catalogue-browser page-width"><div className="catalogue-browser-heading"><div><p className="eyebrow">Everything good</p><h1>Find your <i>next.</i></h1></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search styles or brands" /></div><div className="catalogue-controls"><div>{["", "women", "men", "kids", "footwear"].map((value) => <button key={value} className={category === value ? "active" : ""} onClick={() => setCategory(value)}>{value || "All"}</button>)}</div><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="discount">Biggest discount</option></select></div>{products.length ? <div className="product-grid catalogue-results">{products.map((product) => <ProductCard key={product.slug} {...product} />)}</div> : <div className="empty-state"><h2>No match found.</h2><p>Try a different product name, brand, or category.</p></div>}</main><SiteFooter /></>;
}

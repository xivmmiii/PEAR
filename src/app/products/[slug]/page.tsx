import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { productsCollection, seedProducts } from "@/lib/catalogue";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ProductActions } from "./actions";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const normalized = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  let product = seedProducts.find((item) => item.slug === slug || normalized(`${item.brand}-${item.name}`) === slug);
  try {
    const row = await (await productsCollection()).findOne({ slug, status: "active" });
    if (row) product = row;
  } catch {}
  if (!product) notFound();
  return <><SiteHeader /><main className="product-detail page-width"><div className="product-detail-image"><Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 700px) 100vw, 55vw" priority /></div><div className="product-detail-copy"><Link href={`/catalogue/${product.category}`} className="text-link">Back to {product.category}</Link><p className="eyebrow">{product.brand}</p><h1>{product.name}</h1><p className="product-detail-price">₹{product.price.toLocaleString("en-IN")} <s>₹{product.mrp.toLocaleString("en-IN")}</s> <em>{product.discountPercent}% off</em></p><p className="product-description">{product.description}</p><p className="stock-note">{product.stock > 0 ? `${product.stock} pieces available` : "Currently out of stock"}</p><ProductActions slug={product.slug} sizes={product.sizes} /></div></main><SiteFooter /></>;
}

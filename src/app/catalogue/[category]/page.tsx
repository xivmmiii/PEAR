import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { productsCollection, seedProducts, type ProductDocument } from "@/lib/catalogue";

const categoryData: Record<string, { title: string; description: string; brands: string[]; image: string }> = {
  men: { title: "Men", description: "Sharp layers, relaxed fits and everyday essentials from brands you already love.", brands: ["Levi's", "Nike", "Adidas", "H&M"], image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1600&q=85" },
  women: { title: "Women", description: "Statement pieces, easy separates and new-season energy for every version of you.", brands: ["Zara", "H&M", "Mango", "Levi's"], image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=85" },
  kids: { title: "Kids", description: "Play-ready looks and comfortable staples for little people with big personalities.", brands: ["H&M Kids", "Nike", "Adidas", "Puma"], image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1600&q=85" },
  footwear: { title: "Footwear", description: "Fresh pairs for commutes, weekends, workouts and everywhere in between.", brands: ["Nike", "Adidas", "Puma", "New Balance"], image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=85" },
};

export async function generateMetadata({ params, searchParams }: { params: Promise<{ category: string }>; searchParams: Promise<{ brand?: string }> }) {
  const { category } = await params;
  const { brand } = await searchParams;
  const data = categoryData[category] ?? { title: "Catalogue", description: "Explore fashion on PEAR." };
  return { title: `${brand ?? data.title} — PEAR`, description: brand ? `Explore ${brand} styles on PEAR.` : data.description };
}

export default async function Catalogue({ params, searchParams }: { params: Promise<{ category: string }>; searchParams: Promise<{ brand?: string }> }) {
  const { category } = await params;
  const { brand } = await searchParams;
  const data = categoryData[category] ?? { title: "Catalogue", description: "Explore fashion on PEAR.", brands: ["Nike", "Zara", "Levi's", "Adidas"], image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=85" };
  const isBrandDirectory = category === "brands";
  const selectedTitle = brand || data.title;
  let products = brand
    ? seedProducts.filter((product) => product.brand.toLowerCase() === brand.toLowerCase())
    : seedProducts.filter((product) => product.category === category);
  try {
    const collection = await productsCollection();
    const query = brand ? { brand, status: "active" as const } : { category: category as ProductDocument["category"], status: "active" as const };
    const stored = await collection.find(query).sort({ createdAt: -1 }).limit(24).toArray();
    if (stored.length) products = stored;
  } catch {
    // The fallback keeps public catalogue pages available before MongoDB is configured.
  }
  return <><SiteHeader /><main className="category-page"><section className="category-hero"><Image src={data.image} alt="" fill sizes="100vw" priority /><div><p className="eyebrow">{isBrandDirectory ? "Brand directory" : "Shop the edit"}</p><h1>{selectedTitle} <i>style.</i></h1><p>{brand ? `Explore the latest ${brand} pieces available on PEAR.` : data.description}</p></div></section><section className="category-content page-width"><div className="section-heading"><div><p className="eyebrow">Popular now</p><h2>{brand ? `${brand} on PEAR` : "Products in this edit"}</h2></div><Link href="/" className="text-link">Back to home <span>↗</span></Link></div>{products.length ? <div className="product-grid">{products.map((product) => <Link href={`/products/${product.slug}`} className="product-card" key={product.slug}><div className="product-image"><Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 620px) 50vw, 25vw" /><span className="sale-tag">{product.discountPercent}% OFF</span></div><div className="product-info"><p className="product-brand">{product.brand}</p><h3>{product.name}</h3><div className="price-row"><strong>₹{product.price.toLocaleString("en-IN")}</strong><s>₹{product.mrp.toLocaleString("en-IN")}</s><em>{product.discountPercent}%</em></div><div className="rating">★ {product.rating}</div></div></Link>)}</div> : <div className="empty-state"><h2>No products found.</h2><p>Try exploring another brand from the directory.</p></div>}{isBrandDirectory && !brand && <div className="category-brand-grid category-brands">{data.brands.map((brandName) => <article key={brandName}><span>{brandName}</span><p>New season picks</p><Link href={`/catalogue/brands?brand=${encodeURIComponent(brandName)}`}>Explore <b>↗</b></Link></article>)}</div>}{isBrandDirectory && brand && <div className="category-coming"><p className="eyebrow">More from PEAR</p><h2>Find your next favourite.</h2><p>Browse more brands and discover new arrivals across the marketplace.</p><Link href="/catalogue/brands" className="button button-dark">Browse brands <span>↗</span></Link></div>}</section></main><SiteFooter /></>;
}

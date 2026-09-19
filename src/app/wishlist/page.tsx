import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { requireRole } from "@/lib/rbac";
import { productsCollection } from "@/lib/catalogue";
import { usersCollection } from "@/lib/mongodb";

export default async function WishlistPage() {
  const user = await requireRole(["shopper"]);
  if (!user) redirect("/signin");

  const users = await usersCollection();
  const account = await users.findOne({ email: user.email }, { projection: { wishlist: 1 } });
  const wishlist = account?.wishlist ?? [];
  const products = wishlist.length
    ? await (await productsCollection()).find({ slug: { $in: wishlist }, status: "active" }).toArray()
    : [];
  const productBySlug = new Map(products.map((product) => [product.slug, product]));
  const orderedProducts = wishlist.flatMap((slug) => {
    const product = productBySlug.get(slug);
    return product ? [product] : [];
  });

  return <><SiteHeader /><main className="orders-page page-width">
    <p className="eyebrow">Your saved styles</p>
    <h1>Wishlist <i>favourites.</i></h1>
    {orderedProducts.length ? <div className="product-grid">{orderedProducts.map((product) => <Link href={`/products/${product.slug}`} className="product-card" key={product.slug}>
      <div className="product-image"><Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 620px) 50vw, 25vw" /><span className="sale-tag">{product.discountPercent}% OFF</span></div>
      <div className="product-info"><p className="product-brand">{product.brand}</p><h3>{product.name}</h3><div className="price-row"><strong>₹{product.price.toLocaleString("en-IN")}</strong><s>₹{product.mrp.toLocaleString("en-IN")}</s><em>{product.discountPercent}% off</em></div><div className="rating">★ {product.rating}</div></div>
    </Link>)}</div> : <div className="empty-state"><h2>Your wishlist is empty.</h2><p>Save the pieces you love and they will appear here.</p><Link href="/catalogue" className="button button-dark">Explore catalogue <span>↗</span></Link></div>}
  </main><SiteFooter /></>;
}

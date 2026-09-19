import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { requireRole } from "@/lib/rbac";
import { SellerProductForm } from "./seller-form";
import { ShopperTools } from "./shopper-tools";
import { SellerProducts } from "./seller-products";

export default async function Dashboard() {
  const user = await requireRole(["shopper", "seller", "admin"]);
  if (!user) redirect("/signin");
  const seller = user.role === "seller";
  return <><SiteHeader /><main className="dashboard page-width"><div className="dashboard-intro"><p className="eyebrow">{seller ? "Seller studio" : "Your PEAR space"}</p><h1>Hello, <i>{user.email.split("@")[0]}</i>.</h1><p>{seller ? "Manage your label, products and orders from one place." : "Your saved styles and orders, all in one place."}</p></div><div className="dashboard-grid">{(seller ? [["◈", "Products", "Add and manage your catalogue"], ["↗", "Orders", "Track your customer orders"], ["✦", "Store profile", "Keep your brand up to date"]] : [["♡", "Wishlist", "Your saved pieces"], ["▢", "Orders", "Track your deliveries"], ["◒", "Profile", "Your account details"]]).map(([icon, title, copy]) => <article key={title}><b>{icon}</b><h2>{title}</h2><p>{copy}</p><span>{seller ? "Seller tools →" : "Shopper tools →"}</span></article>)}</div>{seller ? <><SellerProductForm /><SellerProducts /></> : <ShopperTools />}<div className="dashboard-actions"><Link className="button button-dark" href="/">Continue shopping <span>↗</span></Link><Link className="button button-outline" href="/orders">View orders</Link><form action="/api/auth/signout" method="post"><button className="button button-outline">Sign out</button></form></div></main><SiteFooter /></>;
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { requireRole } from "@/lib/rbac";
import { SellerDashboardTools } from "./seller-dashboard-tools";
import { ShopperTools } from "./shopper-tools";

export default async function Dashboard() {
  const user = await requireRole(["shopper", "seller", "admin"]);
  if (!user) redirect("/signin");
  const seller = user.role === "seller";
  const firstName = user.firstName || user.email.split("@")[0];
  return <><SiteHeader sellerDashboard={seller} /><main className="dashboard page-width"><div className="dashboard-intro"><p className="eyebrow">{seller ? "Seller studio" : "Your PEAR space"}</p><h1>Hello, <i>{firstName}</i>.</h1><p>{seller ? "Manage your label, products and orders from one place." : "Your saved styles and orders, all in one place."}</p></div>{seller ? <SellerDashboardTools /> : <ShopperTools />}<div className="dashboard-actions">{!seller && <><Link className="button button-dark" href="/">Continue shopping <span>↗</span></Link><Link className="button button-outline" href="/orders">View orders</Link></>}<form action="/api/auth/signout" method="post"><button className="button button-outline">Sign out</button></form></div></main><SiteFooter /></>;
}

import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { requireRole } from "@/lib/rbac";
import { AdminModeration } from "./moderation";

export default async function AdminPage() {
  const user = await requireRole(["admin"]);
  if (!user) redirect("/signin");
  return <><SiteHeader /><main className="admin-page page-width"><p className="eyebrow">Control centre</p><h1>Keep PEAR <i>good.</i></h1><p>Moderate sellers, products, customers and orders from one place.</p><div className="admin-grid"><article><b>◎</b><h2>Users & roles</h2><p>Approve sellers, manage roles and suspend accounts.</p></article><article><b>◈</b><h2>Catalogue</h2><p>Review product quality, brands and inventory listings.</p></article><article><b>↗</b><h2>Orders</h2><p>Monitor fulfilment, returns and marketplace health.</p></article></div><AdminModeration /></main><SiteFooter /></>;
}

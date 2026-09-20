"use client";
import { useState } from "react";
import { SellerProductForm } from "./seller-form";
import { SellerProducts } from "./seller-products";

const panels = [
  ["◈", "Manage products", "Add and manage your catalogue"],
  ["↗", "Orders", "Track your customer orders"],
  ["✦", "Store profile", "Keep your brand up to date"],
] as const;

export function SellerDashboardTools() {
  const [activePanel, setActivePanel] = useState<string | null>(null);

  return <><div className="dashboard-grid">{panels.map(([icon, title, copy]) => <button className="dashboard-panel-button" type="button" key={title} onClick={() => setActivePanel((current) => current === title ? null : title)} aria-expanded={activePanel === title}><article><b>{icon}</b><h2>{title}</h2><p>{copy}</p><span>{activePanel === title ? "Close panel" : "Open panel"} →</span></article></button>)}</div>{activePanel === "Manage products" && <div className="seller-panel-content"><SellerProductForm /><SellerProducts /></div>}{activePanel === "Orders" && <section className="seller-panel-placeholder"><h2>Orders</h2><p>Seller orders will appear here.</p></section>}{activePanel === "Store profile" && <section className="seller-panel-placeholder"><h2>Store profile</h2><p>Store profile settings will appear here.</p></section>}</>;
}

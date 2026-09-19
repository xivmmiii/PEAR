"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [bagCount, setBagCount] = useState(0);
  useEffect(() => { fetch("/api/shopper/bag").then((response) => response.ok ? response.json() : { bag: [] }).then((data) => setBagCount(data.bag.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0))).catch(() => setBagCount(0)); }, []);
  return <header className="site-header"><div className="page-width header-inner"><button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle menu">☰</button><Link className="logo" href="/">PEAR<span>●</span></Link><nav className={open ? "nav open" : "nav"}>{["Women", "Men", "Kids", "Footwear", "Accessories", "Brands"].map((item) => <Link href={`/catalogue/${item.toLowerCase()}`} key={item}>{item}</Link>)}</nav><div className="header-actions"><label className="search"><span>⌕</span><input placeholder="Search styles, brands..." /></label><Link href="/signin" aria-label="Wishlist" className="icon-link">♡</Link><Link href="/bag" aria-label="Shopping bag" className="icon-link bag-link">▢{bagCount > 0 && <small>{bagCount}</small>}</Link><Link className="join-link" href="/signin">Sign in <b>/</b> Join</Link></div></div></header>;
}

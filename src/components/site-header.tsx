"use client";
import Link from "next/link";
import { useState } from "react";
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="page-width header-inner"><button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle menu">☰</button><Link className="logo" href="/">PEAR<span>●</span></Link><nav className={open ? "nav open" : "nav"}>{["Women", "Men", "Kids", "Footwear", "Accessories", "Brands"].map((item) => <Link href={`/catalogue/${item.toLowerCase()}`} key={item}>{item}</Link>)}</nav><div className="header-actions"><label className="search"><span>⌕</span><input placeholder="Search for styles, brands..." /></label><Link href="/signin" aria-label="Wishlist" className="icon-link">♡</Link><Link href="/signin" aria-label="Shopping bag" className="icon-link">▢</Link><Link className="join-link" href="/signin">Sign in <b>/</b> Join</Link></div></div></header>;
}

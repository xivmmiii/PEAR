"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [bagCount, setBagCount] = useState(0);
  const [user, setUser] = useState<{ firstName: string; role: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => response.ok ? response.json() : { user: null })
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
    fetch("/api/shopper/bag").then((response) => response.ok ? response.json() : { bag: [] }).then((data) => setBagCount(data.bag.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0))).catch(() => setBagCount(0));
  }, []);
  const categories = [["Women", "/catalogue/women"], ["Men", "/catalogue/men"], ["Kids", "/catalogue/kids"], ["Footwear", "/catalogue/footwear"], ["Accessories", "/catalogue/accessories"], ["Brands", "/catalogue/brands"]] as const;
  return <header className="site-header"><div className="page-width header-inner"><button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle menu">☰</button><Link className="logo" href="/">PEAR<span>●</span></Link><nav className={open ? "nav open" : "nav"}>{categories.map(([item, href]) => <Link href={href} key={item} onClick={() => setOpen(false)}>{item}</Link>)}</nav><div className="header-actions"><label className="search"><span>⌕</span><input placeholder="Search styles, brands..." /></label><Link href={user ? "/wishlist" : "/signin"} aria-label="Wishlist" className="icon-link">♡</Link><Link href={user ? "/bag" : "/signin"} aria-label="Shopping bag" className="icon-link bag-link">▢{bagCount > 0 && <small>{bagCount}</small>}</Link>{!authChecked ? <span className="join-link auth-pending" aria-hidden="true">Sign in <b>/</b> Join</span> : user ? <Link className="join-link" href="/dashboard">{user.firstName || "Account"} <b>↗</b></Link> : <Link className="join-link" href="/signin">Sign in <b>/</b> Join</Link>}</div></div></header>;
}

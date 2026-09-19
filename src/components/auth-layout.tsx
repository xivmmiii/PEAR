import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "./site-header";
export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) { return <><SiteHeader /><main className="auth-page"><div className="auth-art"><Image src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85" alt="" fill sizes="50vw" priority /><div><p className="eyebrow">A little more you</p><h1>Wear what<br /><i>feels good.</i></h1></div></div><div className="auth-panel"><div className="auth-box"><Link href="/" className="auth-back">← Back to PEAR</Link><p className="eyebrow">{title}</p><h2>{subtitle}</h2>{children}</div></div></main></>; }

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const slides = [
  {
    eyebrow: "The winter edit",
    title: "Layer up. Stand out.",
    copy: "Cold-weather essentials in warm textures and bright new colour.",
    image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1800&q=85",
    tone: "hero-peach",
  },
  {
    eyebrow: "Festive dressing",
    title: "Made for more.",
    copy: "Modern occasionwear that brings the celebration with you.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1800&q=85",
    tone: "hero-lime",
  },
  {
    eyebrow: "The sneaker drop",
    title: "New steps, daily.",
    copy: "Fresh pairs, everyday energy. Your rotation starts here.",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1800&q=85",
    tone: "hero-cyan",
  },
];

const categories = [
  ["Women", "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=85"],
  ["Men", "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=85"],
  ["Kids", "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=85"],
  ["Footwear", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85"],
  ["Accessories", "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=800&q=85"],
  ["Ethnic wear", "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=800&q=85"],
];

const products = [
  ["Levi's", "Relaxed linen shirt", "₹1,299", "₹2,499", "48%", "4.8", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=85"],
  ["H&M", "Everyday cargo trousers", "₹1,899", "₹3,299", "42%", "4.6", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85"],
  ["Nike", "Air Max everyday trainers", "₹2,799", "₹4,999", "44%", "4.9", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85"],
  ["Zara", "Textured co-ord set", "₹2,199", "₹3,999", "45%", "4.7", "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=700&q=85"],
];

export default function Home() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, []);
  const slide = slides[active];

  return (
    <>
      <SiteHeader />
      <main>
        <section className={`hero ${slide.tone}`}>
          <img src={slide.image} alt="" className="hero-image" />
          <div className="hero-shade" />
          <div className="hero-content page-width">
            <p className="eyebrow">{slide.eyebrow}</p>
            <h1>{slide.title}</h1>
            <p className="hero-copy">{slide.copy}</p>
            <Link href="#trending" className="button button-dark">Shop the edit <span>↗</span></Link>
          </div>
          <div className="hero-dots page-width" aria-label="Choose campaign">
            {slides.map((item, index) => <button key={item.title} aria-label={`Show ${item.title}`} className={index === active ? "dot active" : "dot"} onClick={() => setActive(index)} />)}
          </div>
        </section>

        <section className="deal-strip"><div>UP TO <strong>60% OFF</strong></div><div>BUY 2, GET 1</div><div>NEW ARRIVALS <strong>DAILY</strong></div></section>

        <section className="section page-width">
          <div className="section-heading"><div><p className="eyebrow">Find your everyday</p><h2>Shop by category</h2></div><Link href="/signup" className="text-link">Explore all <span>↗</span></Link></div>
          <div className="category-grid">{categories.map(([name, image]) => <Link href={`/catalogue/${name.toLowerCase()}`} className="category-card" key={name}><img src={image} alt={name} /><span>{name}</span><b>→</b></Link>)}</div>
        </section>

        <section className="section section-tinted" id="trending">
          <div className="page-width">
            <div className="section-heading"><div><p className="eyebrow">Most wanted right now</p><h2>Trending on PEAR</h2></div><Link href="/catalogue" className="text-link">View all <span>↗</span></Link></div>
            <div className="product-grid">{products.map(([brand, name, price, mrp, off, rating, image]) => <article className="product-card" key={name}><div className="product-image"><img src={image} alt={name} /><button className="wishlist" aria-label={`Save ${name}`}>♡</button><span className="sale-tag">{off} OFF</span></div><div className="product-info"><p className="product-brand">{brand}</p><h3>{name}</h3><div className="price-row"><strong>{price}</strong><s>{mrp}</s><em>{off}</em></div><div className="rating">★ {rating} <span>·</span> <button>Add to bag</button></div><div className="sizes"><span>XS</span><span>S</span><span>M</span><span>L</span></div></div></article>)}</div>
          </div>
        </section>

        <section className="brand-section page-width"><div className="section-heading"><div><p className="eyebrow">Good company</p><h2>Brands in focus</h2></div><p className="brand-disclaimer">Explore popular brands available through PEAR.</p></div><div className="brand-row">{["LEVI'S", "NIKE", "ADIDAS", "ZARA", "H&M", "PUMA"].map((brand) => <span key={brand}>{brand}</span>)}</div></section>
        <section className="trust-row page-width"><div><b>↩</b><strong>30-day easy returns</strong><span>Try it, love it, or send it back.</span></div><div><b>✦</b><strong>Free shipping over ₹999</strong><span>More style, less delivery fee.</span></div><div><b>✓</b><strong>100% original brands</strong><span>Always authentic. Always PEAR.</span></div><div><b>₹</b><strong>Cash on delivery</strong><span>Shop your way, your choice.</span></div></section>
        <section className="seller-cta"><div className="page-width seller-inner"><div><p className="eyebrow">Have a label?</p><h2>Make room for<br /><i>your</i> good stuff.</h2></div><div><p>Put your fashion label in front of millions of curious shoppers. Simple tools, big reach, and a community that gets it.</p><Link href="/signup?role=seller" className="button button-light">Sell on PEAR <span>↗</span></Link></div></div></section>
      </main>
      <SiteFooter />
    </>
  );
}

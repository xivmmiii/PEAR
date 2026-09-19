import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const categoryData: Record<string, { title: string; description: string; brands: string[]; image: string }> = {
  men: { title: "Men", description: "Sharp layers, relaxed fits and everyday essentials from brands you already love.", brands: ["Levi's", "Nike", "Adidas", "H&M"], image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1600&q=85" },
  women: { title: "Women", description: "Statement pieces, easy separates and new-season energy for every version of you.", brands: ["Zara", "H&M", "Mango", "Levi's"], image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=85" },
  kids: { title: "Kids", description: "Play-ready looks and comfortable staples for little people with big personalities.", brands: ["H&M Kids", "Nike", "Adidas", "Puma"], image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1600&q=85" },
  footwear: { title: "Footwear", description: "Fresh pairs for commutes, weekends, workouts and everywhere in between.", brands: ["Nike", "Adidas", "Puma", "New Balance"], image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=85" },
};

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const data = categoryData[category] ?? { title: "Catalogue", description: "Explore fashion on PEAR." };
  return { title: `${data.title} — PEAR`, description: data.description };
}

export default async function Catalogue({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const data = categoryData[category] ?? { title: "Catalogue", description: "Explore fashion on PEAR.", brands: ["Nike", "Zara", "Levi's", "Adidas"], image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=85" };
  return <><SiteHeader /><main className="category-page"><section className="category-hero"><img src={data.image} alt="" /><div><p className="eyebrow">Shop the edit</p><h1>{data.title} <i>style.</i></h1><p>{data.description}</p></div></section><section className="category-content page-width"><div className="section-heading"><div><p className="eyebrow">Popular now</p><h2>Brands in this edit</h2></div><Link href="/" className="text-link">Back to home <span>↗</span></Link></div><div className="category-brand-grid">{data.brands.map((brand) => <article key={brand}><span>{brand}</span><p>New season picks</p><Link href="#coming-soon">Explore <b>↗</b></Link></article>)}</div><div id="coming-soon" className="category-coming"><p className="eyebrow">More on the way</p><h2>Your next favourite is almost here.</h2><p>PEAR&apos;s full catalogue is being curated with new arrivals, sizes and trusted sellers.</p></div></section></main><SiteFooter /></>;
}

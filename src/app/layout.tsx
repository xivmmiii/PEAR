import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "PEAR — Good clothes. Good energy.", description: "Discover clothes, footwear and accessories from curious independent labels on PEAR." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }

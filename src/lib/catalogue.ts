import type { Collection, ObjectId } from "mongodb";
import { getDb } from "./mongodb";

export type ProductDocument = {
  _id?: ObjectId;
  slug: string;
  name: string;
  brand: string;
  category: "men" | "women" | "kids" | "footwear" | "accessories" | "ethnic-wear";
  description: string;
  price: number;
  mrp: number;
  discountPercent: number;
  rating: number;
  sizes: string[];
  imageUrl: string;
  stock: number;
  sellerId?: string;
  status: "draft" | "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
};

export const seedProducts: Omit<ProductDocument, "_id" | "createdAt" | "updatedAt">[] = [
  { slug: "levis-relaxed-linen-shirt", name: "Relaxed linen shirt", brand: "Levi's", category: "men", description: "An easy linen shirt for warm days and late plans.", price: 1299, mrp: 2499, discountPercent: 48, rating: 4.8, sizes: ["S", "M", "L", "XL"], imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85", stock: 32, status: "active" },
  { slug: "hm-everyday-cargo-trousers", name: "Everyday cargo trousers", brand: "H&M", category: "men", description: "Relaxed utility trousers with a clean everyday fit.", price: 1899, mrp: 3299, discountPercent: 42, rating: 4.6, sizes: ["S", "M", "L", "XL"], imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85", stock: 24, status: "active" },
  { slug: "zara-textured-coord-set", name: "Textured co-ord set", brand: "Zara", category: "women", description: "A textural two-piece that does day-to-dinner beautifully.", price: 2199, mrp: 3999, discountPercent: 45, rating: 4.7, sizes: ["XS", "S", "M", "L"], imageUrl: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85", stock: 18, status: "active" },
  { slug: "nike-air-max-everyday", name: "Air Max everyday trainers", brand: "Nike", category: "footwear", description: "Cushioned everyday sneakers with a little extra lift.", price: 2799, mrp: 4999, discountPercent: 44, rating: 4.9, sizes: ["6", "7", "8", "9", "10"], imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85", stock: 41, status: "active" },
];

export async function productsCollection(): Promise<Collection<ProductDocument>> {
  const collection = (await getDb()).collection<ProductDocument>("products");
  await Promise.all([collection.createIndex({ slug: 1 }, { unique: true }), collection.createIndex({ category: 1, status: 1 }), collection.createIndex({ brand: 1 })]);
  return collection;
}

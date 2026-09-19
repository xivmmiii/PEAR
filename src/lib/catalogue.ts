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

const additionalSeedDefinitions: [ProductDocument["category"], string, string[], number][] = [
  ["men", "Roadster", ["Oxford cotton shirt", "Relaxed denim jacket", "Tapered joggers", "Textured polo tee", "Slim fit chinos", "Lightweight overshirt", "Graphic crew neck", "Weekend linen trousers"], 1399],
  ["women", "Mango", ["Satin wrap blouse", "Wide leg trousers", "Ribbed knit dress", "Cropped denim jacket", "Printed midi skirt", "Relaxed blazer", "Everyday tote dress", "Pleated palazzo pants", "Soft cotton cardigan"], 1599],
  ["kids", "H&M Kids", ["Printed hoodie", "Comfy jogger set", "Rainbow cotton tee", "Denim dungarees", "Festive kurta set", "Utility shorts", "Striped polo tee", "Floral play dress", "Puffer jacket", "Canvas sneakers"], 799],
  ["footwear", "Puma", ["Street rider sneakers", "Court classic trainers", "Daily comfort slides", "Running knit shoes", "Retro high-top sneakers", "Minimal slip-on shoes", "Trail-ready sneakers", "Platform casual shoes", "Soft home slippers"], 1499],
  ["accessories", "Fossil", ["Leather crossbody bag", "Everyday canvas backpack", "Classic analog watch", "Textured sunglasses", "Slim card wallet", "Pearl drop earrings", "Canvas belt", "Travel cap", "Chain shoulder bag", "Minimal bracelet"], 899],
  ["ethnic-wear", "Manyavar", ["Printed festive kurta", "Embroidered anarkali", "Cotton saree edit", "Mirror-work blouse", "Festive palazzo set", "Silk blend sherwani", "Organza dupatta", "Chikankari straight kurta", "Bandhani co-ord set", "Embroidered Nehru jacket"], 1299],
];

const additionalSeedProducts: Omit<ProductDocument, "_id" | "createdAt" | "updatedAt">[] = additionalSeedDefinitions.flatMap(([category, brand, names, startingPrice]) => names.map((name, index) => {
  const price = Number(startingPrice) + index * 150;
  const slug = `${String(brand).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return {
    slug,
    name,
    brand,
    category: category as ProductDocument["category"],
    description: `${name} from ${brand}, selected for the PEAR edit.`,
    price,
    mrp: price * 2,
    discountPercent: 50,
    rating: Number((4.2 + (index % 8) / 10).toFixed(1)),
    sizes: category === "footwear" ? ["6", "7", "8", "9", "10"] : category === "kids" ? ["2-3Y", "4-5Y", "6-7Y", "8-9Y"] : ["S", "M", "L", "XL"],
    imageUrl: `https://images.unsplash.com/photo-${["1529139574466-a303027c1d8b", "1515886657613-9f3515b0c78f", "1551488831-00ddcb6c6bd3", "1542291026-7eec264c27ff", "1525507119028-ed4c629a60a3"][index % 5]}?auto=format&fit=crop&w=900&q=85`,
    stock: 20 + index,
    status: "active" as const,
  };
}));

seedProducts.push(...additionalSeedProducts);

export async function productsCollection(): Promise<Collection<ProductDocument>> {
  const collection = (await getDb()).collection<ProductDocument>("products");
  await Promise.all([collection.createIndex({ slug: 1 }, { unique: true }), collection.createIndex({ category: 1, status: 1 }), collection.createIndex({ brand: 1 })]);
  return collection;
}

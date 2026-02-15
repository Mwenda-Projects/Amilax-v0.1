/**
 * ============================================================
 * SUPPLEMENT PRODUCTS CONFIGURATION (Retail Shop)
 * ============================================================
 */

export interface Supplement {
  id: string;
  name: string;
  dosage: string;
  price: number; // New field for the shop
  stock: number; // New field for "Only 5 Remaining"
  image?: string; 
}

export interface SupplementCategory {
  name: string;
  icon: string;
  description: string;
  products: Supplement[];
}

const supplementCategories: SupplementCategory[] = [
  {
    name: "Vitamins & Wellness",
    icon: "leaf",
    description: "Daily essentials to boost your immune system and energy levels.",
    products: [
      { id: "vit-c-1", name: "Vitamin C High Potency", dosage: "1000mg", price: 1200, stock: 15 },
      { id: "vit-d-1", name: "Vitamin D3 Sunshine", dosage: "1000 IU", price: 850, stock: 4 }, // Will show "Low Stock"
      { id: "mult-1", name: "Daily Multivitamin", dosage: "60 Tablets", price: 2100, stock: 10 },
    ],
  },
  {
    name: "Fitness & Training",
    icon: "dumbbell",
    description: "Support your workout recovery and muscle growth.",
    products: [
      { id: "prot-1", name: "Whey Protein Isolate", dosage: "1kg", price: 4500, stock: 8 },
      { id: "bcaa-1", name: "BCAA Recovery Powder", dosage: "300g", price: 3200, stock: 12 },
    ],
  }
];

export default supplementCategories;
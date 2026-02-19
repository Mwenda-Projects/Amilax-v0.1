/**
 * ============================================================
 * SUPPLEMENT PRODUCTS CONFIGURATION (Retail Shop)
 * ============================================================
 */

export interface Supplement {
  id: string;
  name: string;
  dosage: string;
  price: number;
  stock: number;
  image?: string;
  description?: string;
  benefits?: string[];
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
      {
        id: "vit-c-1",
        name: "Vitamin C High Potency",
        dosage: "1000mg · 60 Capsules",
        price: 1200,
        stock: 15,
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=220&fit=crop",
        description:
          "A powerful antioxidant formula to support immune defence, skin health, and energy metabolism. Buffered for gentle absorption — suitable for daily use without stomach discomfort.",
        benefits: ["Immune Support", "Antioxidant", "Skin Health"],
      },
      {
        id: "vit-d-1",
        name: "Vitamin D3 Sunshine",
        dosage: "1000 IU · 90 Softgels",
        price: 850,
        stock: 4,
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=220&fit=crop",
        description:
          "Essential for strong bones, a healthy immune system, and mood regulation. Each softgel provides cholecalciferol — the most bioavailable form of Vitamin D — dissolved in a carrier oil for optimal absorption.",
        benefits: ["Bone Health", "Mood Support", "Immune Boost"],
      },
      {
        id: "mult-1",
        name: "Daily Multivitamin",
        dosage: "60 Tablets · Complete Formula",
        price: 2100,
        stock: 10,
        image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=220&fit=crop",
        description:
          "A comprehensive once-daily formula packed with 23 essential vitamins and minerals. Covers nutritional gaps, supports energy, focus, and overall vitality — perfect for busy lifestyles.",
        benefits: ["23 Nutrients", "Energy & Focus", "Once Daily"],
      },
    ],
  },
  {
    name: "Fitness & Training",
    icon: "dumbbell",
    description: "Support your workout recovery and muscle growth.",
    products: [
      {
        id: "prot-1",
        name: "Whey Protein Isolate",
        dosage: "1kg · Chocolate Flavour",
        price: 4500,
        stock: 8,
        image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=220&fit=crop",
        description:
          "High-quality whey protein isolate with 27g of protein per serving and minimal fat and lactose. Ideal for post-workout recovery, muscle building, and high-protein diets. Mixes easily with water or milk.",
        benefits: ["27g Protein/Serving", "Low Lactose", "Muscle Recovery"],
      },
      {
        id: "bcaa-1",
        name: "BCAA Recovery Powder",
        dosage: "300g · Tropical Flavour",
        price: 3200,
        stock: 12,
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=220&fit=crop",
        description:
          "Branched-Chain Amino Acids in a proven 2:1:1 ratio of Leucine, Isoleucine, and Valine. Reduces muscle soreness, speeds up recovery, and supports endurance during intense training sessions.",
        benefits: ["2:1:1 BCAA Ratio", "Reduces Soreness", "Endurance"],
      },
    ],
  },
];

export default supplementCategories;
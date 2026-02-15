/**
 * ============================================================
 * MEDICINE CATEGORIES CONFIGURATION
 * ============================================================
 *
 * Edit this file to add, remove, reorder, or modify medicine
 * categories displayed on the Medicines page.
 *
 * HOW TO USE:
 * - Each category needs: name, icon, description, examples
 * - "note" is optional (e.g. "Prescription required")
 * - "medicines" is an array of { name, dosage } objects
 * - To reorder categories, simply move the object up or down
 * - To add a new category, copy an existing one and modify it
 * - Icon must be a valid lucide-react icon name (kebab-case)
 *   Full list: https://lucide.dev/icons
 *
 * ============================================================
 */

export interface Medicine {
  /** Medicine name */
  name: string;
  /** Dosage / strength */
  dosage: string;
}

export interface MedicineCategory {
  /** Display name of the category */
  name: string;
  /**
   * Lucide icon name in kebab-case.
   */
  icon: string;
  /** Short description of what the category includes */
  description: string;
  /** Example medicine names shown as tags */
  examples: string[];
  /** Optional badge text (e.g. "Prescription required") */
  note?: string;
  /** Individual medicines in stock */
  medicines?: Medicine[];
}

const medicineCategories: MedicineCategory[] = [
  {
    name: "Pain Relief",
    icon: "pill",
    description:
      "Medicines for headaches, body pain, fever, and inflammation. Includes common over-the-counter and prescription pain relievers.",
    examples: [
      "Paracetamol",
      "Ibuprofen",
      "Diclofenac",
      "Aspirin",
      "Mefenamic Acid",
    ],
    medicines: [
      { name: "Paracetamol", dosage: "500mg" },
      { name: "Paracetamol", dosage: "1g" },
      { name: "Ibuprofen", dosage: "200mg" },
      { name: "Ibuprofen", dosage: "400mg" },
      { name: "Diclofenac Sodium", dosage: "50mg" },
      { name: "Diclofenac Gel", dosage: "1%" },
      { name: "Aspirin", dosage: "300mg" },
      { name: "Mefenamic Acid", dosage: "500mg" },
      { name: "Tramadol", dosage: "50mg" },
      { name: "Naproxen", dosage: "250mg" },
    ],
  },
  {
    name: "Antibiotics",
    icon: "shield-plus",
    description:
      "Prescription antibiotics for bacterial infections. All antibiotics are dispensed only with a valid prescription verified by our pharmacist.",
    examples: [
      "Amoxicillin",
      "Azithromycin",
      "Ciprofloxacin",
      "Metronidazole",
      "Cephalexin",
    ],
    note: "Prescription required",
    medicines: [
      { name: "Amoxicillin", dosage: "500mg" },
      { name: "Amoxicillin", dosage: "250mg/5ml Syrup" },
      { name: "Azithromycin", dosage: "500mg" },
      { name: "Azithromycin", dosage: "250mg" },
      { name: "Ciprofloxacin", dosage: "500mg" },
      { name: "Metronidazole", dosage: "400mg" },
      { name: "Metronidazole", dosage: "200mg/5ml Suspension" },
      { name: "Cephalexin", dosage: "500mg" },
      { name: "Doxycycline", dosage: "100mg" },
      { name: "Co-trimoxazole", dosage: "480mg" },
      { name: "Erythromycin", dosage: "500mg" },
      { name: "Flucloxacillin", dosage: "500mg" },
    ],
  },
  {
    name: "Vitamins",
    icon: "heart",
    description:
      "Daily vitamins, mineral supplements, and health boosters to support your overall well-being.",
    examples: [
      "Vitamin D3",
      "Vitamin C",
      "B-Complex",
      "Calcium",
      "Iron Supplements",
    ],
    medicines: [
      { name: "Vitamin C", dosage: "1000mg" },
      { name: "Vitamin D3", dosage: "1000 IU" },
      { name: "Vitamin B-Complex", dosage: "Tablets" },
      { name: "Calcium + Vitamin D", dosage: "600mg/400IU" },
      { name: "Iron (Ferrous Sulphate)", dosage: "200mg" },
      { name: "Folic Acid", dosage: "5mg" },
      { name: "Zinc", dosage: "20mg" },
      { name: "Multivitamin", dosage: "Tablets" },
      { name: "Omega-3 Fish Oil", dosage: "1000mg" },
    ],
  },
  {
    name: "Baby Care",
    icon: "baby",
    description:
      "Safe and trusted products for infants and toddlers — from nutrition to everyday care essentials.",
    examples: [
      "Gripe Water",
      "Baby Lotion",
      "Diaper Cream",
      "Infant Drops",
      "Teething Gel",
    ],
    medicines: [
      { name: "Gripe Water", dosage: "150ml" },
      { name: "Calpol (Paracetamol)", dosage: "120mg/5ml" },
      { name: "Baby Zinc Drops", dosage: "20mg/ml" },
      { name: "ORS Sachets", dosage: "Paediatric" },
      { name: "Nystatin Oral Drops", dosage: "100,000 IU/ml" },
      { name: "Teething Gel", dosage: "15g" },
      { name: "Baby Vitamin D Drops", dosage: "400 IU" },
      { name: "Diaper Rash Cream", dosage: "50g" },
    ],
  },
  {
    name: "Skincare",
    icon: "sparkles",
    description:
      "Dermatologist-recommended creams, lotions, and treatments for various skin conditions.",
    examples: [
      "Moisturizers",
      "Sunscreen",
      "Antifungal Cream",
      "Calamine Lotion",
      "Acne Treatment",
    ],
    medicines: [
      { name: "Clotrimazole Cream", dosage: "1%" },
      { name: "Hydrocortisone Cream", dosage: "1%" },
      { name: "Calamine Lotion", dosage: "100ml" },
      { name: "Aqueous Cream", dosage: "500g" },
      { name: "Sunscreen SPF 50", dosage: "100ml" },
      { name: "Benzoyl Peroxide", dosage: "5% Gel" },
      { name: "Miconazole Cream", dosage: "2%" },
      { name: "Petroleum Jelly", dosage: "250g" },
    ],
  },
];

export default medicineCategories;

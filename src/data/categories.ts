// Lines of business: dry fruits, and crops grown in the valley (spices and orchard fruit).
// Kept apart from products.ts so server code (e.g. the Mongoose model) can use
// it without pulling in the bundled photos.
export const productCategories = ["Dry fruits", "Crops"] as const;

export type ProductCategory = (typeof productCategories)[number];

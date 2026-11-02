/**
 * Seeds the products collection with the starter catalogue (text,
 * specifications and ordering details; photos are added later in the admin).
 *
 *   npm run seed:products
 *
 * Safe to run again:
 * - products whose ID (slug) doesn't exist yet are added;
 * - existing products get the starter specifications and ordering details
 *   only where those sections are still completely empty;
 * - nothing entered in the admin is ever overwritten.
 */
import mongoose from "mongoose";
import type { ProductOrdering } from "@/data/ordering";
import { starterOrdering } from "@/data/starter-ordering";
import { starterSpecs } from "@/data/starter-specs";
import { starterProducts } from "@/data/starter-products";
import { connectDB } from "@/lib/server/mongoose";
import { ProductModel } from "@/models/Product";

const EMPTY_ORDERING: ProductOrdering = { availability: "available", packaging: [], deliveryRegions: [] };

/** True while none of the ordering details have been filled in. */
function orderingIsEmpty(o: Partial<ProductOrdering> | undefined) {
  return (
    !o ||
    (!o.moq && !o.leadTimeDays && !o.samples && !o.paymentTerms && !o.notes && !o.packaging?.length && !o.deliveryRegions?.length)
  );
}

async function main() {
  await connectDB();
  console.log(`Seeding products into database "${mongoose.connection.db!.databaseName}"…`);

  const last = await ProductModel.findOne().sort({ position: -1 }).select("position").lean<{ position: number }>();
  let position = (last?.position ?? -1) + 1;
  const counts = { added: 0, updated: 0, skipped: 0 };

  for (const p of starterProducts) {
    const ordering = starterOrdering[p.slug] ?? EMPTY_ORDERING;
    const specs = starterSpecs[p.slug] ?? [];
    const doc = await ProductModel.findOne({ slug: p.slug });

    if (!doc) {
      await ProductModel.create({ ...p, specs, gallery: [], ordering, published: true, position: position++ });
      counts.added++;
      console.log(`  added    ${p.name}`);
      continue;
    }

    const filled: string[] = [];
    const current = doc.toObject() as { ordering?: Partial<ProductOrdering>; specs?: unknown[] };
    if (starterOrdering[p.slug] && orderingIsEmpty(current.ordering)) {
      doc.set("ordering", ordering);
      filled.push("ordering");
    }
    if (specs.length && !current.specs?.length) {
      doc.set("specs", specs);
      filled.push("specifications");
    }
    if (filled.length) {
      await doc.save(); // runs the model's validation
      counts.updated++;
      console.log(`  updated  ${p.name}: ${filled.join(", ")}`);
    } else {
      counts.skipped++;
      console.log(`  skip     ${p.name} (already set up)`);
    }
  }

  console.log(`Done: ${counts.added} added, ${counts.updated} updated, ${counts.skipped} left as they were.`);
  console.log("Restart `npm run dev` (or redeploy) to see the changes on the website.");
}

main()
  .catch((err) => {
    console.error("Seeding failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

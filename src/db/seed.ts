import { db } from './index';
import { branches, categories, products } from './schema';
import { inMemoryBranches, inMemoryCategories, inMemoryProducts } from '../lib/payload';

async function seed() {
  console.log('Starting Cloud SQL database seeding...');

  // Seed branches
  for (const b of inMemoryBranches) {
    await db.insert(branches).values({
      id: b.id,
      name: b.name,
      slug: b.slug,
      area: b.area,
      deliveryFee: b.deliveryFee,
      deliveryEnabled: b.deliveryEnabled ?? true,
      isDemo: b.isDemo,
      notice: b.notice ?? null,
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${inMemoryBranches.length} branches.`);

  // Seed categories
  for (const c of inMemoryCategories) {
    await db.insert(categories).values({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? null,
      sortOrder: c.sortOrder ?? 0,
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${inMemoryCategories.length} categories.`);

  // Seed products
  for (const p of inMemoryProducts) {
    const catId = typeof p.category === 'object' ? p.category.id : p.category;
    const branchIds = (p.branches ?? []).map((b) => typeof b === 'object' ? b.id : b);
    await db.insert(products).values({
      id: p.id,
      legacyId: p.legacyId ?? null,
      sku: p.sku,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      manufacturer: p.manufacturer ?? null,
      categoryId: catId,
      branchIds: branchIds,
      packageSize: p.packageSize,
      packVerification: p.packVerification,
      unitPrice: p.unitPrice,
      priceStatus: p.priceStatus,
      availability: p.availability,
      description: p.description,
      productSource: p.productSource ?? null,
      active: p.active,
      isDemo: p.isDemo,
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${inMemoryProducts.length} products.`);
  console.log('Database seeding finished successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

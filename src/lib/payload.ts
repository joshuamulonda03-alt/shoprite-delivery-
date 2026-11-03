import type { Config, Product as ProductRecord, Category as CategoryRecord, Branch as BranchRecord, Order as OrderRecord } from "@/payload-types"
import { db } from "@/db/index"
import { branches as branchesTable, categories as categoriesTable, products as productsTable, orders as ordersTable } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

type CollectionSlug = keyof Config["collections"]

export const inMemoryBranches: BranchRecord[] = [
  {
    id: 'lusaka',
    name: 'Lusaka — Cairo Road (Demo)',
    slug: 'lusaka-cairo',
    area: 'Lusaka Central',
    isDemo: true,
    deliveryEnabled: true,
    deliveryFee: 35,
    notice: 'Central business district delivery',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'makeni',
    name: 'Lusaka — Makeni Mall (Demo)',
    slug: 'lusaka-makeni',
    area: 'Kafue Road',
    isDemo: true,
    deliveryEnabled: true,
    deliveryFee: 40,
    notice: 'Serving Makeni, Chilanga, Lilayi',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'manda-hill',
    name: 'Lusaka — Manda Hill (Demo)',
    slug: 'lusaka-manda-hill',
    area: 'Great East Road',
    isDemo: true,
    deliveryEnabled: true,
    deliveryFee: 35,
    notice: 'Serving Olympia, Rhodes Park, Northmead',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'kitwe',
    name: 'Kitwe — ECL Mall (Demo)',
    slug: 'kitwe-ecl',
    area: 'Freedom Way',
    isDemo: true,
    deliveryEnabled: true,
    deliveryFee: 45,
    notice: 'Copperbelt demonstration hub',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'ndola',
    name: 'Ndola — Rekays Mall (Demo)',
    slug: 'ndola-rekays',
    area: 'Broadway',
    isDemo: true,
    deliveryEnabled: true,
    deliveryFee: 45,
    notice: 'Serving Kansenshi, Northrise, Itawa',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
]

export const inMemoryCategories: CategoryRecord[] = [
  {
    id: 'cat-food-cupboard',
    name: 'Food Cupboard',
    slug: 'food-cupboard',
    description: 'Meal, rice, flour, cooking oil, sugar and pantry essentials',
    sortOrder: 1,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'cat-fresh-produce',
    name: 'Fresh Produce',
    slug: 'fresh-produce',
    description: 'Fresh fruits and seasonal market vegetables',
    sortOrder: 2,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'cat-bakery',
    name: 'Bakery',
    slug: 'bakery',
    description: 'Daily fresh bread, rolls, buns and tea treats',
    sortOrder: 3,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'cat-butchery',
    name: 'Butchery',
    slug: 'butchery',
    description: 'Fresh beef, poultry, pork cuts and sausages',
    sortOrder: 4,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'cat-dairy',
    name: 'Dairy & Eggs',
    slug: 'dairy',
    description: 'Milk, sour milk (lacto), butter, cheese and fresh eggs',
    sortOrder: 5,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'cat-beverages',
    name: 'Beverages',
    slug: 'beverages',
    description: 'Juices, water, soft drinks and cordials',
    sortOrder: 6,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'cat-cleaning',
    name: 'Household & Cleaning',
    slug: 'cleaning',
    description: 'Detergents, dishwash, surface cleaners and supplies',
    sortOrder: 7,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'cat-personal-care',
    name: 'Personal Care',
    slug: 'personal-care',
    description: 'Soaps, haircare, body lotion and dental hygiene',
    sortOrder: 8,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'cat-snacks',
    name: 'Snacks & Confectionery',
    slug: 'snacks',
    description: 'Biscuits, crisps, sweets and confectionery',
    sortOrder: 9,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'cat-baby',
    name: 'Baby & Toddler',
    slug: 'baby',
    description: 'Nappies, baby formula, wipes and gentle baby care',
    sortOrder: 10,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'cat-frozen',
    name: 'Frozen Foods',
    slug: 'frozen',
    description: 'Frozen vegetables, lake fish, chicken cuts and frozen meals',
    sortOrder: 11,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'cat-wines',
    name: 'Wines & Cellar',
    slug: 'wines-cellar',
    description: 'Fine red, white, rosé, sweet and sparkling wines',
    sortOrder: 12,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'cat-alcohol',
    name: 'LiquorShop & Alcohol',
    slug: 'liquorshop-alcohol',
    description: 'Authentic Zambian beers, ciders, whiskies, spirits and liqueurs (18+ only)',
    sortOrder: 13,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
]

const allBranchIds = ['lusaka', 'makeni', 'manda-hill', 'kitwe', 'ndola']

export const inMemoryProducts: (ProductRecord & { imageUrl?: string })[] = [
  {
    id: 'rice',
    legacyId: 1,
    name: 'White Rice 2 kg',
    slug: 'white-rice-2kg',
    sku: 'ZM-GROC-001',
    brand: 'Spekko',
    manufacturer: 'National Milling',
    category: inMemoryCategories[0],
    branches: allBranchIds,
    packageSize: '2 kg',
    packVerification: 'verified',
    unitPrice: 74.99,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Long grain parboiled white rice, triple polished and quick cooking. Ideal family staple.',
    productSource: 'Shoprite Zambia Catalogue',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'boom',
    legacyId: 2,
    name: 'Boom Sparkle Plus Lemon',
    slug: 'boom-sparkle-plus-lemon-750ml',
    sku: 'ZM-CLN-002',
    brand: 'Boom',
    manufacturer: 'Trade Kings',
    category: inMemoryCategories[6],
    branches: allBranchIds,
    packageSize: '750 ml',
    packVerification: 'verified',
    unitPrice: 37.00,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Dishwashing liquid with natural lemon extracts for grease-cutting power and sparkling clean pots and dishes.',
    productSource: 'https://www.tradekings.co.zm/product/boom-sparkle-plus/',
    imageUrl: 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'breakfast-meal-25kg',
    legacyId: 4,
    name: 'Breakfast Meal 25 kg',
    slug: 'breakfast-meal-25kg',
    sku: 'ZM-GROC-003',
    brand: 'National Milling',
    manufacturer: 'National Milling Corporation',
    category: inMemoryCategories[0],
    branches: allBranchIds,
    packageSize: '25 kg',
    packVerification: 'verified',
    unitPrice: 285.00,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Top-grade super refined white maize breakfast meal. The definitive Zambian meal staple for smooth nshima.',
    productSource: 'National Milling Corporation Zambia',
    imageUrl: 'https://images.unsplash.com/photo-1607672632458-9eb56696200b?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'roller-meal-25kg',
    legacyId: 5,
    name: 'Roller Meal 25 kg',
    slug: 'roller-meal-25kg',
    sku: 'ZM-GROC-004',
    brand: 'Pembe',
    manufacturer: 'Pembe Flour Mills',
    category: inMemoryCategories[0],
    branches: allBranchIds,
    packageSize: '25 kg',
    packVerification: 'verified',
    unitPrice: 240.00,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Nutritious unrefined roller maize meal with natural grain fibre for wholesome hearty nshima.',
    productSource: 'Pembe Flour Mills Zambia',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'cooking-oil-2l',
    legacyId: 6,
    name: 'Cooking Oil 2 L',
    slug: 'cooking-oil-2l',
    sku: 'ZM-GROC-005',
    brand: "D'lite",
    manufacturer: 'Trade Kings',
    category: inMemoryCategories[0],
    branches: allBranchIds,
    packageSize: '2 L',
    packVerification: 'verified',
    unitPrice: 82.50,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Triple-refined pure vegetable cooking oil enriched with vitamins A & D for cooking, frying and baking.',
    productSource: 'https://www.tradekings.co.zm/foods/',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'white-sugar-2kg',
    legacyId: 7,
    name: 'White Granulated Sugar 2 kg',
    slug: 'white-sugar-2kg',
    sku: 'ZM-GROC-006',
    brand: 'Whitespoon',
    manufacturer: 'Zambia Sugar Plc',
    category: inMemoryCategories[0],
    branches: allBranchIds,
    packageSize: '2 kg',
    packVerification: 'verified',
    unitPrice: 58.00,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Locally grown pure white granulated cane sugar from Nakambala Estate, Mazabuka.',
    productSource: 'Zambia Sugar Plc',
    imageUrl: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'fresh-milk-2l',
    legacyId: 9,
    name: 'Fresh Full Cream Milk 2 L',
    slug: 'fresh-full-cream-milk-2l',
    sku: 'ZM-DAIR-001',
    brand: 'Dairy Gold',
    manufacturer: 'Dairy Gold Zambia',
    category: inMemoryCategories[4],
    branches: allBranchIds,
    packageSize: '2 L',
    packVerification: 'verified',
    unitPrice: 54.00,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Fresh pasteurised homogenised full cream cows milk, chilled and rich in calcium.',
    productSource: 'https://www.dairygold.co.zm/',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'lacto-500ml',
    legacyId: 10,
    name: 'Lacto Cultured Sour Milk 500 ml',
    slug: 'lacto-cultured-sour-milk-500ml',
    sku: 'ZM-DAIR-002',
    brand: 'Dairy Gold',
    manufacturer: 'Dairy Gold Zambia',
    category: inMemoryCategories[4],
    branches: allBranchIds,
    packageSize: '500 ml',
    packVerification: 'verified',
    unitPrice: 18.50,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Traditional thick fermented sour milk (Mabisi). Refreshing with nshima or chilled as a probiotic beverage.',
    productSource: 'https://www.dairygold.co.zm/',
    imageUrl: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'farm-eggs-30',
    legacyId: 11,
    name: 'Fresh Farm Eggs (Tray of 30)',
    slug: 'farm-eggs-tray-30',
    sku: 'ZM-DAIR-003',
    brand: 'Bokomo',
    manufacturer: 'Bokomo Poultry Zambia',
    category: inMemoryCategories[4],
    branches: allBranchIds,
    packageSize: 'Tray of 30',
    packVerification: 'verified',
    unitPrice: 78.00,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Farm-fresh Grade A large eggs, rich in protein and quality tested.',
    productSource: 'Bokomo Poultry Zambia',
    imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'white-bread',
    legacyId: 12,
    name: 'Shoprite Fresh Sliced White Bread 700g',
    slug: 'shoprite-white-bread-700g',
    sku: 'ZM-BAK-001',
    brand: 'Shoprite Bakery',
    manufacturer: 'Shoprite In-Store Bakery',
    category: inMemoryCategories[2],
    branches: allBranchIds,
    packageSize: '700 g',
    packVerification: 'verified',
    unitPrice: 22.00,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Soft freshly baked sliced white loaf. Baked fresh every morning in Shoprite store bakeries.',
    productSource: 'Shoprite Zambia Bakery',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'fresh-whole-chicken',
    legacyId: 13,
    name: 'Fresh Whole Chicken 1.2 kg',
    slug: 'fresh-whole-chicken-1-2kg',
    sku: 'ZM-BUTCH-001',
    brand: 'Hybrid Poultry',
    manufacturer: 'Hybrid Poultry Farm Zambia',
    category: inMemoryCategories[3],
    branches: allBranchIds,
    packageSize: '1.2 kg',
    packVerification: 'sample',
    unitPrice: 92.00,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Plump grain-fed dressed fresh chicken, trimmed and ready for roasting or stewing.',
    productSource: 'Hybrid Poultry Farm',
    imageUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'beef-mince-500g',
    legacyId: 14,
    name: 'Lean Beef Mince 500g',
    slug: 'lean-beef-mince-500g',
    sku: 'ZM-BUTCH-002',
    brand: 'Zambeef',
    manufacturer: 'Zambeef Products Plc',
    category: inMemoryCategories[3],
    branches: allBranchIds,
    packageSize: '500 g',
    packVerification: 'sample',
    unitPrice: 68.00,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'High-quality freshly ground lean beef mince, 90% meat, ideal for meatballs, pasta and pies.',
    productSource: 'Zambeef Products Plc',
    imageUrl: 'https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'loose-tomatoes-1kg',
    legacyId: 15,
    name: 'Fresh Salad Tomatoes 1 kg',
    slug: 'fresh-salad-tomatoes-1kg',
    sku: 'ZM-PROD-001',
    brand: 'Fresh Produce',
    manufacturer: 'Zambian Farmers Cooperative',
    category: inMemoryCategories[1],
    branches: allBranchIds,
    packageSize: '1 kg loose',
    packVerification: 'sample',
    unitPrice: 28.00,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Firm, sun-ripened red salad tomatoes sourced from local commercial farms in Chisamba.',
    productSource: 'Shoprite Fresh Produce Section',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'loose-bananas-1kg',
    legacyId: 16,
    name: 'Sweet Bananas 1 kg',
    slug: 'sweet-bananas-1kg',
    sku: 'ZM-PROD-002',
    brand: 'Fresh Produce',
    manufacturer: 'Chiawa Banana Estate',
    category: inMemoryCategories[1],
    branches: allBranchIds,
    packageSize: '1 kg loose',
    packVerification: 'sample',
    unitPrice: 32.00,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Sweet creamy dessert bananas grown along the Zambezi valley in Chirundu & Chiawa.',
    productSource: 'Shoprite Fresh Produce Section',
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'loose-potatoes-1kg',
    legacyId: 17,
    name: 'Washed Table Potatoes 1 kg',
    slug: 'washed-table-potatoes-1kg',
    sku: 'ZM-PROD-003',
    brand: 'Fresh Produce',
    manufacturer: 'Mkushi Farming Block',
    category: inMemoryCategories[1],
    branches: allBranchIds,
    packageSize: '1 kg loose',
    packVerification: 'sample',
    unitPrice: 26.00,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'High-starch white potatoes suitable for roasting, mashing, or crisp home-cut chips.',
    productSource: 'Shoprite Fresh Produce Section',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'loose-onions-1kg',
    legacyId: 18,
    name: 'Brown Cooking Onions 1 kg',
    slug: 'brown-cooking-onions-1kg',
    sku: 'ZM-PROD-004',
    brand: 'Fresh Produce',
    manufacturer: 'Local Growers Network',
    category: inMemoryCategories[1],
    branches: allBranchIds,
    packageSize: '1 kg loose',
    packVerification: 'sample',
    unitPrice: 25.00,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Pungent firm brown onions, an aromatic base essential for every Zambian relish and stew.',
    productSource: 'Shoprite Fresh Produce Section',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'boom-washing-powder-2kg',
    legacyId: 19,
    name: 'Boom Hand Washing Powder 2 kg',
    slug: 'boom-washing-powder-2kg',
    sku: 'ZM-CLN-003',
    brand: 'Boom',
    manufacturer: 'Trade Kings',
    category: inMemoryCategories[6],
    branches: allBranchIds,
    packageSize: '2 kg',
    packVerification: 'verified',
    unitPrice: 62.00,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Powerful foam-rich laundry washing powder with active stain lifters and fresh floral fragrance.',
    productSource: 'https://www.tradekings.co.zm/laundry-care/',
    imageUrl: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'geisha-soap-225g',
    legacyId: 20,
    name: 'Geisha Aloe Vera Beauty Soap 225g',
    slug: 'geisha-aloe-vera-soap-225g',
    sku: 'ZM-PC-001',
    brand: 'Geisha',
    manufacturer: 'Unilever Zambia',
    category: inMemoryCategories[7],
    branches: allBranchIds,
    packageSize: '225 g',
    packVerification: 'verified',
    unitPrice: 19.50,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Long-lasting natural family bath soap infused with soothing aloe vera extracts.',
    productSource: 'Unilever Personal Care',
    imageUrl: 'https://images.unsplash.com/photo-1607006314605-8be8a5ff6b1a?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'coca-cola-2l',
    legacyId: 21,
    name: 'Coca-Cola Original Taste 2 L',
    slug: 'coca-cola-original-2l',
    sku: 'ZM-BEV-001',
    brand: 'Coca-Cola',
    manufacturer: 'Zambian Breweries / Coca-Cola Bottling',
    category: inMemoryCategories[5],
    branches: allBranchIds,
    packageSize: '2 L',
    packVerification: 'verified',
    unitPrice: 34.00,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'The world favourite sparkling caramel-flavoured soft drink in a family 2 L sharing bottle.',
    productSource: 'Coca-Cola Beverages Zambia',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'mineral-water-5l',
    legacyId: 22,
    name: 'Manzi Natural Spring Water 5 L',
    slug: 'manzi-natural-spring-water-5l',
    sku: 'ZM-BEV-002',
    brand: 'Manzi',
    manufacturer: 'Natural Valley Zambia',
    category: inMemoryCategories[5],
    branches: allBranchIds,
    packageSize: '5 L',
    packVerification: 'verified',
    unitPrice: 29.00,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Pure, crisp mineral spring water bottled at the source with handy carry handle.',
    productSource: 'Natural Valley Zambia',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'amazon-biscuits',
    legacyId: 23,
    name: 'Amazon Cream Sandwich Biscuits 150g',
    slug: 'amazon-cream-sandwich-biscuits-150g',
    sku: 'ZM-SNK-001',
    brand: 'Amazon',
    manufacturer: 'Trade Kings',
    category: inMemoryCategories[8],
    branches: allBranchIds,
    packageSize: '150 g',
    packVerification: 'verified',
    unitPrice: 14.50,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Crisp chocolate biscuit cookies with rich sweet vanilla cream filling.',
    productSource: 'https://www.tradekings.co.zm/confectionery/',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'huggies-nappies-size-3',
    legacyId: 24,
    name: 'Huggies Dry Comfort Nappies Size 3 (44s)',
    slug: 'huggies-dry-comfort-size-3',
    sku: 'ZM-BABY-001',
    brand: 'Huggies',
    manufacturer: 'Kimberly-Clark',
    category: inMemoryCategories[9],
    branches: allBranchIds,
    packageSize: 'Pack of 44',
    packVerification: 'verified',
    unitPrice: 185.00,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Super-absorbent nappies with stretchy waistband for active babies 6-10 kg, offering up to 12 hours dryness.',
    productSource: 'Kimberly-Clark Baby Care',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'frozen-mixed-veg',
    legacyId: 25,
    name: 'Shoprite Frozen Country Mixed Vegetables 1 kg',
    slug: 'shoprite-frozen-mixed-vegetables-1kg',
    sku: 'ZM-FRZ-001',
    brand: 'Shoprite Fresh',
    manufacturer: 'Shoprite Cold Chain',
    category: inMemoryCategories[10],
    branches: allBranchIds,
    packageSize: '1 kg',
    packVerification: 'verified',
    unitPrice: 46.50,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Snap-frozen tender sweet peas, sweetcorn, diced carrots and cut green beans locked with garden vitamins.',
    productSource: 'Shoprite Cold Chain',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'frozen-fish-tilapia',
    legacyId: 26,
    name: 'Lake Kariba Whole Frozen Tilapia (Bream) 1 kg',
    slug: 'lake-kariba-frozen-tilapia-bream-1kg',
    sku: 'ZM-FRZ-002',
    brand: 'Yalelo',
    manufacturer: 'Yalelo Fisheries Zambia',
    category: inMemoryCategories[10],
    branches: allBranchIds,
    packageSize: '1 kg',
    packVerification: 'verified',
    unitPrice: 65.00,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Sustainably farmed Lake Kariba whole fresh-frozen tilapia bream, scaled and gutted ready for frying or braai.',
    productSource: 'Yalelo Fisheries Zambia',
    imageUrl: 'https://images.unsplash.com/photo-1534948216015-843149f72be3?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'fresh-apples-1kg',
    legacyId: 27,
    name: 'Crisp Royal Gala Red Apples 1 kg',
    slug: 'crisp-royal-gala-red-apples-1kg',
    sku: 'ZM-PROD-005',
    brand: 'Fresh Produce',
    manufacturer: 'Fresh Produce Market',
    category: inMemoryCategories[1],
    branches: allBranchIds,
    packageSize: '1 kg loose',
    packVerification: 'sample',
    unitPrice: 38.00,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Crisp, sweet and aromatic juicy red Royal Gala apples, hand-sorted for quality.',
    productSource: 'Shoprite Fresh Produce Section',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'colgate-toothpaste',
    legacyId: 28,
    name: 'Colgate Triple Action Toothpaste 100 ml',
    slug: 'colgate-triple-action-toothpaste-100ml',
    sku: 'ZM-PC-002',
    brand: 'Colgate',
    manufacturer: 'Colgate-Palmolive',
    category: inMemoryCategories[7],
    branches: allBranchIds,
    packageSize: '100 ml',
    packVerification: 'verified',
    unitPrice: 26.50,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Triple benefit formula protects against cavities, whitens teeth and leaves breath minty fresh.',
    productSource: 'Colgate-Palmolive',
    imageUrl: 'https://images.unsplash.com/photo-1559591937-e10b1442c674?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'rooibos-tea',
    legacyId: 29,
    name: 'Freshpak Pure Rooibos Tea 80s',
    slug: 'freshpak-rooibos-tagless-tea-bags-80s',
    sku: 'ZM-GROC-007',
    brand: 'Freshpak',
    manufacturer: 'National Brands',
    category: inMemoryCategories[0],
    branches: allBranchIds,
    packageSize: '200 g (80 bags)',
    packVerification: 'verified',
    unitPrice: 42.00,
    priceStatus: 'estimated',
    availability: 'available',
    description: 'Naturally caffeine-free, soothing and antioxidant-rich pure rooibos tea.',
    productSource: 'National Brands',
    imageUrl: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=600&q=80',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  // --- DRINKS & BEVERAGES ---
  {
    id: 'fanta-orange-2l',
    legacyId: 30,
    name: 'Fanta Orange Flavoured Drink 2 L',
    slug: 'fanta-orange-flavoured-drink-2l',
    sku: 'ZM-BEV-003',
    brand: 'Fanta',
    manufacturer: 'Coca-Cola Beverages Zambia',
    category: inMemoryCategories[5],
    branches: allBranchIds,
    packageSize: '2 L',
    packVerification: 'verified',
    unitPrice: 35.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'Bright, bubbly and instantly refreshing orange fruit flavoured sparkling soft drink.',
    productSource: 'Coca-Cola Beverages Zambia',
    imageUrl: '/products/fanta-orange-2l.jpg',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'sprite-lemon-lime-2l',
    legacyId: 31,
    name: 'Sprite Lemon-Lime Soft Drink 2 L',
    slug: 'sprite-lemon-lime-soft-drink-2l',
    sku: 'ZM-BEV-004',
    brand: 'Sprite',
    manufacturer: 'Coca-Cola Beverages Zambia',
    category: inMemoryCategories[5],
    branches: allBranchIds,
    packageSize: '2 L',
    packVerification: 'verified',
    unitPrice: 35.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'Crisp, clean and refreshing lemon-lime sparkling thirst quencher with 100% natural flavours.',
    productSource: 'Coca-Cola Beverages Zambia',
    imageUrl: '',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'mazoe-orange-crush-2l',
    legacyId: 32,
    name: 'Mazoe Orange Crush Cordial 2 L',
    slug: 'mazoe-orange-crush-cordial-2l',
    sku: 'ZM-BEV-005',
    brand: 'Mazoe',
    manufacturer: 'Schweppes / Trade Kings Zambia',
    category: inMemoryCategories[5],
    branches: allBranchIds,
    packageSize: '2 L Cordial',
    packVerification: 'verified',
    unitPrice: 78.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'The nation favourite concentrated orange crush cordial, made with real orange juice concentrate. Makes up to 10 litres.',
    productSource: 'Schweppes / Mazoe Zambia',
    imageUrl: '/products/mazoe-orange-crush.jpg',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'ceres-fruit-juice-1l',
    legacyId: 33,
    name: 'Ceres 100% Fruit Juice Secrets of Valley 1 L',
    slug: 'ceres-100-fruit-juice-valley-1l',
    sku: 'ZM-BEV-006',
    brand: 'Ceres',
    manufacturer: 'Ceres Fruit Juices',
    category: inMemoryCategories[5],
    branches: allBranchIds,
    packageSize: '1 L Tetra Pak',
    packVerification: 'verified',
    unitPrice: 42.00,
    priceStatus: 'verified',
    availability: 'available',
    description: '100% pure fruit juice blend with no added sugar, artificial colours or preservatives. Rich in natural Vitamin C.',
    productSource: 'Shoprite Zambia Beverages',
    imageUrl: '',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'sparletta-creme-soda-2l',
    legacyId: 34,
    name: 'Sparletta Creme Soda 2 L',
    slug: 'sparletta-creme-soda-2l',
    sku: 'ZM-BEV-007',
    brand: 'Sparletta',
    manufacturer: 'Coca-Cola Beverages Zambia',
    category: inMemoryCategories[5],
    branches: allBranchIds,
    packageSize: '2 L',
    packVerification: 'verified',
    unitPrice: 32.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'Classic iconic green Creme Soda with smooth vanilla flavour notes, refreshing and fun.',
    productSource: 'Coca-Cola Beverages Zambia',
    imageUrl: '',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'red-bull-energy-250ml',
    legacyId: 35,
    name: 'Red Bull Energy Drink 250 ml',
    slug: 'red-bull-energy-drink-250ml',
    sku: 'ZM-BEV-008',
    brand: 'Red Bull',
    manufacturer: 'Red Bull GmbH',
    category: inMemoryCategories[5],
    branches: allBranchIds,
    packageSize: '250 ml Can',
    packVerification: 'verified',
    unitPrice: 38.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'Vitalizes body and mind with high caffeine, taurine, B-group vitamins and sugars.',
    productSource: 'Shoprite Zambia Beverages',
    imageUrl: '',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'schweppes-tonic-1l',
    legacyId: 36,
    name: 'Schweppes Indian Tonic Water 1 L',
    slug: 'schweppes-indian-tonic-water-1l',
    sku: 'ZM-BEV-009',
    brand: 'Schweppes',
    manufacturer: 'Coca-Cola Beverages Zambia',
    category: inMemoryCategories[5],
    branches: allBranchIds,
    packageSize: '1 L',
    packVerification: 'verified',
    unitPrice: 28.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'Crisp, effervescent tonic water with genuine quinine flavour, ideal standalone or as a mixer.',
    productSource: 'Coca-Cola Beverages Zambia',
    imageUrl: '',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },

  // --- WINES & CELLAR ---
  {
    id: 'fourth-street-sweet-red',
    legacyId: 37,
    name: '4th Street Naturally Sweet Red Wine 750 ml',
    slug: 'fourth-street-naturally-sweet-red-750ml',
    sku: 'ZM-WINE-001',
    brand: '4th Street',
    manufacturer: 'Distell / 4th Street Cellars',
    category: inMemoryCategories[11],
    branches: allBranchIds,
    packageSize: '750 ml Bottle',
    packVerification: 'verified',
    unitPrice: 110.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'Fresh, naturally sweet, unwooded red wine bursting with fruity strawberry and ripe plum flavours. Zambia most popular social wine. 12% ABV. 18+ only.',
    productSource: 'Shoprite LiquorShop Zambia',
    imageUrl: '/products/fourth-street-red-wine.jpg',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'fourth-street-cask-5l',
    legacyId: 38,
    name: '4th Street Natural Sweet Red Wine 5 L Cask',
    slug: 'fourth-street-sweet-red-5l-cask',
    sku: 'ZM-WINE-002',
    brand: '4th Street',
    manufacturer: 'Distell / 4th Street Cellars',
    category: inMemoryCategories[11],
    branches: allBranchIds,
    packageSize: '5 L Cask',
    packVerification: 'verified',
    unitPrice: 440.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'Large 5-litre family sharing wine cask with easy-pour vacuum tap. Smooth, naturally sweet and fruity. 18+ only.',
    productSource: 'Shoprite LiquorShop Zambia',
    imageUrl: '',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'robertson-sweet-white-750ml',
    legacyId: 39,
    name: 'Robertson Winery Natural Sweet White 750 ml',
    slug: 'robertson-winery-natural-sweet-white-750ml',
    sku: 'ZM-WINE-003',
    brand: 'Robertson Winery',
    manufacturer: 'Robertson Winery Cellars',
    category: inMemoryCategories[11],
    branches: allBranchIds,
    packageSize: '750 ml Bottle',
    packVerification: 'verified',
    unitPrice: 115.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'Luscious, fruity sweet white wine with floral aromas, delicate floral notes and honeyed tropical palate. 8% ABV. 18+ only.',
    productSource: 'Shoprite LiquorShop Zambia',
    imageUrl: '',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'nederburg-cabernet-750ml',
    legacyId: 40,
    name: 'Nederburg 56HUNDRED Cabernet Sauvignon 750 ml',
    slug: 'nederburg-56hundred-cabernet-sauvignon-750ml',
    sku: 'ZM-WINE-004',
    brand: 'Nederburg',
    manufacturer: 'Nederburg Wines Paarl',
    category: inMemoryCategories[11],
    branches: allBranchIds,
    packageSize: '750 ml Bottle',
    packVerification: 'verified',
    unitPrice: 235.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'Full-bodied classic dry red wine with ripe blackcurrant, cassis, and gentle oak vanilla spice. Perfect with braai steak or stew. 14% ABV. 18+ only.',
    productSource: 'Shoprite LiquorShop Zambia',
    imageUrl: '',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'drostdy-hof-claret-750ml',
    legacyId: 41,
    name: 'Drostdy-Hof Claret Select Smooth Red 750 ml',
    slug: 'drostdy-hof-claret-select-smooth-red-750ml',
    sku: 'ZM-WINE-005',
    brand: 'Drostdy-Hof',
    manufacturer: 'Drostdy Cellars',
    category: inMemoryCategories[11],
    branches: allBranchIds,
    packageSize: '750 ml Bottle',
    packVerification: 'verified',
    unitPrice: 125.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'Well-rounded medium-bodied smooth red blend with aromas of juicy red fruit and soft tannins. 12.5% ABV. 18+ only.',
    productSource: 'Shoprite LiquorShop Zambia',
    imageUrl: '',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'jc-le-roux-domaine-750ml',
    legacyId: 42,
    name: 'J.C. Le Roux Le Domaine Sparkling Wine 750 ml',
    slug: 'jc-le-roux-le-domaine-sparkling-750ml',
    sku: 'ZM-WINE-006',
    brand: 'J.C. Le Roux',
    manufacturer: 'House of J.C. Le Roux',
    category: inMemoryCategories[11],
    branches: allBranchIds,
    packageSize: '750 ml Bottle',
    packVerification: 'verified',
    unitPrice: 185.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'Celebrated effervescent sparkling wine with muscat flavours and sweet, crisp bubbles for toasts and parties. 7.5% ABV. 18+ only.',
    productSource: 'Shoprite LiquorShop Zambia',
    imageUrl: '',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },

  // --- LIQUORSHOP & ALCOHOL (ZAMBIAN BEERS, SPIRITS, CIDERS & LIQUEURS) ---
  {
    id: 'mosi-premium-lager-pack',
    legacyId: 43,
    name: 'Mosi Premium Lager Zambian Beer 6 x 375 ml',
    slug: 'mosi-premium-lager-zambian-beer-6-pack',
    sku: 'ZM-ALC-001',
    brand: 'Zambian Breweries',
    manufacturer: 'Zambian Breweries PLC',
    category: inMemoryCategories[12],
    branches: allBranchIds,
    packageSize: '6 x 375 ml Bottles',
    packVerification: 'verified',
    unitPrice: 135.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'Truly Zambian since 1968. Brewed with local water from the Victoria Falls region and finest malt. Named after Mosi-oa-Tunya. 4.0% ABV. 18+ only.',
    productSource: 'Zambian Breweries PLC (Lusaka / Ndola)',
    imageUrl: '/products/mosi-lager.jpg',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'eagle-lager-bottle',
    legacyId: 44,
    name: 'Eagle Lager Sorghum Beer 375 ml Bottle',
    slug: 'eagle-lager-sorghum-beer-375ml',
    sku: 'ZM-ALC-002',
    brand: 'Zambian Breweries',
    manufacturer: 'Zambian Breweries PLC',
    category: inMemoryCategories[12],
    branches: allBranchIds,
    packageSize: '375 ml Bottle',
    packVerification: 'verified',
    unitPrice: 18.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'Authentic Zambian clear lager brewed with locally grown Zambian sorghum sourced directly from smallholder farmers. 5.5% ABV. 18+ only.',
    productSource: 'Zambian Breweries PLC',
    imageUrl: '',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'castle-lite-6pack',
    legacyId: 45,
    name: 'Castle Lite Extra Cold Beer 6 x 330 ml Cans',
    slug: 'castle-lite-extra-cold-6-pack-cans',
    sku: 'ZM-ALC-003',
    brand: 'Castle Lite',
    manufacturer: 'Zambian Breweries PLC',
    category: inMemoryCategories[12],
    branches: allBranchIds,
    packageSize: '6 x 330 ml Cans',
    packVerification: 'verified',
    unitPrice: 150.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'Sub-zero brewed premium light lager delivers extra crisp, ultra-refreshing taste with 4.0% ABV. 18+ only.',
    productSource: 'Zambian Breweries PLC',
    imageUrl: '',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'flying-fish-lemon-pack',
    legacyId: 46,
    name: 'Flying Fish Pressed Lemon Flavoured Beer 6 x 330 ml',
    slug: 'flying-fish-pressed-lemon-beer-6-pack',
    sku: 'ZM-ALC-004',
    brand: 'Flying Fish',
    manufacturer: 'AB InBev / Zambian Breweries',
    category: inMemoryCategories[12],
    branches: allBranchIds,
    packageSize: '6 x 330 ml Cans',
    packVerification: 'verified',
    unitPrice: 155.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'Crisp premium beer infused with real pressed lemon juice for a zesty, fruity twist. 4.5% ABV. 18+ only.',
    productSource: 'Shoprite LiquorShop Zambia',
    imageUrl: '',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'savanna-dry-cider-pack',
    legacyId: 47,
    name: 'Savanna Dry Premium Cider 6 x 330 ml Bottles',
    slug: 'savanna-dry-premium-cider-6-pack',
    sku: 'ZM-ALC-005',
    brand: 'Savanna',
    manufacturer: 'Distell Africa',
    category: inMemoryCategories[12],
    branches: allBranchIds,
    packageSize: '6 x 330 ml Bottles',
    packVerification: 'verified',
    unitPrice: 180.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'Dry, crisp premium cider produced from crushed apples. Refreshing dry finish best served cold with a lemon wedge. 5.0% ABV. 18+ only.',
    productSource: 'Shoprite LiquorShop Zambia',
    imageUrl: '/products/savanna-dry.jpg',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'amarula-cream-liqueur',
    legacyId: 48,
    name: 'Amarula Marula Fruit Cream Liqueur 750 ml',
    slug: 'amarula-marula-fruit-cream-liqueur-750ml',
    sku: 'ZM-ALC-006',
    brand: 'Amarula',
    manufacturer: 'Distell Africa',
    category: inMemoryCategories[12],
    branches: allBranchIds,
    packageSize: '750 ml Bottle',
    packVerification: 'verified',
    unitPrice: 345.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'The spirit of Africa. Made with wild marula fruit distilled and aged in French oak for 2 years, blended with fresh dairy cream. 17% ABV. 18+ only.',
    productSource: 'Shoprite LiquorShop Zambia',
    imageUrl: '/products/amarula-cream.jpg',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'jameson-irish-whiskey',
    legacyId: 49,
    name: 'Jameson Triple Distilled Irish Whiskey 750 ml',
    slug: 'jameson-triple-distilled-irish-whiskey-750ml',
    sku: 'ZM-ALC-007',
    brand: 'Jameson',
    manufacturer: 'Irish Distillers / Pernod Ricard',
    category: inMemoryCategories[12],
    branches: allBranchIds,
    packageSize: '750 ml Bottle',
    packVerification: 'verified',
    unitPrice: 520.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'World-renowned triple distilled blended Irish whiskey. Unmatched smoothness with delicate spicy vanilla and toasted wood notes. 40% ABV. 18+ only.',
    productSource: 'Shoprite LiquorShop Zambia',
    imageUrl: '/products/jameson-irish-whiskey.jpg',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'johnnie-walker-black-label',
    legacyId: 50,
    name: 'Johnnie Walker Black Label 12 Year Whisky 750 ml',
    slug: 'johnnie-walker-black-label-12-year-750ml',
    sku: 'ZM-ALC-008',
    brand: 'Johnnie Walker',
    manufacturer: 'Diageo Scotland',
    category: inMemoryCategories[12],
    branches: allBranchIds,
    packageSize: '750 ml Bottle',
    packVerification: 'verified',
    unitPrice: 780.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'Iconic blend of exceptional Single Malt and Grain whiskies from all four corners of Scotland, each aged for a minimum of 12 years. Rich, complex, and smokey. 40% ABV. 18+ only.',
    productSource: 'Shoprite LiquorShop Zambia',
    imageUrl: '/products/johnnie-walker-black.jpg',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'gordons-london-dry-gin',
    legacyId: 51,
    name: 'Gordon\'s Special London Dry Gin 750 ml',
    slug: 'gordons-special-london-dry-gin-750ml',
    sku: 'ZM-ALC-009',
    brand: 'Gordon\'s',
    manufacturer: 'Diageo',
    category: inMemoryCategories[12],
    branches: allBranchIds,
    packageSize: '750 ml Bottle',
    packVerification: 'verified',
    unitPrice: 295.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'Triple-distilled classic dry gin crafted with handpicked Tuscan juniper berries and botanicals for a crisp, zesty taste. 43% ABV. 18+ only.',
    productSource: 'Shoprite LiquorShop Zambia',
    imageUrl: '',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'smirnoff-1818-vodka',
    legacyId: 52,
    name: 'Smirnoff 1818 Triple Distilled Vodka 750 ml',
    slug: 'smirnoff-1818-triple-distilled-vodka-750ml',
    sku: 'ZM-ALC-010',
    brand: 'Smirnoff',
    manufacturer: 'Diageo',
    category: inMemoryCategories[12],
    branches: allBranchIds,
    packageSize: '750 ml Bottle',
    packVerification: 'verified',
    unitPrice: 245.00,
    priceStatus: 'verified',
    availability: 'available',
    description: 'Triple distilled, ten times charcoal filtered pure vodka for ultimate smoothness and clarity. Zambia favourite spirit for mixers. 43% ABV. 18+ only.',
    productSource: 'Shoprite LiquorShop Zambia',
    imageUrl: '',
    active: true,
    isDemo: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
]

// In-memory fallback cache
const inMemoryOrders = new Map<string, OrderRecord>()

class CloudSqlPayloadClient {
  async auth(_options?: unknown) {
    return { user: null }
  }

  async find(args: {
    collection: string
    where?: Record<string, unknown>
    depth?: number
    limit?: number
    pagination?: boolean
    sort?: string
    draft?: boolean
    overrideAccess?: boolean
    user?: unknown
    context?: Record<string, unknown>
  }) {
    const { collection, where, limit = 100 } = args

    if (collection === 'branches') {
      try {
        const rows = await db.select().from(branchesTable)
        if (rows && rows.length > 0) {
          const docs: BranchRecord[] = rows.map((r) => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            area: r.area,
            deliveryFee: r.deliveryFee,
            deliveryEnabled: r.deliveryEnabled,
            isDemo: r.isDemo,
            notice: r.notice ?? null,
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString(),
          }))
          return { docs: docs.slice(0, limit), totalDocs: docs.length }
        }
      } catch (err) {
        console.warn('Could not query branches from Cloud SQL, using fallback cache:', err)
      }
      return { docs: inMemoryBranches.slice(0, limit), totalDocs: inMemoryBranches.length }
    }

    if (collection === 'categories') {
      try {
        const rows = await db.select().from(categoriesTable).orderBy(categoriesTable.sortOrder)
        if (rows && rows.length > 0) {
          const docs: CategoryRecord[] = rows.map((r) => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            description: r.description ?? null,
            sortOrder: r.sortOrder ?? 0,
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString(),
          }))
          const existingCatIds = new Set(docs.map((c) => c.id))
          const missingCats = inMemoryCategories.filter((c) => !existingCatIds.has(c.id))
          const allCatDocs = [...docs, ...missingCats]
          return { docs: allCatDocs.slice(0, limit), totalDocs: allCatDocs.length }
        }
      } catch (err) {
        console.warn('Could not query categories from Cloud SQL, using fallback cache:', err)
      }
      return { docs: inMemoryCategories.slice(0, limit), totalDocs: inMemoryCategories.length }
    }

    if (collection === 'products') {
      try {
        const [prodRows, catRows] = await Promise.all([
          db.select().from(productsTable),
          db.select().from(categoriesTable),
        ])
        if (prodRows && prodRows.length > 0) {
          const catMap = new Map(catRows.map((c) => [c.id, {
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description ?? null,
            sortOrder: c.sortOrder ?? 0,
            createdAt: c.createdAt.toISOString(),
            updatedAt: c.updatedAt.toISOString(),
          }]))

          let docs: (ProductRecord & { imageUrl?: string })[] = prodRows.map((r) => {
            const cat = r.categoryId ? catMap.get(r.categoryId) : undefined
            const fallbackProd = inMemoryProducts.find((p) => p.id === r.id)
            const resolvedImg = r.imageUrl || fallbackProd?.imageUrl || ''
            return {
              id: r.id,
              legacyId: r.legacyId ?? null,
              sku: r.sku,
              slug: r.slug,
              name: r.name,
              brand: r.brand,
              manufacturer: r.manufacturer ?? null,
              category: cat ?? (r.categoryId || 'cat-food-cupboard'),
              branches: r.branchIds,
              packageSize: r.packageSize,
              packVerification: (r.packVerification as 'sample' | 'verified') || 'sample',
              unitPrice: r.unitPrice,
              priceStatus: (r.priceStatus as 'estimated' | 'verified') || 'estimated',
              availability: (r.availability as 'available' | 'unverified' | 'unavailable') || 'available',
              description: r.description,
              productSource: r.productSource ?? null,
              imageUrl: resolvedImg,
              image: resolvedImg as any,
              active: r.active,
              isDemo: r.isDemo,
              createdAt: r.createdAt.toISOString(),
              updatedAt: r.updatedAt.toISOString(),
            }
          })

          const existingProdIds = new Set(docs.map((p) => p.id))
          const missingProds = inMemoryProducts.filter((p) => !existingProdIds.has(p.id))
          let allDocs = [...docs, ...missingProds]

          if (where?.slug && typeof where.slug === 'object' && 'equals' in (where.slug as Record<string, unknown>)) {
            const target = (where.slug as { equals: string }).equals
            allDocs = allDocs.filter((p) => p.slug === target)
          }
          if (where?.id && typeof where.id === 'object' && 'equals' in (where.id as Record<string, unknown>)) {
            const target = (where.id as { equals: string }).equals
            allDocs = allDocs.filter((p) => p.id === target)
          }

          return { docs: allDocs.slice(0, limit), totalDocs: allDocs.length }
        }
      } catch (err) {
        console.warn('Could not query products from Cloud SQL, using fallback cache:', err)
      }

      let fallbackDocs = [...inMemoryProducts]
      if (where?.slug && typeof where.slug === 'object' && 'equals' in (where.slug as Record<string, unknown>)) {
        const target = (where.slug as { equals: string }).equals
        fallbackDocs = fallbackDocs.filter((p) => p.slug === target)
      }
      return { docs: fallbackDocs.slice(0, limit), totalDocs: fallbackDocs.length }
    }

    if (collection === 'orders') {
      try {
        const rows = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt))
        let docs: (OrderRecord & { paymentRef?: string; paymentStatus?: string; deliverySlot?: string; userId?: string })[] = rows.map((r) => ({
          id: r.id,
          reference: r.reference,
          branch: r.branchId || 'lusaka',
          branchName: r.branchName,
          address: r.address,
          phone: r.phone,
          instructions: r.instructions ?? null,
          paymentMethod: r.paymentMethod as any,
          paymentRef: r.paymentRef ?? undefined,
          paymentStatus: r.paymentStatus ?? 'pending',
          deliverySlot: r.deliverySlot ?? undefined,
          receiptHash: r.receiptHash,
          isDemo: r.isDemo,
          status: r.status as OrderRecord['status'],
          subtotal: r.subtotal,
          deliveryFee: r.deliveryFee,
          total: r.total,
          items: Array.isArray(r.items) ? (r.items as OrderRecord['items']) : [],
          userId: r.userId ?? undefined,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        }))

        if (where?.id && typeof where.id === 'object' && 'equals' in (where.id as Record<string, unknown>)) {
          const targetId = (where.id as { equals: string }).equals
          docs = docs.filter((o) => o.id === targetId)
        }
        if (where?.userId && typeof where.userId === 'object' && 'equals' in (where.userId as Record<string, unknown>)) {
          const targetUid = (where.userId as { equals: string }).equals
          docs = docs.filter((o) => o.userId === targetUid)
        }
        if (args.context?.receiptHash && typeof args.context.receiptHash === 'string') {
          const hash = args.context.receiptHash
          docs = docs.filter((o) => o.receiptHash === hash)
        }

        return { docs: docs.slice(0, limit), totalDocs: docs.length }
      } catch (err) {
        console.warn('Could not query orders from Cloud SQL, using in-memory orders fallback:', err)
      }

      const all = Array.from(inMemoryOrders.values())
      let docs = all
      if (where?.id && typeof where.id === 'object' && 'equals' in (where.id as Record<string, unknown>)) {
        const targetId = (where.id as { equals: string }).equals
        docs = docs.filter((o) => o.id === targetId)
      }
      if (args.context?.receiptHash && typeof args.context.receiptHash === 'string') {
        const hash = args.context.receiptHash
        docs = docs.filter((o) => o.receiptHash === hash)
      }
      return { docs: docs.slice(0, limit), totalDocs: docs.length }
    }

    return { docs: [], totalDocs: 0 }
  }

  async findByID(args: {
    collection: string
    id: string
    depth?: number
    overrideAccess?: boolean
    req?: unknown
  }) {
    const { collection, id } = args
    if (collection === 'branches') {
      try {
        const rows = await db.select().from(branchesTable).where(eq(branchesTable.id, id))
        if (rows[0]) {
          return {
            ...rows[0],
            createdAt: rows[0].createdAt.toISOString(),
            updatedAt: rows[0].updatedAt.toISOString(),
          }
        }
      } catch { /* fallback */ }
      return inMemoryBranches.find((b) => b.id === id) ?? null
    }

    if (collection === 'products') {
      try {
        const rows = await db.select().from(productsTable).where(eq(productsTable.id, id))
        if (rows[0]) {
          const fallbackProd = inMemoryProducts.find((p) => p.id === id)
          return {
            ...rows[0],
            imageUrl: rows[0].imageUrl || fallbackProd?.imageUrl,
            createdAt: rows[0].createdAt.toISOString(),
            updatedAt: rows[0].updatedAt.toISOString(),
          }
        }
      } catch { /* fallback */ }
      return inMemoryProducts.find((p) => p.id === id) ?? null
    }

    if (collection === 'orders') {
      try {
        const rows = await db.select().from(ordersTable).where(eq(ordersTable.id, id))
        if (rows[0]) {
          return {
            ...rows[0],
            createdAt: rows[0].createdAt.toISOString(),
            updatedAt: rows[0].updatedAt.toISOString(),
          }
        }
      } catch { /* fallback */ }
      return inMemoryOrders.get(id) ?? null
    }

    return null
  }

  async update(args: {
    collection: string
    id: string
    data: Record<string, unknown>
  }) {
    const { collection, id, data } = args

    if (collection === 'products') {
      try {
        const updatePayload: Record<string, any> = { updatedAt: new Date() }
        if (typeof data.unitPrice === 'number') updatePayload.unitPrice = data.unitPrice
        if (typeof data.availability === 'string') updatePayload.availability = data.availability
        if (typeof data.name === 'string') updatePayload.name = data.name

        await db.update(productsTable).set(updatePayload).where(eq(productsTable.id, id))
      } catch (err) {
        console.warn('Cloud SQL product update fallback:', err)
      }

      const pIndex = inMemoryProducts.findIndex((p) => p.id === id)
      if (pIndex !== -1) {
        inMemoryProducts[pIndex] = { ...inMemoryProducts[pIndex], ...data } as any
      }
      return { id, ...data }
    }

    if (collection === 'orders') {
      try {
        const updatePayload: Record<string, any> = { updatedAt: new Date() }
        if (typeof data.status === 'string') updatePayload.status = data.status
        if (typeof data.paymentStatus === 'string') updatePayload.paymentStatus = data.paymentStatus

        await db.update(ordersTable).set(updatePayload).where(eq(ordersTable.id, id))
      } catch (err) {
        console.warn('Cloud SQL order update fallback:', err)
      }

      const existing = inMemoryOrders.get(id)
      if (existing) {
        inMemoryOrders.set(id, { ...existing, ...data } as OrderRecord)
      }
      return { id, ...data }
    }

    return { id, ...data }
  }

  async create(args: {
    collection: string
    data: Record<string, unknown>
    context?: Record<string, unknown>
    overrideAccess?: boolean
    user?: unknown
  }) {
    const { collection, data } = args

    if (collection === 'orders') {
      const orderId = 'ord_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6)
      const branchId = typeof data.branch === 'string' ? data.branch : 'lusaka'
      const branchObj = inMemoryBranches.find((b) => b.id === branchId) ?? inMemoryBranches[0]
      const deliveryFee = typeof data.deliveryFee === 'number' ? data.deliveryFee : (branchObj.deliveryFee ?? 35)

      const rawItems = Array.isArray(data.items) ? data.items : []
      const items: OrderRecord['items'] = []
      let subtotal = 0

      for (const item of rawItems) {
        const prodId = typeof item.product === 'string' ? item.product : (item.product?.id ?? '')
        const product = inMemoryProducts.find((p) => p.id === prodId)
        const quantity = Number(item.quantity) || 1
        const unitPrice = product ? product.unitPrice : 50
        const name = product ? product.name : 'Shoprite Item'
        const packageSize = product ? product.packageSize : 'Sample'

        subtotal += unitPrice * quantity
        items.push({
          id: 'item_' + Math.random().toString(36).substring(2, 8),
          product: prodId,
          name,
          packageSize,
          unitPrice,
          quantity,
        })
      }

      const total = Number((subtotal + deliveryFee).toFixed(2))
      const reference = `SR-ZM-${Math.floor(100000 + Math.random() * 900000)}`
      const now = new Date().toISOString()
      const paymentMethod = typeof data.paymentMethod === 'string' ? data.paymentMethod : 'cash-demo'
      const paymentRef = typeof data.paymentRef === 'string' ? data.paymentRef : undefined
      const paymentStatus = typeof data.paymentStatus === 'string' ? data.paymentStatus : (paymentMethod === 'cash-demo' ? 'pending_delivery' : 'pending_ussd')
      const deliverySlot = typeof data.deliverySlot === 'string' ? data.deliverySlot : 'Today: Afternoon (13:00 - 17:00)'
      const userId = typeof data.userId === 'string' ? data.userId : null

      const order: OrderRecord & { paymentRef?: string; paymentStatus?: string; deliverySlot?: string; userId?: string } = {
        id: orderId,
        reference,
        branch: branchId,
        branchName: branchObj.name,
        address: String(data.address || ''),
        phone: String(data.phone || ''),
        instructions: String(data.instructions || ''),
        paymentMethod: paymentMethod as any,
        paymentRef,
        paymentStatus,
        deliverySlot,
        receiptHash: String(data.receiptHash || ''),
        isDemo: true,
        status: (data.status as any) || 'Order received',
        subtotal: Number(subtotal.toFixed(2)),
        deliveryFee,
        total,
        items,
        userId: userId || undefined,
        createdAt: now,
        updatedAt: now,
      }

      // Save to Cloud SQL PostgreSQL
      try {
        await db.insert(ordersTable).values({
          id: orderId,
          reference,
          branchId,
          branchName: branchObj.name,
          address: order.address,
          phone: order.phone,
          instructions: order.instructions ?? null,
          paymentMethod: order.paymentMethod,
          paymentRef: order.paymentRef ?? null,
          paymentStatus: order.paymentStatus ?? 'pending',
          deliverySlot: order.deliverySlot ?? null,
          receiptHash: order.receiptHash,
          status: order.status || 'Order received',
          subtotal: order.subtotal ?? 0,
          deliveryFee: order.deliveryFee ?? 35,
          total: order.total ?? 0,
          items: order.items,
          isDemo: true,
          userId,
        })
      } catch (err) {
        console.warn('Could not insert order into Cloud SQL, fallback saved to memory:', err)
      }

      inMemoryOrders.set(orderId, order)
      return order
    }

    if (collection === 'products') {
      const prodId = 'prod_' + Date.now().toString(36)
      const slug = (data.slug as string) || (data.name as string).toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const sku = (data.sku as string) || `ZM-CUSTOM-${Math.floor(1000 + Math.random() * 9000)}`

      try {
        await db.insert(productsTable).values({
          id: prodId,
          sku,
          slug,
          name: String(data.name || 'New Supermarket Item'),
          brand: String(data.brand || 'Shoprite'),
          manufacturer: String(data.manufacturer || 'Local Supplier'),
          categoryId: String(data.categoryId || 'cat-food-cupboard'),
          branchIds: (data.branchIds as string[]) || allBranchIds,
          packageSize: String(data.packageSize || '1 unit'),
          packVerification: 'verified',
          unitPrice: Number(data.unitPrice) || 25,
          priceStatus: 'estimated',
          availability: 'available',
          imageUrl: String(data.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'),
          description: String(data.description || 'Quality grocery item.'),
          active: true,
          isDemo: true,
        }).onConflictDoNothing()
      } catch (err) {
        console.warn('Cloud SQL create product error:', err)
      }

      const newRecord = {
        id: prodId,
        sku,
        slug,
        name: String(data.name || 'New Supermarket Item'),
        brand: String(data.brand || 'Shoprite'),
        manufacturer: String(data.manufacturer || 'Local Supplier'),
        category: inMemoryCategories.find((c) => c.id === data.categoryId) || inMemoryCategories[0],
        branches: allBranchIds,
        packageSize: String(data.packageSize || '1 unit'),
        packVerification: 'verified' as const,
        unitPrice: Number(data.unitPrice) || 25,
        priceStatus: 'estimated' as const,
        availability: 'available' as const,
        imageUrl: String(data.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'),
        description: String(data.description || 'Quality grocery item.'),
        active: true,
        isDemo: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      inMemoryProducts.unshift(newRecord)
      return newRecord
    }

    return { id: 'mock_' + Date.now(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  }
}

const cloudSqlPayloadClient = new CloudSqlPayloadClient()

/**
 * Get the Payload client configured for this project.
 * Backed by Cloud SQL PostgreSQL with seamless in-memory fallback.
 */
export async function getPayloadClient() {
  return cloudSqlPayloadClient as unknown as any
}

/**
 * Find a single document by slug in any collection.
 */
export async function findBySlug<T extends CollectionSlug>(
  collection: T,
  slug: string,
  options?: {
    draft?: boolean
    depth?: number
  },
): Promise<Config["collections"][T] | null> {
  const payload = await getPayloadClient()
  const { draft = false, depth = 2 } = options ?? {}

  const result = await payload.find({
    collection,
    overrideAccess: false,
    where: {
      slug: { equals: slug },
    },
    depth,
    limit: 1,
    draft,
  })

  return (result.docs[0] as Config["collections"][T]) ?? null
}

/**
 * Find a single document by a custom field value.
 */
export async function findByField<T extends CollectionSlug>(
  collection: T,
  field: string,
  value: string,
  options?: {
    draft?: boolean
    depth?: number
  },
): Promise<Config["collections"][T] | null> {
  const payload = await getPayloadClient()
  const { draft = false, depth = 2 } = options ?? {}

  const result = await payload.find({
    collection,
    overrideAccess: false,
    where: {
      [field]: { equals: value },
    },
    depth,
    limit: 1,
    draft,
  })

  return (result.docs[0] as Config["collections"][T]) ?? null
}

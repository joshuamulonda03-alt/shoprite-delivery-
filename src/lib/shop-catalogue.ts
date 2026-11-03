import 'server-only'
import { unstable_cache } from 'next/cache'
import { getPayloadClient, findBySlug } from '@/lib/payload'
import type { Product as ProductRecord } from '@/payload-types'
import type { Product, ShopData, ShopBranch } from '@/lib/shop-types'

export const LUSAKA_SHOPRITE_BRANCHES: ShopBranch[] = [
  { id: 'branch-cairo-rd', name: 'Shoprite Cairo Road', area: 'Cairo Road, Central Business District, Lusaka', isDemo: true, deliveryFee: 35, deliveryEnabled: true },
  { id: 'branch-manda-hill', name: 'Shoprite Manda Hill', area: 'Manda Hill Mall, Great East Road, Lusaka', isDemo: true, deliveryFee: 35, deliveryEnabled: true },
  { id: 'branch-twin-palm', name: 'Shoprite Twin Palm', area: 'Twin Palm Mall, Avondale / Salama Park, Lusaka', isDemo: true, deliveryFee: 40, deliveryEnabled: true },
  { id: 'branch-woodlands', name: 'Shoprite Woodlands (Novare Pinnacle)', area: 'Novare Pinnacle Mall, Kafue Rd / Woodlands, Lusaka', isDemo: true, deliveryFee: 38, deliveryEnabled: true },
  { id: 'branch-chilenje', name: 'Shoprite Chilenje', area: 'Chilenje Shopping Mall, Muramba Rd, Lusaka', isDemo: true, deliveryFee: 35, deliveryEnabled: true },
  { id: 'branch-cosmopolitan', name: 'Shoprite Cosmopolitan Mall', area: 'Cosmopolitan Mall, Kafue Road / Makeni, Lusaka', isDemo: true, deliveryFee: 40, deliveryEnabled: true },
  { id: 'branch-westgate', name: 'Shoprite Westgate Mall', area: 'Westgate Mall, Lumumba Road, Lusaka', isDemo: true, deliveryFee: 35, deliveryEnabled: true },
  { id: 'branch-embassy', name: 'Shoprite Embassy Mall', area: 'Embassy Mall, Chawama / Kafue Rd, Lusaka', isDemo: true, deliveryFee: 35, deliveryEnabled: true },
  { id: 'branch-lewanika', name: 'Shoprite Lewanika Mall', area: 'Lewanika Mall, Mpatamatu Rd, Woodlands Ext., Lusaka', isDemo: true, deliveryFee: 40, deliveryEnabled: true },
  { id: 'branch-matero', name: 'Shoprite Matero Mall', area: 'Matero Mall, Commonwealth Ave, Lusaka', isDemo: true, deliveryFee: 38, deliveryEnabled: true },
]

function resolveAuthenticProductPhoto(record: ProductRecord): { image: string; source: string } {
  const name = (record.name || '').toLowerCase()
  const brand = (record.brand || '').toLowerCase()
  const slug = (record.slug || '').toLowerCase()
  const sku = (record.sku || '').toLowerCase()

  // 1. Authentic Zambia Sugar PLC Mazabuka
  if (name.includes('sugar') || brand.includes('zambia sugar') || slug.includes('sugar')) {
    return { image: '/products/white-sugar-2kg.jpg', source: 'Zambia Sugar PLC (Mazabuka)' }
  }
  // 2. National Milling Breakfast Meal
  if (name.includes('breakfast meal') || (brand.includes('national') && name.includes('meal')) || slug.includes('breakfast-meal')) {
    return { image: '/products/breakfast-meal-25kg.jpg', source: 'National Milling Corporation (Lusaka)' }
  }
  // 3. Pembe Roller Meal
  if (name.includes('roller meal') || brand.includes('pembe') || slug.includes('roller-meal')) {
    return { image: '/products/roller-meal-25kg.jpg', source: 'Pembe Mills Zambia (Lusaka)' }
  }
  // 4. Trade Kings Boom Sparkle Dishwash
  if (name.includes('sparkle') || (name.includes('dishwash') && brand.includes('boom')) || slug.includes('sparkle')) {
    return { image: '/products/boom.jpg', source: 'Trade Kings Zambia' }
  }
  // 5. Trade Kings Boom Washing Powder
  if (name.includes('washing powder') || (brand.includes('boom') && !name.includes('sparkle')) || slug.includes('boom-washing')) {
    return { image: '/products/boom-washing-powder-2kg.jpg', source: 'Trade Kings Zambia' }
  }
  // 6. D'Lite Cooking Oil
  if (name.includes('cooking oil') || brand.includes("d'lite") || brand.includes('dlite') || slug.includes('cooking-oil')) {
    return { image: '/products/cooking-oil-2l.jpg', source: "Mount Meru / D'Lite Zambia" }
  }
  // 7. Amazon Cream Biscuits
  if (name.includes('biscuit') || brand.includes('amazon') || slug.includes('biscuit')) {
    return { image: '/products/amazon-biscuits.jpg', source: 'Trade Kings / Swiss Bake Zambia' }
  }
  // 8. Dairy Gold Lacto
  if (name.includes('lacto') || slug.includes('lacto')) {
    return { image: '/products/lacto-500ml.jpg', source: 'Dairy Gold Zambia' }
  }
  // 9. Dairy Gold Fresh Milk
  if (name.includes('milk') || brand.includes('dairy gold') || slug.includes('milk')) {
    return { image: '/products/fresh-milk-2l.jpg', source: 'Dairy Gold Zambia' }
  }
  // 10. Yalelo Kariba Tilapia
  if (name.includes('tilapia') || name.includes('fish') || brand.includes('yalelo') || slug.includes('tilapia')) {
    return { image: '/products/frozen-fish-tilapia.jpg', source: 'Yalelo Kariba Tilapia (Siavonga/Lusaka)' }
  }
  // 11. Hybrid Fresh Whole Chicken
  if (name.includes('chicken') || brand.includes('hybrid') || slug.includes('chicken')) {
    return { image: '/products/fresh-whole-chicken.jpg', source: 'Hybrid Poultry Farm Zambia' }
  }
  // 12. Zambeef Mince
  if (name.includes('mince') || name.includes('beef') || brand.includes('zambeef') || slug.includes('mince')) {
    return { image: '/products/beef-mince-500g.jpg', source: 'Zambeef Products PLC Zambia' }
  }
  // 13. Manzi Natural Spring Water
  if (name.includes('mineral water') || name.includes('spring water') || brand.includes('manzi') || slug.includes('water')) {
    return { image: '/products/mineral-water-5l.jpg', source: 'Manzi Natural Spring Water Zambia' }
  }
  // 14. Spekko Long Grain Rice
  if (name.includes('rice') || brand.includes('spekko') || slug.includes('rice')) {
    return { image: '/products/rice.jpg', source: 'Spekko Rice Zambia' }
  }
  // 15. Shoprite Mastercraft White Bread
  if (name.includes('bread') || slug.includes('bread')) {
    return { image: '/products/white-bread.jpg', source: 'Shoprite Mastercraft Bakery Zambia' }
  }
  // 16. Bokomo Farm Fresh Eggs
  if (name.includes('egg') || brand.includes('bokomo') || slug.includes('egg')) {
    return { image: '/products/farm-eggs-30.jpg', source: 'Bokomo Eggs Zambia' }
  }
  // 17. Geisha Soap
  if (name.includes('soap') || brand.includes('geisha') || slug.includes('geisha')) {
    return { image: '/products/geisha-soap-225g.jpg', source: 'Unilever Zambia' }
  }
  // 18. Colgate Toothpaste
  if (name.includes('toothpaste') || brand.includes('colgate') || slug.includes('toothpaste')) {
    return { image: '/products/colgate-toothpaste.jpg', source: 'Colgate-Palmolive Zambia' }
  }
  // 19. Freshpak Rooibos Tea
  if (name.includes('tea') || name.includes('rooibos') || brand.includes('freshpak') || slug.includes('tea')) {
    return { image: '/products/rooibos-tea.jpg', source: 'Freshpak Zambia' }
  }
  // 20. Huggies Nappies
  if (name.includes('nappies') || name.includes('diaper') || brand.includes('huggies') || slug.includes('nappies')) {
    return { image: '/products/huggies-nappies-size-3.jpg', source: 'Kimberly-Clark Zambia' }
  }
  // 21. Frozen Mixed Veg
  if (name.includes('mixed veg') || (name.includes('frozen') && name.includes('veg')) || slug.includes('mixed-veg')) {
    return { image: '/products/frozen-mixed-veg.jpg', source: 'Shoprite Freshmark Lusaka' }
  }
  // 22. Coca-Cola 2L
  if (name.includes('coca-cola') || name.includes('coke') || slug.includes('coca-cola')) {
    return { image: '/products/coca-cola-2l.jpg', source: 'Coca-Cola Beverages Zambia' }
  }
  // 23. Fresh Salad Tomatoes
  if (name.includes('tomato') || slug.includes('tomato')) {
    return { image: '/products/loose-tomatoes-1kg.jpg', source: 'Shoprite Freshmark Lusaka' }
  }
  // 24. Sweet Bananas
  if (name.includes('banana') || slug.includes('banana')) {
    return { image: '/products/loose-bananas-1kg.jpg', source: 'Chiawa Banana Estate / Lusaka' }
  }
  // 25. Brown Cooking Onions
  if (name.includes('onion') || slug.includes('onion')) {
    return { image: '/products/loose-onions-1kg.jpg', source: 'Shoprite Freshmark Lusaka' }
  }
  // 26. Table Potatoes
  if (name.includes('potato') || slug.includes('potato')) {
    return { image: '/products/loose-potatoes-1kg.jpg', source: 'Shoprite Freshmark Lusaka' }
  }
  // 27. Royal Gala Apples
  if (name.includes('apple') || slug.includes('apple')) {
    return { image: '/products/fresh-apples-1kg.jpg', source: 'Shoprite Freshmark Lusaka' }
  }
  // 28. Mosi Premium Lager
  if (name.includes('mosi') || slug.includes('mosi')) {
    return { image: '/products/mosi-lager.jpg', source: 'Zambian Breweries PLC (Lusaka / Ndola)' }
  }
  // 29. 4th Street Sweet Red Wine
  if (name.includes('4th street') || slug.includes('fourth-street') || slug.includes('4th-street')) {
    return { image: '/products/fourth-street-red-wine.jpg', source: '4th Street Wine Cellars' }
  }
  // 30. Jameson Irish Whiskey
  if (name.includes('jameson') || slug.includes('jameson')) {
    return { image: '/products/jameson-irish-whiskey.jpg', source: 'Jameson Distillery / Shoprite LiquorShop' }
  }
  // 31. Savanna Dry Premium Cider
  if (name.includes('savanna') || slug.includes('savanna')) {
    return { image: '/products/savanna-dry.jpg', source: 'Savanna Cider / Shoprite LiquorShop' }
  }
  // 32. Amarula Fruit Cream Liqueur
  if (name.includes('amarula') || slug.includes('amarula')) {
    return { image: '/products/amarula-cream.jpg', source: 'Amarula Africa / Shoprite LiquorShop' }
  }
  // 33. Mazoe Orange Crush
  if (name.includes('mazoe') || slug.includes('mazoe')) {
    return { image: '/products/mazoe-orange-crush.jpg', source: 'Schweppes / Mazoe Zambia' }
  }
  // 34. Fanta Orange
  if (name.includes('fanta') || slug.includes('fanta')) {
    return { image: '/products/fanta-orange-2l.jpg', source: 'Coca-Cola Beverages Zambia' }
  }
  // 35. Johnnie Walker Black Label
  if (name.includes('johnnie walker') || slug.includes('johnnie-walker')) {
    return { image: '/products/johnnie-walker-black.jpg', source: 'Johnnie Walker / Shoprite LiquorShop' }
  }

  // Fallback: If no authentic image found, return empty string so clear fallback appears
  return { image: '', source: '' }
}

export function presentProduct(record: ProductRecord): Product {
  const media = record.image && typeof record.image === 'object' ? record.image : null
  const category = typeof record.category === 'object' ? record.category.name : ''
  const mediaUrl = (record as any).imageUrl || (typeof record.image === 'string' ? record.image : media?.url) || ''
  
  // Resolve authentic Zambian product image
  const authenticPhoto = resolveAuthenticProductPhoto(record)
  const finalImage = authenticPhoto.image || mediaUrl || ''
  const finalSource = authenticPhoto.source || record.imageSource || ''

  // All Lusaka branch IDs to ensure seamless shopping at every branch
  const allLusakaBranchIds = LUSAKA_SHOPRITE_BRANCHES.map((b) => b.id)
  const existingBranchIds = (record.branches ?? []).map((branch) => typeof branch === 'object' ? branch.id : branch)
  const branchIds = Array.from(new Set([...existingBranchIds, ...allLusakaBranchIds]))

  return {
    id: record.id,
    legacyId: record.legacyId,
    slug: record.slug,
    sku: record.sku,
    name: record.name,
    brand: record.brand,
    size: record.packageSize,
    packVerified: record.packVerification === 'verified',
    price: record.unitPrice,
    priceStatus: record.priceStatus,
    availability: record.availability,
    category,
    branchIds,
    image: finalImage,
    imageAlt: media?.alt ?? `${record.brand} ${record.name} (${record.packageSize})`,
    imageSource: finalSource,
    description: record.description,
    productSource: record.productSource ?? 'Shoprite Zambia Supermarkets',
    isDemo: record.isDemo,
  }
}

async function readCatalogue(): Promise<ShopData> {
  const payload = await getPayloadClient()
  const [products, categories, branches] = await Promise.all([
    payload.find({ collection: 'products', overrideAccess: false, depth: 1, limit: 100, pagination: false, sort: 'legacyId' }),
    payload.find({ collection: 'categories', overrideAccess: false, depth: 0, limit: 100, sort: 'sortOrder' }),
    payload.find({ collection: 'branches', overrideAccess: false, depth: 0, limit: 100, sort: 'createdAt' }),
  ])

  // Merge Lusaka branches with any custom database branches
  const existingBranches: ShopBranch[] = branches.docs.map(({ id, name, area, isDemo, deliveryFee, deliveryEnabled }: any) => ({
    id,
    name,
    area,
    isDemo,
    deliveryFee: deliveryFee ?? 35,
    deliveryEnabled: deliveryEnabled ?? true,
  }))

  const branchMap = new Map<string, ShopBranch>()
  // Add Lusaka branches as canonical
  for (const b of LUSAKA_SHOPRITE_BRANCHES) {
    branchMap.set(b.id, b)
  }
  for (const b of existingBranches) {
    if (!branchMap.has(b.id)) {
      branchMap.set(b.id, b)
    }
  }

  const allBranches = Array.from(branchMap.values())

  return {
    products: products.docs.map((p: any) => presentProduct(p)),
    categories: categories.docs.map(({ id, name, slug, description }: any) => ({ id, name, slug, description })),
    branches: allBranches,
  }
}

const cachedCatalogue = unstable_cache(readCatalogue, ['shop-catalogue-v3'], { tags: ['shop-catalogue'] })

export function getShopCatalogue() {
  return process.env.NODE_ENV === 'development' ? readCatalogue() : cachedCatalogue()
}

export function getShopProduct(slug: string) {
  const readProduct = async () => {
    const record = await findBySlug('products', slug, { depth: 1 })
    return record ? presentProduct(record) : null
  }
  if (process.env.NODE_ENV === 'development') return readProduct()
  return unstable_cache(readProduct, ['shop-product', slug], { tags: ['shop-catalogue', `shop-product:${slug}`] })()
}


import type { Cart, Product } from './shop-types'

export const MAX_QUANTITY = 20
export function normaliseCart(value: unknown, products: Product[]): Cart {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const available = new Map(products.map((p) => [p.id, p]))
  return Object.fromEntries(Object.entries(value).flatMap(([key, quantity]) => {
    const product = available.get(key)
    if (!product || product.availability === 'unavailable' || !Number.isInteger(quantity) || Number(quantity) < 1) return []
    return [[key, Math.min(Number(quantity), MAX_QUANTITY)]]
  }))
}
export function filterProducts(products: Product[], query: string, category: string, branchId: string) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  return products.filter((product) => {
    const text = `${product.name} ${product.brand} ${product.category} ${product.sku} ${product.size} ${product.description}`.toLocaleLowerCase()
    return product.branchIds.includes(branchId) && (category === 'All' || product.category === category) && terms.every((term) => text.includes(term))
  })
}
export function cartSubtotal(products: Product[], cart: Cart): number {
  return products.reduce((sum, product) => sum + Math.round(product.price * 100) * (cart[product.id] || 0), 0) / 100
}

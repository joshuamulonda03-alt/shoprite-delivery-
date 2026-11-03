import type { Product as ProductRecord, Category, Branch, Order as OrderRecord } from '@/payload-types'

export type Product = {
  id: ProductRecord['id']
  legacyId?: number | null
  slug: string
  sku: string
  name: string
  brand: string
  size: string
  packVerified: boolean
  price: number
  priceStatus: 'estimated' | 'verified'
  availability: 'unverified' | 'available' | 'unavailable'
  category: string
  branchIds: Branch['id'][]
  image: string
  imageAlt: string
  imageSource: string
  description: string
  productSource: string
  isDemo: boolean
}
export type ShopCategory = Pick<Category, 'id' | 'name' | 'slug' | 'description'>
export type ShopBranch = Pick<Branch, 'id' | 'name' | 'area' | 'isDemo' | 'deliveryFee' | 'deliveryEnabled'>
export type ShopData = { products: Product[]; categories: ShopCategory[]; branches: ShopBranch[] }
export type Cart = Record<Product['id'], number>
export type Receipt = { id: OrderRecord['id']; token: string }
export type DemoOrder = {
  id: OrderRecord['id']
  reference: string
  createdAt: string
  total: number
  status: string
  address: string
  phone?: string
  branchName: string
  paymentMethod?: string
  paymentRef?: string
  paymentStatus?: string
  deliverySlot?: string
  items: { name: string; packageSize: string; quantity: number; unitPrice: number }[]
}

export type CustomerProfile = {
  uid: string
  email: string
  displayName?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
}


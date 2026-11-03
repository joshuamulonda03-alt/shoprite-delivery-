'use server'

import { createHash, randomBytes } from 'node:crypto'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { eq, desc } from 'drizzle-orm'
import { db } from '@/db'
import { users as usersTable, orders as ordersTable, products as productsTable } from '@/db/schema'
import { getPayloadClient } from '@/lib/payload'
import type { DemoOrder, Receipt, CustomerProfile } from '@/lib/shop-types'

export async function placeDemoOrder(input: unknown): Promise<{
  ok: true
  receipt: Receipt
  reference: string
  paymentMethod: string
  paymentRef?: string
  paymentStatus: string
} | { ok: false; error: string }> {
  if (!input || typeof input !== 'object') return { ok: false, error: 'Invalid order.' }
  const values = input as Record<string, unknown>
  if (
    typeof values.branch !== 'string' ||
    typeof values.address !== 'string' ||
    typeof values.phone !== 'string' ||
    typeof values.instructions !== 'string' ||
    !Array.isArray(values.items) ||
    !values.items.length ||
    values.items.length > 60
  ) {
    return { ok: false, error: 'Please complete the delivery details and add at least one item.' }
  }

  const phone = values.phone.replace(/[\s()-]/g, '')
  if (!/^(?:\+260|0)[79]\d{8}$/.test(phone)) {
    return { ok: false, error: 'Use a valid Zambian mobile number such as +260 97 123 4567 or 096 123 4567.' }
  }

  if (values.address.trim().length < 6 || values.address.length > 500 || values.instructions.length > 500) {
    return { ok: false, error: 'Enter a valid address (6–500 characters) and instructions under 500 characters.' }
  }

  const paymentMethod = typeof values.paymentMethod === 'string' ? values.paymentMethod : 'cash-demo'
  const deliverySlot = typeof values.deliverySlot === 'string' ? values.deliverySlot : 'Today: Afternoon (13:00 - 17:00)'
  const deliveryFee = typeof values.deliveryFee === 'number' ? values.deliveryFee : 35
  const userId = typeof values.userId === 'string' && values.userId ? values.userId : undefined

  let paymentRef: string | undefined = undefined
  let paymentStatus = 'pending_delivery'

  if (paymentMethod === 'momo-mtn') {
    paymentRef = `MTN-ZM-${Math.floor(100000 + Math.random() * 900000)}`
    paymentStatus = 'pending_ussd'
  } else if (paymentMethod === 'momo-airtel') {
    paymentRef = `AIRTEL-ZM-${Math.floor(100000 + Math.random() * 900000)}`
    paymentStatus = 'pending_ussd'
  }

  const items: { product: string; quantity: number }[] = []
  for (const value of values.items) {
    if (
      !value ||
      typeof value !== 'object' ||
      typeof value.product !== 'string' ||
      !Number.isInteger(value.quantity) ||
      value.quantity < 1 ||
      value.quantity > 20
    ) {
      return { ok: false, error: 'Choose whole quantities between 1 and 20.' }
    }
    items.push({ product: value.product, quantity: value.quantity })
  }

  const token = randomBytes(32).toString('hex')
  try {
    const payload = await getPayloadClient()
    let user = null
    try {
      const h = await headers()
      const authResult = await payload.auth({ headers: h })
      user = authResult?.user ?? null
    } catch {
      // Invariant: outside incoming HTTP request context
    }

    const order = await payload.create({
      collection: 'orders',
      overrideAccess: false,
      user,
      context: { demoCheckout: true },
      data: {
        branch: values.branch,
        address: values.address.trim(),
        phone,
        instructions: values.instructions.trim(),
        paymentMethod,
        paymentRef,
        paymentStatus,
        deliverySlot,
        deliveryFee,
        userId,
        items,
        receiptHash: createHash('sha256').update(token).digest('hex'),
      },
    })

    return {
      ok: true,
      receipt: { id: order.id, token },
      reference: order.reference,
      paymentMethod,
      paymentRef,
      paymentStatus,
    }
  } catch (err) {
    console.error('Failed to place order:', err)
    return {
      ok: false,
      error: 'The order could not be saved. Check your basket and branch, then try again.',
    }
  }
}

export async function readDemoOrders(input: unknown, userId?: string | null): Promise<DemoOrder[]> {
  const payload = await getPayloadClient()
  const results: DemoOrder[] = []
  const seenIds = new Set<string>()

  // 1. Fetch orders by bearer receipts saved in browser
  if (Array.isArray(input)) {
    for (const receipt of input) {
      if (
        !receipt ||
        typeof receipt.id !== 'string' ||
        typeof receipt.token !== 'string' ||
        !/^[a-f0-9]{64}$/.test(receipt.token)
      ) {
        continue
      }
      try {
        const { docs } = await payload.find({
          collection: 'orders',
          depth: 0,
          limit: 1,
          context: { receiptHash: createHash('sha256').update(receipt.token).digest('hex') },
          where: { id: { equals: receipt.id } },
        })
        const order = docs[0]
        if (order && !seenIds.has(order.id)) {
          seenIds.add(order.id)
          results.push(mapOrderDocToDemoOrder(order))
        }
      } catch {
        // Continue
      }
    }
  }

  // 2. If customer is authenticated, also query orders attached to their userId from Cloud SQL
  if (userId && typeof userId === 'string') {
    try {
      const rows = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.userId, userId))
        .orderBy(desc(ordersTable.createdAt))

      for (const row of rows) {
        if (!seenIds.has(row.id)) {
          seenIds.add(row.id)
          results.push({
            id: row.id,
            reference: row.reference,
            createdAt: row.createdAt.toISOString(),
            total: row.total,
            status: row.status,
            address: row.address,
            phone: row.phone,
            branchName: row.branchName,
            paymentMethod: row.paymentMethod,
            paymentRef: row.paymentRef ?? undefined,
            paymentStatus: row.paymentStatus ?? undefined,
            deliverySlot: row.deliverySlot ?? undefined,
            items: Array.isArray(row.items)
              ? (row.items as any[]).map((line) => ({
                  name: line.name ?? 'Supermarket Item',
                  packageSize: line.packageSize ?? '',
                  quantity: line.quantity ?? 1,
                  unitPrice: line.unitPrice ?? 0,
                }))
              : [],
          })
        }
      }
    } catch (err) {
      console.warn('Could not read user orders from Cloud SQL:', err)
    }
  }

  // Sort newest first
  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function mapOrderDocToDemoOrder(order: any): DemoOrder {
  return {
    id: order.id,
    reference: order.reference ?? order.id,
    createdAt: order.createdAt,
    total: order.total ?? 0,
    status: order.status ?? 'Order received',
    address: order.address,
    phone: order.phone,
    branchName: order.branchName ?? 'Shoprite Branch',
    paymentMethod: order.paymentMethod,
    paymentRef: order.paymentRef,
    paymentStatus: order.paymentStatus,
    deliverySlot: order.deliverySlot,
    items: (order.items ?? []).map((line: any) => ({
      name: line.name ?? 'Product',
      packageSize: line.packageSize ?? '',
      quantity: line.quantity,
      unitPrice: line.unitPrice ?? 0,
    })),
  }
}

/**
 * Read all recent orders from Cloud SQL for the Admin operations view.
 */
export async function readAllAdminOrders(): Promise<DemoOrder[]> {
  try {
    const rows = await db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt))
      .limit(50)

    return rows.map((row) => ({
      id: row.id,
      reference: row.reference,
      createdAt: row.createdAt.toISOString(),
      total: row.total,
      status: row.status,
      address: row.address,
      phone: row.phone,
      branchName: row.branchName,
      paymentMethod: row.paymentMethod,
      paymentRef: row.paymentRef ?? undefined,
      paymentStatus: row.paymentStatus ?? undefined,
      deliverySlot: row.deliverySlot ?? undefined,
      items: Array.isArray(row.items)
        ? (row.items as any[]).map((line) => ({
            name: line.name ?? 'Supermarket Item',
            packageSize: line.packageSize ?? '',
            quantity: line.quantity ?? 1,
            unitPrice: line.unitPrice ?? 0,
          }))
        : [],
    }))
  } catch (err) {
    console.warn('Could not read admin orders from Cloud SQL, fallback payload:', err)
    const payload = await getPayloadClient()
    const { docs } = await payload.find({ collection: 'orders', limit: 50 })
    return docs.map(mapOrderDocToDemoOrder)
  }
}

/**
 * Admin action: update order fulfillment status in Cloud SQL
 */
export async function updateOrderStatus(orderId: string, status: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const payload = await getPayloadClient()
    await payload.update({
      collection: 'orders',
      id: orderId,
      data: { status },
    })
    return { ok: true }
  } catch (err) {
    console.error('Failed to update order status:', err)
    return { ok: false, error: 'Could not update status' }
  }
}

/**
 * Admin action: update product price and stock availability in Cloud SQL
 */
export async function updateProductPriceAndStock(
  productId: string,
  unitPrice: number,
  availability: 'available' | 'unavailable' | 'unverified',
): Promise<{ ok: boolean; error?: string }> {
  if (typeof unitPrice !== 'number' || unitPrice < 0) {
    return { ok: false, error: 'Unit price must be a valid positive number.' }
  }
  try {
    const payload = await getPayloadClient()
    await payload.update({
      collection: 'products',
      id: productId,
      data: { unitPrice, availability },
    })
    return { ok: true }
  } catch (err) {
    console.error('Failed to update product price & stock:', err)
    return { ok: false, error: 'Could not update product.' }
  }
}

/**
 * Admin action: add a new product to Cloud SQL
 */
export async function addNewSupermarketProduct(data: {
  name: string
  brand: string
  categoryId: string
  packageSize: string
  unitPrice: number
  imageUrl?: string
  description: string
}): Promise<{ ok: boolean; product?: any; error?: string }> {
  if (!data.name || !data.brand || !data.categoryId || !data.unitPrice) {
    return { ok: false, error: 'Please provide all required product details.' }
  }
  try {
    const payload = await getPayloadClient()
    const newDoc = await payload.create({
      collection: 'products',
      data: {
        name: data.name,
        brand: data.brand,
        categoryId: data.categoryId,
        packageSize: data.packageSize || '1 unit',
        unitPrice: data.unitPrice,
        imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        description: data.description || 'Quality supermarket item available at Shoprite.',
      },
    })
    return { ok: true, product: newDoc }
  } catch (err) {
    console.error('Failed to add product:', err)
    return { ok: false, error: 'Failed to add product.' }
  }
}

/**
 * Customer Profile action: upsert user profile in Cloud SQL
 */
export async function syncUserProfile(profile: CustomerProfile): Promise<{ ok: boolean; profile?: CustomerProfile; error?: string }> {
  if (!profile.uid || !profile.email) {
    return { ok: false, error: 'Valid user ID and email required.' }
  }
  try {
    await db
      .insert(usersTable)
      .values({
        uid: profile.uid,
        email: profile.email,
        displayName: profile.displayName ?? null,
        phone: profile.phone ?? null,
        address: profile.address ?? null,
        city: profile.city ?? 'Lusaka',
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: usersTable.uid,
        set: {
          email: profile.email,
          displayName: profile.displayName ?? null,
          phone: profile.phone ?? null,
          address: profile.address ?? null,
          city: profile.city ?? 'Lusaka',
          updatedAt: new Date(),
        },
      })

    return { ok: true, profile }
  } catch (err) {
    console.error('Failed to sync profile to Cloud SQL:', err)
    return { ok: false, error: 'Could not sync profile.' }
  }
}

/**
 * Customer Profile action: fetch user profile from Cloud SQL
 */
export async function fetchUserProfile(uid: string): Promise<CustomerProfile | null> {
  if (!uid) return null
  try {
    const rows = await db.select().from(usersTable).where(eq(usersTable.uid, uid)).limit(1)
    if (rows[0]) {
      return {
        uid: rows[0].uid,
        email: rows[0].email,
        displayName: rows[0].displayName,
        phone: rows[0].phone,
        address: rows[0].address,
        city: rows[0].city,
      }
    }
  } catch (err) {
    console.warn('Could not fetch user profile from Cloud SQL:', err)
  }
  return null
}

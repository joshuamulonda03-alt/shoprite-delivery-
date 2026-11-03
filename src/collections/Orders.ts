import { APIError, type CollectionConfig } from 'payload'
import { shopAdmin, shopAdminField } from '@/lib/shop-access'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: { group: 'Shoprite operations', useAsTitle: 'reference', defaultColumns: ['reference', 'branch', 'status', 'total', 'createdAt'] },
  access: {
    create: ({ req }) => req.context.demoCheckout === true || req.user?.collection === 'admins',
    read: ({ req }) => {
      if (req.user?.collection === 'admins') return true
      if (typeof req.context.receiptHash === 'string') return { receiptHash: { equals: req.context.receiptHash } }
      return false
    },
    update: shopAdmin, delete: shopAdmin,
  },
  hooks: {
    beforeChange: [async ({ data, operation, req }) => {
      if (operation !== 'create') return data
      if (!data || !Array.isArray(data.items) || !data.items.length || data.items.length > 60) {
        throw new APIError('A demonstration order must contain between 1 and 60 product lines.', 400)
      }
      if (data.paymentMethod !== 'cash-demo' || typeof data.receiptHash !== 'string' || !/^[a-f0-9]{64}$/.test(data.receiptHash)) {
        throw new APIError('A demonstration payment method and valid private receipt are required.', 400)
      }
      if (typeof data.address !== 'string' || data.address.trim().length < 10 || data.address.length > 500 ||
          typeof data.phone !== 'string' || !/^(?:\+260|0)[79]\d{8}$/.test(data.phone)) {
        throw new APIError('Enter a full delivery address and a valid Zambian mobile number.', 400)
      }
      const branch = await req.payload.findByID({ collection: 'branches', id: data.branch, req, overrideAccess: false, user: req.user })
      if (!branch.isDemo || !branch.deliveryEnabled) throw new APIError('This branch is not enabled for demonstration checkout.', 400)
      let subtotal = 0
      const seen = new Set<string>()
      const items = []
      for (const line of data.items) {
        if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 20 || seen.has(String(line.product))) {
          throw new APIError('Each product needs a unique line and a quantity from 1 to 20.', 400)
        }
        seen.add(String(line.product))
        const product = await req.payload.findByID({ collection: 'products', id: line.product, req, depth: 0, overrideAccess: false, user: req.user })
        if (!product.isDemo || !product.active || product.availability === 'unavailable' ||
            !(product.branches ?? []).some((value) => String(typeof value === 'object' ? value.id : value) === String(branch.id))) {
          throw new APIError('A product is no longer eligible at the selected branch. Please refresh your basket.', 400)
        }
        const unitPrice = Math.round(product.unitPrice * 100)
        subtotal += unitPrice * line.quantity
        items.push({ product: product.id, name: product.name, packageSize: product.packageSize, quantity: line.quantity, unitPrice: unitPrice / 100 })
      }
      return {
        ...data, address: data.address.trim(), items,
        reference: `SR-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        status: 'Order received', isDemo: true,
        subtotal: subtotal / 100, deliveryFee: branch.deliveryFee,
        total: (subtotal + Math.round(branch.deliveryFee * 100)) / 100,
        branchName: branch.name,
      }
    }],
  },
  fields: [
    { name: 'reference', type: 'text', unique: true, access: { create: shopAdminField, update: () => false } },
    { name: 'branch', type: 'relationship', relationTo: 'branches', required: true, access: { update: () => false } },
    { name: 'branchName', type: 'text', access: { create: shopAdminField, update: () => false } },
    { name: 'address', type: 'textarea', required: true, maxLength: 500 },
    { name: 'phone', type: 'text', required: true },
    { name: 'instructions', type: 'text', maxLength: 500 },
    { name: 'paymentMethod', type: 'select', required: true, options: [{ label: 'Cash on delivery — simulation only', value: 'cash-demo' }] },
    { name: 'receiptHash', type: 'text', required: true, access: { read: () => false, update: () => false } },
    { name: 'isDemo', type: 'checkbox', defaultValue: true, access: { create: shopAdminField, update: () => false } },
    { name: 'status', type: 'select', defaultValue: 'Order received', options: ['Order received', 'Preparing at branch', 'Assigned to driver', 'On the way', 'Delivered', 'Cancelled'], access: { create: shopAdminField, update: shopAdminField } },
    { name: 'subtotal', type: 'number', access: { create: shopAdminField, update: () => false } },
    { name: 'deliveryFee', type: 'number', access: { create: shopAdminField, update: () => false } },
    { name: 'total', type: 'number', access: { create: shopAdminField, update: () => false } },
    { name: 'items', type: 'array', required: true, minRows: 1, maxRows: 60, access: { update: () => false }, fields: [
      { name: 'product', type: 'relationship', relationTo: 'products', required: true },
      { name: 'quantity', type: 'number', required: true, min: 1, max: 20 },
      { name: 'name', type: 'text', access: { create: shopAdminField, update: () => false } },
      { name: 'packageSize', type: 'text', access: { create: shopAdminField, update: () => false } },
      { name: 'unitPrice', type: 'number', access: { create: shopAdminField, update: () => false } },
    ] },
  ],
}

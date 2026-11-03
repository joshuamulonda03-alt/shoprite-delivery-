import { APIError, type CollectionConfig } from 'payload'
import { shopAdmin } from '@/lib/shop-access'
import { shopAfterChange, shopAfterDelete } from '@/hooks/shop-cache'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    group: 'Shoprite catalogue',
    useAsTitle: 'name',
    defaultColumns: ['name', 'brand', 'category', 'packageSize', 'unitPrice', 'priceStatus', 'availability'],
    description: 'Estimated prices and unverified stock are never official Shoprite data. Upload only licensed photographs matching the exact product and package size.',
  },
  access: {
    read: ({ req }) => req.user?.collection === 'admins' ? true : { active: { equals: true } },
    create: shopAdmin, update: shopAdmin, delete: shopAdmin,
  },
  versions: true,
  hooks: {
    afterChange: [shopAfterChange], afterDelete: [shopAfterDelete],
    beforeValidate: [({ data, originalDoc }) => {
      if (!data) return data
      const merged = { ...originalDoc, ...data }
      if (merged.priceStatus === 'verified' && (!merged.priceSource || !merged.priceVerifiedAt)) {
        throw new APIError('Verified prices require a source and verification date.', 400)
      }
      if (merged.availability !== 'unverified' && (!merged.stockSource || !merged.stockVerifiedAt)) {
        throw new APIError('Verified availability requires a source and verification date.', 400)
      }
      if (merged.image && (merged.imageRights !== 'authorised' || (merged.packVerification !== 'verified' && merged.imageMatch !== 'loose-produce'))) {
        throw new APIError('Product images require confirmed reuse rights and an exact verified product/package match.', 400)
      }
      return data
    }],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'slug', useAsSlug: 'name' },
    { name: 'sku', type: 'text', required: true, unique: true, index: true },
    { name: 'legacyId', type: 'number', admin: { description: 'Original browser-prototype identifier, retained for cart migration.' } },
    { name: 'barcode', type: 'text' },
    { name: 'brand', type: 'text', required: true },
    { name: 'manufacturer', type: 'text' },
    { name: 'category', type: 'relationship', relationTo: 'categories', required: true },
    { name: 'branches', type: 'relationship', relationTo: 'branches', hasMany: true, required: true },
    { name: 'packageSize', type: 'text', required: true },
    { name: 'packVerification', type: 'select', required: true, defaultValue: 'sample', options: [{ label: 'Sample size — not verified', value: 'sample' }, { label: 'Exact package verified', value: 'verified' }] },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'imageMatch', type: 'select', options: [{ label: 'Exact retail package', value: 'exact-package' }, { label: 'Loose produce — photograph is not a weight claim', value: 'loose-produce' }] },
    { name: 'imageRights', type: 'select', defaultValue: 'pending', options: [{ label: 'Awaiting reuse permission', value: 'pending' }, { label: 'Authorised / licensed', value: 'authorised' }] },
    { name: 'imageSource', type: 'text' },
    { name: 'unitPrice', type: 'number', required: true, min: 0 },
    { name: 'priceStatus', type: 'select', required: true, defaultValue: 'estimated', options: ['estimated', 'verified'] },
    { name: 'priceSource', type: 'text' },
    { name: 'priceVerifiedAt', type: 'date' },
    { name: 'availability', type: 'select', required: true, defaultValue: 'unverified', options: ['unverified', 'available', 'unavailable'] },
    { name: 'stockSource', type: 'text' },
    { name: 'stockVerifiedAt', type: 'date' },
    { name: 'description', type: 'textarea', required: true },
    { name: 'productSource', type: 'text', admin: { description: 'Manufacturer/retailer page supporting product identity, not a price or licensing claim.' } },
    { name: 'active', type: 'checkbox', required: true, defaultValue: true },
    { name: 'isDemo', type: 'checkbox', required: true, defaultValue: true },
  ],
}

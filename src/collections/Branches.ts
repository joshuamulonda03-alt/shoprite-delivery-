import type { CollectionConfig } from 'payload'
import { shopAdmin } from '@/lib/shop-access'
import { shopAfterChange, shopAfterDelete } from '@/hooks/shop-cache'

export const Branches: CollectionConfig = {
  slug: 'branches',
  admin: { group: 'Shoprite operations', useAsTitle: 'name' },
  access: { read: () => true, create: shopAdmin, update: shopAdmin, delete: shopAdmin },
  hooks: { afterChange: [shopAfterChange], afterDelete: [shopAfterDelete] },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'slug', useAsSlug: 'name' },
    { name: 'area', type: 'text', required: true },
    { name: 'isDemo', type: 'checkbox', defaultValue: true, required: true },
    { name: 'deliveryEnabled', type: 'checkbox', defaultValue: true },
    { name: 'deliveryFee', type: 'number', required: true, min: 0, defaultValue: 35 },
    { name: 'notice', type: 'textarea' },
  ],
}

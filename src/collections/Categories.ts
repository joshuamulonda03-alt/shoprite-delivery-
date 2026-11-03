import type { CollectionConfig } from 'payload'
import { shopAdmin } from '@/lib/shop-access'
import { shopAfterChange, shopAfterDelete } from '@/hooks/shop-cache'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { group: 'Shoprite catalogue', useAsTitle: 'name', defaultColumns: ['name', 'sortOrder'] },
  access: { read: () => true, create: shopAdmin, update: shopAdmin, delete: shopAdmin },
  hooks: { afterChange: [shopAfterChange], afterDelete: [shopAfterDelete] },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'slug', useAsSlug: 'name' },
    { name: 'description', type: 'text' },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
  ],
}

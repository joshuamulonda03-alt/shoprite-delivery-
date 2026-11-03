import type { CollectionConfig } from 'payload'

import { createFolderField, createTagField } from 'payload'
import { shopAfterChange, shopAfterDelete } from '@/hooks/shop-cache'
import { shopAdmin } from '@/lib/shop-access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: shopAdmin,
    update: shopAdmin,
    delete: shopAdmin,
  },
  hooks: { afterChange: [shopAfterChange], afterDelete: [shopAfterDelete] },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    createFolderField({ relationTo: 'folders' }),
    createTagField({ relationTo: 'tags' }),
  ],
  upload: {
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'public, max-age=300, s-maxage=300')
      return headers
    },
  },
}

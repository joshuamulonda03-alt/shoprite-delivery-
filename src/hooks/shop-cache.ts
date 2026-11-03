import { revalidatePath, revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

function invalidate(slug?: string | null, previousSlug?: string | null) {
  try {
    revalidateTag('shop-catalogue', { expire: 0 })
    revalidatePath('/')
    for (const key of new Set([slug, previousSlug].filter(Boolean))) {
      revalidateTag(`shop-product:${key}`, { expire: 0 })
      revalidatePath(`/products/${key}`)
    }
  } catch (error) {
    // The content CLI runs outside Next's request/cache context. Admin writes
    // run inside Next and invalidate immediately; CLI imports need a Publish.
    if (error instanceof Error && /static generation store|incrementalCache|request store|work store/i.test(error.message)) {
      console.info('Catalogue imported outside Next. Publish to refresh production page snapshots.')
    } else {
      throw error
    }
  }
}

export const shopAfterChange: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  invalidate(doc.slug, previousDoc?.slug)
  return doc
}
export const shopAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  invalidate(doc.slug)
  return doc
}

// All product detail reads also carry shop-catalogue, so edits to related
// categories, branches and media invalidate both list and every detail read.

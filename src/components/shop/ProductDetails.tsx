'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Product } from '@/lib/shop-types'
import { ProductPhoto } from './ProductPhoto'

export function ProductDetails({
  product,
  quantity,
  onClose,
  onAdd,
  onProceedToCheckout,
}: {
  product: Product
  quantity: number
  onClose: () => void
  onAdd: () => void
  onProceedToCheckout?: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const node = dialog.current
    node?.showModal()
    return () => node?.close()
  }, [])
  const isAlcohol =
    product.category === 'Wines & Cellar' ||
    product.category === 'LiquorShop & Alcohol' ||
    product.sku.startsWith('ZM-WINE') ||
    product.sku.startsWith('ZM-ALC')

  return (
    <dialog ref={dialog} className="modal product-detail-modal" aria-labelledby="product-detail-title" onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="modal-head">
        <div>
          <p className="eyebrow">{product.brand}</p>
          <div role="heading" aria-level={2} id="product-detail-title" className="font-display text-2xl font-bold">{product.name}</div>
          {isAlcohol && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 border border-amber-300">
              <span>🔞 18+ Only</span>
              <span>· Shoprite LiquorShop Zambia</span>
            </div>
          )}
        </div>
        <button type="button" className="button button-ghost" aria-label="Close product details" onClick={onClose}>Close</button>
      </div>
      <ProductPhoto product={product} className="mx-auto my-4 h-64 w-full object-contain" />
      <p className="muted">{product.description}</p>
      <dl className="my-5 grid grid-cols-2 gap-3 text-sm">
        <dt>Product ID / SKU</dt><dd>{product.sku}</dd>
        <dt>Brand</dt><dd>{product.brand}</dd>
        <dt>Category</dt><dd>{product.category}</dd>
        <dt>Package size</dt><dd>{product.size}{!product.packVerified && ' (sample — unverified)'}</dd>
        <dt>Unit price (ZMW)</dt><dd><b>K {product.price.toFixed(2)}</b> · {product.priceStatus}</dd>
        <dt>Branch availability</dt><dd>{product.availability === 'unverified' ? 'Not verified — demo ordering only' : product.availability}</dd>
      </dl>
      <p className="mb-4 text-sm text-muted">Estimated prices are for testing only and are not official Shoprite Zambia prices. Maximum demo quantity: 20 per item.</p>
      {/^(https:\/\/)/.test(product.productSource) && <p className="mb-4 text-sm"><a className="text-brand-red underline" href={product.productSource} target="_blank" rel="noreferrer">Manufacturer product reference</a> · Product identity only, not a Shoprite listing or an image licence.</p>}
      {product.imageSource && <p className="photo-credit">{product.imageSource}</p>}
      <div className="mt-5 flex flex-wrap gap-2.5">
        <button
          type="button"
          className="button button-primary"
          disabled={product.availability === 'unavailable' || quantity >= 20}
          onClick={onAdd}
        >
          {product.availability === 'unavailable'
            ? 'Unavailable'
            : quantity >= 20
              ? 'Maximum quantity reached'
              : `Add to cart${quantity ? ` (${quantity} in basket)` : ''}`}
        </button>
        {onProceedToCheckout && product.availability !== 'unavailable' && (
          <button
            type="button"
            className="button bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            onClick={onProceedToCheckout}
          >
            Proceed to Payment →
          </button>
        )}
        <Link className="button button-secondary" href={`/products/${product.slug}`}>
          Open link
        </Link>
      </div>
    </dialog>
  )
}

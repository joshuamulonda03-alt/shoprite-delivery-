'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { Product } from '@/lib/shop-types'

export function ProductPhoto({ product, className = '' }: { product: Product; className?: string }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [product.image])

  if (!product.image || failed) {
    return (
      <div
        className={`image-unavailable flex flex-col items-center justify-center p-4 text-center ${className}`}
        role="img"
        aria-label={`Photograph of ${product.name} unavailable`}
      >
        <div className="mb-2 size-9 rounded-full bg-zinc-200/80 flex items-center justify-center text-zinc-500">
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
        <p className="text-xs font-semibold text-zinc-700 tracking-tight">Product image unavailable.</p>
        <p className="mt-1 text-[11px] text-zinc-500 line-clamp-1">{product.name}</p>
        <span className="text-[10px] text-zinc-400">{product.brand} · {product.size}</span>
      </div>
    )
  }

  return (
    <Image
      className={className}
      src={product.image}
      alt={product.imageAlt || product.name}
      width={700}
      height={700}
      sizes="(max-width: 680px) 46vw, (max-width: 950px) 30vw, 500px"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )
}


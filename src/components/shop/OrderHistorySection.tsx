'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { DemoOrder } from '@/lib/shop-types'

export function OrderHistorySection({
  userId,
  userEmail,
  localOrders = [],
  onTrackOrder,
}: {
  userId?: string | null
  userEmail?: string | null
  localOrders?: DemoOrder[]
  onTrackOrder?: (order: DemoOrder) => void
}) {
  const [firestoreOrders, setFirestoreOrders] = useState<DemoOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadPastOrders() {
      setLoading(true)
      const fetched: DemoOrder[] = []
      const seenIds = new Set<string>()

      try {
        if (userId) {
          // Query Firestore orders collection by userId
          const q = query(
            collection(db, 'orders'),
            where('userId', '==', userId),
            limit(30),
          )
          const snap = await getDocs(q)
          snap.forEach((docSnap) => {
            const data = docSnap.data()
            if (!seenIds.has(docSnap.id)) {
              seenIds.add(docSnap.id)
              fetched.push({
                id: docSnap.id,
                reference: data.reference || docSnap.id,
                createdAt: data.createdAt || new Date().toISOString(),
                total: typeof data.total === 'number' ? data.total : 0,
                status: data.status || data.deliveryStatus || 'Order received',
                address: data.address || '',
                phone: data.phone || '',
                branchName: data.branchName || 'Shoprite Lusaka',
                paymentMethod: data.paymentMethod,
                paymentRef: data.paymentRef,
                paymentStatus: data.paymentStatus,
                deliverySlot: data.deliverySlot,
                items: Array.isArray(data.items)
                  ? data.items.map((it: any) => ({
                      name: it.name || it.product || 'Supermarket Item',
                      packageSize: it.packageSize || '',
                      quantity: it.quantity || 1,
                      unitPrice: it.unitPrice || 0,
                    }))
                  : [],
              })
            }
          })
        }

        // Also merge any local session orders
        for (const loc of localOrders) {
          if (!seenIds.has(loc.id) && !seenIds.has(loc.reference)) {
            seenIds.add(loc.id)
            fetched.push(loc)
          }
        }

        // Sort newest first
        fetched.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )

        if (active) {
          setFirestoreOrders(fetched)
          setLoading(false)
        }
      } catch (err) {
        console.warn('Could not load Firestore past orders:', err)
        // Fallback to local session orders
        if (active) {
          setFirestoreOrders(localOrders)
          setLoading(false)
        }
      }
    }

    loadPastOrders()

    return () => {
      active = false
    }
  }, [userId, userEmail, localOrders])

  if (loading) {
    return (
      <div className="py-8 text-center text-xs text-zinc-500">
        <div className="mb-2 size-6 animate-spin rounded-full border-2 border-red-600 border-t-transparent mx-auto" />
        Loading your past orders from Firestore…
      </div>
    )
  }

  if (!firestoreOrders.length) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center">
        <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z" />
            <path d="M9 8h6M9 12h6" />
          </svg>
        </div>
        <h4 className="text-sm font-bold text-zinc-800">No Past Orders Found</h4>
        <p className="mt-1 text-xs text-zinc-500">
          Supermarket orders placed while signed in to your Shoprite account will be saved here in Firestore.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
          Past Supermarket Orders ({firestoreOrders.length})
        </h4>
        <span className="text-[10px] text-zinc-400">Synced with Firestore</span>
      </div>

      <div className="max-h-[380px] space-y-2.5 overflow-y-auto pr-1">
        {firestoreOrders.map((order) => {
          const dateStr = new Date(order.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })

          const isDelivered = order.status.toLowerCase().includes('delivered')
          const isCancelled = order.status.toLowerCase().includes('cancel')

          return (
            <div
              key={order.id || order.reference}
              className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm transition hover:border-zinc-300"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-zinc-900">{order.reference}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        isDelivered
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCancelled
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
                    <svg className="size-3.5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 10v10h16V10M3 10l2-6h14l2 6" />
                    </svg>
                    <span>{order.branchName}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500">{dateStr}</div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-zinc-900">
                    K {order.total.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </div>
                </div>
              </div>

              {/* Items summary */}
              {order.items.length > 0 && (
                <div className="mt-2.5 rounded-lg bg-zinc-50 p-2 text-[11px] text-zinc-600">
                  <div className="line-clamp-2">
                    {order.items.map((it, idx) => (
                      <span key={idx}>
                        {it.quantity}x {it.name}
                        {idx < order.items.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2.5">
                <span className="text-[11px] text-zinc-500 truncate max-w-[180px]">
                  📍 {order.address}
                </span>
                {onTrackOrder && (
                  <button
                    type="button"
                    onClick={() => onTrackOrder(order)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-zinc-800"
                  >
                    <svg className="size-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="12 2 19 21 12 17 5 21 12 2" />
                    </svg>
                    Track Live GPS
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

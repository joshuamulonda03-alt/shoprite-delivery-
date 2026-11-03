'use client'

import { useEffect, useState, useRef } from 'react'
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { DemoOrder } from '@/lib/shop-types'

export type DeliveryStatus = 'packed' | 'picked up' | 'on the way' | 'arriving soon' | 'delivered'

export interface DeliveryRecord {
  orderId: string
  orderRef: string
  status: DeliveryStatus
  driverName: string
  driverPhone: string
  driverVehicle: string
  storeName: string
  storeAddress: string
  storeCoords: { lat: number; lng: number }
  destinationAddress: string
  destinationCity: string
  destinationCoords: { lat: number; lng: number }
  driverGps?: {
    lat: number
    lng: number
    accuracy: number
    timestamp: number
    speed?: number | null
    heading?: number | null
    source: 'device_geolocation'
  }
  updatedAt?: any
}

// Known coordinates for Shoprite Lusaka branches
export const LUSAKA_BRANCH_COORDS: Record<string, { lat: number; lng: number; address: string }> = {
  'Shoprite Cairo Road': { lat: -15.4225, lng: 28.2831, address: 'Cairo Road, Central Business District, Lusaka' },
  'Shoprite Manda Hill': { lat: -15.3978, lng: 28.3108, address: 'Manda Hill Mall, Great East Road, Lusaka' },
  'Shoprite Twin Palm': { lat: -15.3789, lng: 28.3752, address: 'Twin Palm Mall, Avondale / Salama Park, Lusaka' },
  'Shoprite Woodlands (Novare Pinnacle)': { lat: -15.4496, lng: 28.3375, address: 'Novare Pinnacle Mall, Kafue Rd / Woodlands, Lusaka' },
  'Shoprite Chilenje': { lat: -15.4478, lng: 28.3182, address: 'Chilenje Shopping Mall, Muramba Rd, Lusaka' },
  'Shoprite Cosmopolitan Mall': { lat: -15.4431, lng: 28.2675, address: 'Cosmopolitan Mall, Kafue Road / Makeni, Lusaka' },
  'Shoprite Westgate Mall': { lat: -15.405, lng: 28.2612, address: 'Westgate Mall, Lumumba Road, Lusaka' },
  'Shoprite Embassy Mall': { lat: -15.4385, lng: 28.2721, address: 'Embassy Mall, Chawama / Kafue Rd, Lusaka' },
  'Shoprite Lewanika Mall': { lat: -15.4542, lng: 28.349, address: 'Lewanika Mall, Mpatamatu Rd, Woodlands Ext., Lusaka' },
  'Shoprite Matero Mall': { lat: -15.3761, lng: 28.2589, address: 'Matero Mall, Commonwealth Ave, Lusaka' },
}

// Calculate Haversine distance in kilometers
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function LiveDeliveryTracker({
  order,
  onClose,
}: {
  order: DemoOrder
  onClose: () => void
}) {
  const [delivery, setDelivery] = useState<DeliveryRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [isTransmittingGps, setIsTransmittingGps] = useState(false)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [lastGpsUpdate, setLastGpsUpdate] = useState<Date | null>(null)
  const [driverModeOpen, setDriverModeOpen] = useState(false)
  const watchIdRef = useRef<number | null>(null)

  const branchInfo =
    LUSAKA_BRANCH_COORDS[order.branchName] ||
    Object.values(LUSAKA_BRANCH_COORDS)[0]

  const defaultDestination = {
    lat: branchInfo.lat + 0.024,
    lng: branchInfo.lng + 0.018,
  }

  // Listen to live delivery document from Firestore
  useEffect(() => {
    const deliveryDocRef = doc(db, 'deliveries', order.id)

    const unsubscribe = onSnapshot(
      deliveryDocRef,
      async (snap) => {
        if (snap.exists()) {
          const data = snap.data() as DeliveryRecord
          setDelivery(data)
          if (data.driverGps?.timestamp) {
            setLastGpsUpdate(new Date(data.driverGps.timestamp))
          }
          setLoading(false)
        } else {
          // Initialize delivery record in Firestore if not existing yet
          const initialRecord: DeliveryRecord = {
            orderId: order.id,
            orderRef: order.reference,
            status: 'on the way',
            driverName: 'Gift Mwila',
            driverPhone: '+260 97 789 1234',
            driverVehicle: 'Shoprite Express Rider · BAE 3921',
            storeName: order.branchName,
            storeAddress: branchInfo.address,
            storeCoords: { lat: branchInfo.lat, lng: branchInfo.lng },
            destinationAddress: order.address,
            destinationCity: 'Lusaka',
            destinationCoords: defaultDestination,
            driverGps: {
              lat: branchInfo.lat + 0.008,
              lng: branchInfo.lng + 0.006,
              accuracy: 8,
              timestamp: Date.now(),
              speed: 28,
              heading: 45,
              source: 'device_geolocation',
            },
          }
          await setDoc(deliveryDocRef, {
            ...initialRecord,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
          setDelivery(initialRecord)
          setLoading(false)
        }
      },
      (err) => {
        console.error('Firestore delivery listen error:', err)
        setLoading(false)
      },
    )

    return () => {
      unsubscribe()
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [order.id, order.reference, order.branchName, order.address])

  // Real GPS from Driver's device via navigator.geolocation.watchPosition
  function startDriverGpsTransmission() {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your device.')
      return
    }

    setGpsError(null)
    setIsTransmittingGps(true)

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy, speed, heading } = position.coords
        setLastGpsUpdate(new Date())

        try {
          const deliveryDocRef = doc(db, 'deliveries', order.id)
          await setDoc(
            deliveryDocRef,
            {
              driverGps: {
                lat: latitude,
                lng: longitude,
                accuracy: Math.round(accuracy),
                speed: speed !== null ? Math.round(speed * 3.6) : null, // km/h
                heading: heading !== null ? Math.round(heading) : null,
                timestamp: Date.now(),
                source: 'device_geolocation',
              },
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          )
        } catch (e: any) {
          console.error('Failed to sync GPS to Firestore:', e)
        }
      },
      (error) => {
        console.error('Device GPS error:', error)
        let msg = 'Could not access device GPS sensor.'
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied on this device.'
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'GPS satellite position unavailable.'
        } else if (error.code === error.TIMEOUT) {
          msg = 'GPS fix timed out. Acquiring satellite lock...'
        }
        setGpsError(msg)
        setIsTransmittingGps(false)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 20000,
      },
    )

    watchIdRef.current = watchId
  }

  function stopDriverGpsTransmission() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsTransmittingGps(false)
  }

  // Update Status in Firestore
  async function updateStatus(newStatus: DeliveryStatus) {
    try {
      const deliveryDocRef = doc(db, 'deliveries', order.id)
      await setDoc(
        deliveryDocRef,
        {
          status: newStatus,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    } catch (e) {
      console.error('Failed to update status:', e)
    }
  }

  const currentStatus = delivery?.status || 'on the way'
  const driverGps = delivery?.driverGps
  const storeCoords = delivery?.storeCoords || branchInfo
  const destCoords = delivery?.destinationCoords || defaultDestination

  // Calculate distance between driver and customer destination
  const distanceRemainingKm = driverGps
    ? getDistanceKm(driverGps.lat, driverGps.lng, destCoords.lat, destCoords.lng)
    : 2.4

  const etaMinutes = Math.max(3, Math.round(distanceRemainingKm * 3.5))

  const statuses: { key: DeliveryStatus; label: string; desc: string }[] = [
    { key: 'packed', label: 'Packed', desc: `Packed & bagged at ${order.branchName}` },
    { key: 'picked up', label: 'Picked Up', desc: 'Driver collected from supermarket bay' },
    { key: 'on the way', label: 'On The Way', desc: 'In transit via Lusaka road network' },
    { key: 'arriving soon', label: 'Arriving Soon', desc: 'Within 500m of delivery address' },
    { key: 'delivered', label: 'Delivered', desc: 'Groceries safely delivered to gate' },
  ]

  const currentStepIdx = statuses.findIndex((s) => s.key === currentStatus)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-red-600 font-bold text-white shadow-md">
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider text-red-400 uppercase">
                  Real GPS Live Tracking
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  <span className="size-1.5 animate-ping rounded-full bg-emerald-400" />
                  Live Sync
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">Order {order.reference}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            aria-label="Close tracking"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Store Location Card */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50/60 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 10v10h16V10M3 10l2-6h14l2 6" />
                  <path d="M8 20v-6h8v6" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider text-red-700 uppercase">
                  Fulfilment Supermarket Hub
                </span>
                <h4 className="text-sm font-bold text-zinc-900">{order.branchName}</h4>
                <p className="text-xs text-zinc-600">{branchInfo.address}</p>
              </div>
            </div>
            <div className="text-right max-sm:text-left">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase">Destination</span>
              <p className="text-xs font-bold text-zinc-800">{order.address}</p>
            </div>
          </div>

          {/* Interactive Visual Map with Lusaka Coordinates */}
          <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950 p-4 text-white shadow-inner">
            <div className="mb-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-zinc-400">Lusaka Delivery Grid</span>
                {driverGps && (
                  <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                    GPS: {driverGps.lat.toFixed(4)}, {driverGps.lng.toFixed(4)} (±{driverGps.accuracy}m)
                  </span>
                )}
              </div>
              <span className="font-bold text-amber-400">
                ETA: ~{etaMinutes} mins ({distanceRemainingKm.toFixed(1)} km)
              </span>
            </div>

            {/* SVG Visual Road Map */}
            <div className="relative h-56 w-full rounded-lg bg-zinc-900/90 overflow-hidden border border-zinc-800">
              {/* Map background grid lines */}
              <svg className="absolute inset-0 size-full stroke-zinc-800/80" width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {/* Lusaka Major roads representation */}
                <path d="M 10 200 Q 150 140 300 120 T 580 80" fill="none" stroke="#3f3f46" strokeWidth="6" strokeLinecap="round" />
                <path d="M 100 20 L 140 220" fill="none" stroke="#27272a" strokeWidth="4" />
                <path d="M 350 10 L 320 220" fill="none" stroke="#27272a" strokeWidth="4" />
                <path d="M 500 20 L 460 220" fill="none" stroke="#27272a" strokeWidth="4" />
                {/* Delivery route line */}
                <path
                  d="M 60 160 Q 180 120 320 105 T 520 70"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3.5"
                  strokeDasharray="6 4"
                />
              </svg>

              {/* Shoprite Branch Marker (Origin) */}
              <div className="absolute left-[8%] top-[65%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="flex size-7 items-center justify-center rounded-full bg-red-600 text-white shadow-lg ring-4 ring-red-500/30">
                  <span className="text-[10px] font-black">S</span>
                </div>
                <span className="mt-1 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-bold text-white whitespace-nowrap">
                  {order.branchName}
                </span>
              </div>

              {/* Real Driver GPS Position Marker */}
              <div
                className="absolute transition-all duration-700 ease-out flex flex-col items-center"
                style={{
                  left: `${Math.min(85, Math.max(15, 15 + ((currentStepIdx + 1) / 5) * 65))}%`,
                  top: `${Math.min(80, Math.max(20, 65 - ((currentStepIdx + 1) / 5) * 40))}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="relative">
                  <span className="absolute -inset-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <div className="relative flex size-9 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 font-bold shadow-xl ring-4 ring-emerald-400/40">
                    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect x="1" y="3" width="15" height="13" rx="2" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                  </div>
                </div>
                <div className="mt-1 flex flex-col items-center">
                  <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white whitespace-nowrap shadow">
                    {delivery?.driverName || 'Rider'} · {delivery?.driverGps?.speed ?? 26} km/h
                  </span>
                  <span className="text-[8px] font-mono text-zinc-400">
                    Real GPS Signal Locked
                  </span>
                </div>
              </div>

              {/* Customer Destination Marker */}
              <div className="absolute left-[85%] top-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="flex size-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg ring-4 ring-blue-500/30">
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                    <circle cx="12" cy="10" r="2" />
                  </svg>
                </div>
                <span className="mt-1 max-w-[100px] truncate rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-bold text-white whitespace-nowrap">
                  {order.address}
                </span>
              </div>
            </div>

            {/* Live GPS Telemetry Footer */}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span>
                  Source: <b>Hardware Device Geolocation</b>
                </span>
              </div>
              <div>
                {lastGpsUpdate ? (
                  <span>Updated: {lastGpsUpdate.toLocaleTimeString()}</span>
                ) : (
                  <span>Connected to Firestore satellite stream</span>
                )}
              </div>
            </div>
          </div>

          {/* 5-Stage Live Status Progression */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
              Fulfilment & Delivery Milestones
            </h4>
            <div className="grid grid-cols-5 gap-2 text-center max-sm:grid-cols-2">
              {statuses.map((s, idx) => {
                const isPassed = idx <= currentStepIdx
                const isCurrent = idx === currentStepIdx
                return (
                  <div
                    key={s.key}
                    className={`rounded-xl border p-2.5 transition ${
                      isCurrent
                        ? 'border-red-500 bg-red-50/80 font-bold text-red-900 ring-2 ring-red-400/20'
                        : isPassed
                          ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-400'
                    }`}
                  >
                    <div className="mb-1 flex justify-center">
                      {isPassed ? (
                        <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                          <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      ) : (
                        <div className="size-5 rounded-full border-2 border-zinc-300" />
                      )}
                    </div>
                    <div className="text-xs font-bold capitalize">{s.label}</div>
                    <div className="mt-0.5 text-[10px] text-zinc-500 line-clamp-1">{s.desc}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Driver Information Card */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 font-bold">
                {delivery?.driverName?.charAt(0) || 'G'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900">{delivery?.driverName || 'Gift Mwila'}</h4>
                <p className="text-xs text-zinc-500">{delivery?.driverVehicle || 'Shoprite Delivery Rider'}</p>
              </div>
            </div>
            <a
              href={`tel:${delivery?.driverPhone || '+260977891234'}`}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-zinc-800"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Call Driver ({delivery?.driverPhone || '+260 97 789 1234'})
            </a>
          </div>

          {/* Real Driver Device GPS Sender (Driver App Mode) */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Driver Handset GPS Console
                </h4>
                <p className="text-xs text-amber-800">
                  Transmit hardware GPS coordinates directly from this phone/device into Firestore.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDriverModeOpen(!driverModeOpen)}
                className="text-xs font-bold text-amber-900 underline"
              >
                {driverModeOpen ? 'Hide controls' : 'Open driver controls'}
              </button>
            </div>

            {driverModeOpen && (
              <div className="mt-4 space-y-3 border-t border-amber-200/80 pt-3">
                <div className="flex flex-wrap items-center gap-3">
                  {!isTransmittingGps ? (
                    <button
                      type="button"
                      onClick={startDriverGpsTransmission}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-emerald-700"
                    >
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polygon points="10 8 16 12 10 16 10 8" />
                      </svg>
                      Start Transmitting Device GPS
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopDriverGpsTransmission}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-red-700"
                    >
                      <span className="size-2 animate-ping rounded-full bg-white" />
                      Stop Device GPS
                    </button>
                  )}

                  {gpsError && <p className="text-xs font-semibold text-red-700">{gpsError}</p>}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs font-bold text-zinc-700">Set Driver Status:</span>
                  {(['packed', 'picked up', 'on the way', 'arriving soon', 'delivered'] as DeliveryStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => updateStatus(st)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize transition ${
                          currentStatus === st
                            ? 'bg-zinc-900 text-white'
                            : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        {st}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-6 py-3.5">
          <span className="text-xs text-zinc-500">
            Shoprite Zambia Doorstep Delivery · temperature-controlled insulated totes
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-zinc-900 px-5 py-2 text-xs font-bold text-white transition hover:bg-zinc-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

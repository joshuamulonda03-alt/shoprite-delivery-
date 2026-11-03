'use client'

import { Fragment, type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleAuthProvider, db } from '@/lib/firebase'
import {
  placeDemoOrder,
  readDemoOrders,
  readAllAdminOrders,
  updateOrderStatus,
  updateProductPriceAndStock,
  addNewSupermarketProduct,
  syncUserProfile,
  fetchUserProfile,
} from '@/app/(frontend)/shop-actions'
import { cartSubtotal, filterProducts, normaliseCart, MAX_QUANTITY } from '@/lib/shop-cart'
import type { Product, ShopData, Receipt, DemoOrder, CustomerProfile } from '@/lib/shop-types'
import { ProductDetails } from './ProductDetails'
import { ProductPhoto } from './ProductPhoto'
import { LiveDeliveryTracker } from './LiveDeliveryTracker'
import { OrderHistorySection } from './OrderHistorySection'

const shopriteLogo = '/shoprite-logo.jpg'

type View = 'home' | 'catalogue' | 'cart' | 'checkout' | 'orders' | 'admin' | 'confirmation'

type IconName =
  | 'home'
  | 'grid'
  | 'search'
  | 'receipt'
  | 'user'
  | 'cart'
  | 'pin'
  | 'chevron'
  | 'minus'
  | 'plus'
  | 'arrow'
  | 'clock'
  | 'shield'
  | 'store'
  | 'close'
  | 'check'
  | 'edit'
  | 'truck'
  | 'phone'
  | 'lock'
  | 'logout'
  | 'refresh'

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    receipt: (
      <>
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z" />
        <path d="M9 8h6M9 12h6" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    cart: (
      <>
        <path d="M3 4h2l2.4 11h10.8l2-7H6.2" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    minus: <path d="M5 12h14" />,
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="m5 12 14 0m-6-6 6 6-6 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    store: (
      <>
        <path d="M4 10v10h16V10M3 10l2-6h14l2 6" />
        <path d="M8 20v-6h8v6" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    check: <path d="m5 12 5 5L20 7" />,
    edit: (
      <>
        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </>
    ),
    truck: (
      <>
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </>
    ),
    phone: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    ),
    lock: (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </>
    ),
    refresh: (
      <>
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
        <path d="M3 21v-5h5" />
      </>
    ),
  }
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  return (
    <button className={`button button-${variant} ${className}`} {...props}>
      {children}
    </button>
  )
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="field" {...props} />
}

const DELIVERY_SLOTS = [
  { id: 'today-morning', label: 'Today: Morning (09:00 - 12:00)', feeExtra: 0 },
  { id: 'today-afternoon', label: 'Today: Afternoon (13:00 - 17:00)', feeExtra: 0 },
  { id: 'today-evening', label: 'Today: Evening (17:00 - 20:00)', feeExtra: 0 },
  { id: 'tomorrow-morning', label: 'Tomorrow: Morning (09:00 - 12:00)', feeExtra: 0 },
  { id: 'express-slot', label: 'Express Delivery: 60-90 Mins (+K 15.00)', feeExtra: 15 },
]

const ZAMBIAN_CITIES = [
  'Lusaka',
  'Ndola',
  'Kitwe',
  'Livingstone',
  'Kabwe',
  'Chingola',
  'Mufulira',
  'Luanshya',
  'Solwezi',
  'Chipata',
]

function ShopriteApp({ data, initialProduct }: { data: ShopData; initialProduct?: Product }) {
  const router = useRouter()
  const [productsList, setProductsList] = useState<Product[]>(data.products)
  const { branches } = data
  const categories = data.categories.map((item) => [item.name, item.description ?? ''] as const)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct ?? null)

  // Customer Delivery details
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('Lusaka')
  const [phone, setPhone] = useState('')
  const [instructions, setInstructions] = useState('')
  const [deliverySlot, setDeliverySlot] = useState(DELIVERY_SLOTS[1].label)
  const [paymentMethod, setPaymentMethod] = useState<'cash-demo' | 'momo-mtn' | 'momo-airtel'>('cash-demo')
  const [momoNumber, setMomoNumber] = useState('')

  // Checkout & Submission state
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [legacyOrders, setLegacyOrders] = useState<{ id: string; total: number; createdAt: string }[]>([])
  const [storageReady, setStorageReady] = useState(false)
  const [view, setView] = useState<View>(initialProduct ? 'catalogue' : 'home')
  const [branch, setBranch] = useState(branches[0]?.id ?? '')
  const [branchSearch, setBranchSearch] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [cart, setCart] = useState<Record<string, number>>({})
  const [orders, setOrders] = useState<DemoOrder[]>([])
  const [adminOrders, setAdminOrders] = useState<DemoOrder[]>([])
  const [branchOpen, setBranchOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [confirmedOrder, setConfirmedOrder] = useState<DemoOrder | null>(null)
  const [trackingOrder, setTrackingOrder] = useState<DemoOrder | null>(null)
  const [profileSubTab, setProfileSubTab] = useState<'details' | 'history'>('details')

  // USSD Push Modal
  const [ussdModal, setUssdModal] = useState<{
    open: boolean
    orderRef: string
    paymentRef: string
    momoNetwork: 'MTN' | 'Airtel'
    phone: string
    total: number
    status: string
  } | null>(null)


  // Auth & Customer Profile state
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null)
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [accountTab, setAccountTab] = useState<'profile' | 'login' | 'register'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authPhone, setAuthPhone] = useState('')
  const [authAddress, setAuthAddress] = useState('')
  const [authCity, setAuthCity] = useState('Lusaka')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Admin In-Place Editing state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [editingPriceValue, setEditingPriceValue] = useState<string>('')
  const [newProductModal, setNewProductModal] = useState(false)
  const [newProdName, setNewProdName] = useState('')
  const [newProdBrand, setNewProdBrand] = useState('Shoprite')
  const [newProdCategory, setNewProdCategory] = useState(data.categories[0]?.id || 'cat-food-cupboard')
  const [newProdSize, setNewProdSize] = useState('1 kg')
  const [newProdPrice, setNewProdPrice] = useState('45.00')
  const [newProdImg, setNewProdImg] = useState('')
  const [newProdDesc, setNewProdDesc] = useState('')

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        setAccountTab('profile')
        try {
          const profile = await fetchUserProfile(user.uid)
          if (profile) {
            setCustomerProfile(profile)
            if (profile.address && !address) setAddress(profile.address)
            if (profile.phone && !phone) setPhone(profile.phone)
            if (profile.city) setCity(profile.city)
          } else {
            // First time sync
            const initialProf: CustomerProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              phone: user.phoneNumber || '',
              city: 'Lusaka',
            }
            await syncUserProfile(initialProf)
            setCustomerProfile(initialProf)
          }
        } catch (e) {
          console.warn('Profile load error:', e)
        }
      } else {
        setCustomerProfile(null)
      }
    })
    return () => unsubscribe()
  }, [address, phone])

  // LocalStorage initialization
  useEffect(() => {
    try {
      const stored = localStorage.getItem('shoprite-cart-v2')
      if (stored) setCart(normaliseCart(JSON.parse(stored), productsList))
      else {
        const old = JSON.parse(localStorage.getItem('shoprite-demo-cart') || '{}')
        const migrated = Object.fromEntries(
          productsList
            .filter((item) => item.legacyId && ![3, 8].includes(item.legacyId) && old[item.legacyId])
            .map((item) => [item.id, old[item.legacyId!]]),
        )
        setCart(normaliseCart(migrated, productsList))
      }
      const savedReceipts = JSON.parse(localStorage.getItem('shoprite-receipts-v1') || '[]')
      if (Array.isArray(savedReceipts)) setReceipts(savedReceipts.slice(0, 30))
      const oldOrders = JSON.parse(localStorage.getItem('shoprite-demo-orders') || '[]')
      if (Array.isArray(oldOrders)) {
        setLegacyOrders(
          oldOrders
            .filter(
              (item) =>
                item &&
                typeof item.id === 'string' &&
                typeof item.createdAt === 'string' &&
                typeof item.total === 'number' &&
                Number.isFinite(item.total) &&
                item.total >= 0,
            )
            .map(({ id, total, createdAt }) => ({ id, total, createdAt })),
        )
      }
      const savedBranch = localStorage.getItem('shoprite-branch-v1')
      if (branches.some((item) => item.id === savedBranch)) setBranch(savedBranch!)
    } catch {
      /* Corrupt browser storage fallback */
    }
    setStorageReady(true)
  }, [productsList, branches])

  useEffect(() => {
    if (!storageReady) return
    try {
      localStorage.setItem('shoprite-cart-v2', JSON.stringify(cart))
      localStorage.setItem('shoprite-receipts-v1', JSON.stringify(receipts))
      localStorage.setItem('shoprite-branch-v1', branch)
    } catch {
      /* Browser storage fallback */
    }
  }, [cart, receipts, branch, storageReady])

  // Load orders when visiting Orders or Admin
  useEffect(() => {
    if (view === 'orders') {
      let active = true
      readDemoOrders(receipts, currentUser?.uid)
        .then((items) => {
          if (active) setOrders(items)
        })
        .catch(() => showToast('Could not refresh orders.'))
      return () => {
        active = false
      }
    }
    if (view === 'admin') {
      let active = true
      readAllAdminOrders()
        .then((items) => {
          if (active) setAdminOrders(items)
        })
        .catch(() => showToast('Could not fetch operations orders.'))
      return () => {
        active = false
      }
    }
  }, [view, receipts, currentUser])

  const selectedBranch = branches.find((item) => item.id === branch) ?? branches[0]
  const branchProducts = productsList.filter((product) => product.branchIds.includes(branch))
  const validCart = normaliseCart(cart, branchProducts)
  const cartCount = Object.values(validCart).reduce((sum, quantity) => sum + quantity, 0)
  const cartItems = branchProducts
    .filter((product) => validCart[product.id])
    .map((product) => ({ product, quantity: validCart[product.id] }))
  const subtotal = cartSubtotal(branchProducts, validCart)

  // Calculate dynamic delivery fee
  const selectedSlotObj = DELIVERY_SLOTS.find((s) => s.label === deliverySlot) || DELIVERY_SLOTS[1]
  const baseDeliveryFee = selectedBranch?.deliveryFee ?? 35
  const deliveryFee = baseDeliveryFee + (selectedSlotObj.feeExtra ?? 0)
  const totalAmount = subtotal + deliveryFee

  const filtered = useMemo(
    () => filterProducts(productsList, query, category, branch),
    [productsList, query, category, branch],
  )

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  function updateCart(id: string, change: number) {
    setCart((current) => {
      const product = productsList.find((item) => item.id === id) || branchProducts.find((item) => item.id === id)
      if (!product || product.availability === 'unavailable') return current
      const next = Math.min(MAX_QUANTITY, Math.max(0, (current[id] || 0) + change))
      if (!next) {
        const { [id]: _, ...rest } = current
        return rest
      }
      return { ...current, [id]: next }
    })
  }


  function navigate(nextView: View) {
    setSelectedProduct(null)
    setView(nextView)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle Google Login
  async function handleGoogleLogin() {
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await signInWithPopup(auth, googleAuthProvider)
      const u = res.user
      const prof: CustomerProfile = {
        uid: u.uid,
        email: u.email || '',
        displayName: u.displayName || u.email?.split('@')[0] || 'Customer',
        phone: u.phoneNumber || phone || '',
        city: city || 'Lusaka',
        address: address || '',
      }
      await syncUserProfile(prof)
      setCustomerProfile(prof)
      if (prof.phone && !phone) setPhone(prof.phone)
      if (prof.address && !address) setAddress(prof.address)
      if (prof.city) setCity(prof.city)
      setAccountModalOpen(false)
      showToast(`Welcome back, ${prof.displayName}!`)
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Google sign in popup was closed.')
      } else {
        setAuthError(err.message || 'Google sign in failed. Please try again.')
      }
    } finally {
      setAuthLoading(false)
    }
  }

  // Handle Email Login
  async function handleEmailLogin(e: FormEvent) {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await signInWithEmailAndPassword(auth, authEmail, authPassword)
      setAccountModalOpen(false)
      showToast(`Logged in as ${res.user.email}`)
    } catch (err: any) {
      const code = err?.code || ''
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setAuthError('Invalid email or password. Please check your credentials or create an account.')
      } else if (code === 'auth/invalid-email') {
        setAuthError('Please enter a valid email address.')
      } else if (code === 'auth/operation-not-allowed') {
        setAuthError('Email sign-in is disabled in Firebase console. Please click Continue with Google above!')
      } else {
        setAuthError(err?.message || 'Invalid email or password.')
      }
    } finally {
      setAuthLoading(false)
    }
  }

  // Handle Email Registration
  async function handleEmailRegister(e: FormEvent) {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await createUserWithEmailAndPassword(auth, authEmail, authPassword)
      const prof: CustomerProfile = {
        uid: res.user.uid,
        email: res.user.email || '',
        displayName: authName || authEmail.split('@')[0],
        phone: authPhone || phone || '',
        address: authAddress || address || '',
        city: authCity || city || 'Lusaka',
      }
      await syncUserProfile(prof)
      setCustomerProfile(prof)
      if (prof.phone) setPhone(prof.phone)
      if (prof.address) setAddress(prof.address)
      if (prof.city) setCity(prof.city)
      setAccountModalOpen(false)
      showToast(`Account created! Welcome, ${prof.displayName}.`)
    } catch (err: any) {
      const code = err?.code || ''
      if (code === 'auth/email-already-in-use') {
        setAuthError('This email is already in use. Please sign in instead.')
      } else if (code === 'auth/weak-password') {
        setAuthError('Password must be at least 6 characters long.')
      } else if (code === 'auth/invalid-email') {
        setAuthError('Please enter a valid email address.')
      } else if (code === 'auth/operation-not-allowed') {
        setAuthError('Email sign-up is disabled in Firebase console. Please click Continue with Google above!')
      } else {
        setAuthError(err?.message || 'Could not create account.')
      }
    } finally {
      setAuthLoading(false)
    }
  }

  // Handle Profile Update
  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault()
    if (!currentUser) return
    setAuthLoading(true)
    try {
      const updated: CustomerProfile = {
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: authName || customerProfile?.displayName || '',
        phone: authPhone || customerProfile?.phone || '',
        address: authAddress || customerProfile?.address || '',
        city: authCity || customerProfile?.city || 'Lusaka',
      }
      await syncUserProfile(updated)
      setCustomerProfile(updated)
      if (updated.address) setAddress(updated.address)
      if (updated.phone) setPhone(updated.phone)
      if (updated.city) setCity(updated.city)
      setAccountModalOpen(false)
      showToast('Profile updated successfully!')
    } catch {
      showToast('Could not save profile.')
    } finally {
      setAuthLoading(false)
    }
  }

  // Handle Admin Status update
  async function handleAdminOrderStatusChange(orderId: string, newStatus: string) {
    const res = await updateOrderStatus(orderId, newStatus)
    if (res.ok) {
      setAdminOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      )
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      )
      showToast(`Order status updated to "${newStatus}"`)
    } else {
      showToast('Failed to update order status.')
    }
  }

  // Handle Admin Price / Stock update
  async function handleSaveProductPrice(productId: string) {
    const num = parseFloat(editingPriceValue)
    if (isNaN(num) || num <= 0) {
      showToast('Please enter a valid price in Kwacha.')
      return
    }
    const targetProd = productsList.find((p) => p.id === productId)
    const avail = targetProd?.availability || 'available'
    const res = await updateProductPriceAndStock(productId, num, avail)
    if (res.ok) {
      setProductsList((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, price: num } : p)),
      )
      setEditingPriceId(null)
      showToast(`Price updated to K ${num.toFixed(2)} in Cloud SQL`)
    } else {
      showToast('Failed to update price.')
    }
  }

  async function handleToggleStock(productId: string) {
    const target = productsList.find((p) => p.id === productId)
    if (!target) return
    const nextAvail = target.availability === 'available' ? 'unavailable' : 'available'
    const res = await updateProductPriceAndStock(productId, target.price, nextAvail)
    if (res.ok) {
      setProductsList((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, availability: nextAvail } : p)),
      )
      showToast(`Product set to ${nextAvail === 'available' ? 'In Stock' : 'Out of Stock'}`)
    } else {
      showToast('Failed to toggle stock.')
    }
  }

  // Handle Admin Add Product
  async function handleCreateProduct(e: FormEvent) {
    e.preventDefault()
    const priceNum = parseFloat(newProdPrice)
    if (!newProdName || isNaN(priceNum) || priceNum <= 0) {
      showToast('Enter valid product name and price.')
      return
    }
    const res = await addNewSupermarketProduct({
      name: newProdName,
      brand: newProdBrand,
      categoryId: newProdCategory,
      packageSize: newProdSize,
      unitPrice: priceNum,
      imageUrl: newProdImg || undefined,
      description: newProdDesc,
    })
    if (res.ok && res.product) {
      const addedProd: Product = {
        id: res.product.id,
        sku: res.product.sku,
        slug: res.product.slug,
        name: res.product.name,
        brand: res.product.brand,
        size: res.product.packageSize,
        packVerified: true,
        price: res.product.unitPrice,
        priceStatus: 'verified',
        availability: 'available',
        category: newProdCategory,
        branchIds: branches.map((b) => b.id),
        image: res.product.imageUrl,
        imageAlt: res.product.name,
        imageSource: 'Shoprite Supermarket Inventory',
        description: res.product.description,
        productSource: 'Shoprite Zambia',
        isDemo: false,
      }
      setProductsList((prev) => [addedProd, ...prev])
      setNewProductModal(false)
      showToast(`${newProdName} added to catalogue!`)
    } else {
      showToast('Failed to add product.')
    }
  }

  function ProductCard({ product }: { product: Product }) {
    const quantity = cart[product.id] || 0
    const isAlcohol =
      product.category === 'Wines & Cellar' ||
      product.category === 'LiquorShop & Alcohol' ||
      product.sku.startsWith('ZM-WINE') ||
      product.sku.startsWith('ZM-ALC')

    return (
      <article className="product-card">
        <div className="product-image-wrap relative">
          <ProductPhoto className="product-image" product={product} />
          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
            <span className="demo-chip">{product.availability === 'available' ? 'IN STOCK' : 'OUT OF STOCK'}</span>
            {isAlcohol && (
              <span className="bg-amber-600 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded shadow-xs tracking-wider">
                18+ ONLY
              </span>
            )}
          </div>
        </div>
        <div className="product-info">
          <div className="flex items-center justify-between gap-1">
            <p className="eyebrow">{product.brand}</p>
            {isAlcohol && (
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                LiquorShop
              </span>
            )}
          </div>
          <h3>
            <Button variant="ghost" className="product-title-button" onClick={() => setSelectedProduct(product)}>
              {product.name}
            </Button>
          </h3>
          <p className="muted">
            {product.size}
            {!product.packVerified && ' · standard pack'}
          </p>
          <div className="stock-row">
            <span className={product.availability === 'available' ? 'stock' : 'muted text-red-600 font-semibold'}>
              {product.availability === 'available' ? '✓ In stock at branch' : '✕ Out of stock'}
            </span>
            <span className="muted font-mono text-[10px]">{product.sku}</span>
          </div>
          <strong className="price">K {product.price.toFixed(2)}</strong>
          <p className="price-note">
            {product.priceStatus === 'estimated'
              ? 'Zambian Kwacha (ZMW) · Supermarket price'
              : 'Verified Shoprite shelf price (ZMW)'}
          </p>
          {quantity ? (
            <div className="space-y-1.5">
              <div className="quantity-control" aria-label={`Quantity for ${product.name}`}>
                <Button variant="secondary" aria-label="Decrease quantity" onClick={() => updateCart(product.id, -1)}>
                  <Icon name="minus" size={16} />
                </Button>
                <span>{quantity}</span>
                <Button
                  variant="secondary"
                  aria-label="Increase quantity"
                  disabled={quantity >= MAX_QUANTITY}
                  onClick={() => updateCart(product.id, 1)}
                >
                  <Icon name="plus" size={16} />
                </Button>
              </div>
              <Button
                variant="secondary"
                className="full py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 flex items-center justify-center gap-1 shadow-2xs"
                onClick={() => navigate('checkout')}
              >
                <span>Proceed to Payment</span>
                <Icon name="arrow" size={13} />
              </Button>
            </div>
          ) : (
            <Button
              className="full"
              disabled={product.availability === 'unavailable'}
              onClick={() => {
                updateCart(product.id, 1)
                showToast(`${product.name} added to cart`)
              }}
            >
              {product.availability === 'unavailable' ? 'Unavailable' : 'Add to cart'}
            </Button>
          )}
          <Button variant="ghost" className="product-details-button" onClick={() => setSelectedProduct(product)}>
            Product details <Icon name="chevron" size={14} />
          </Button>
        </div>
      </article>
    )
  }

  function Header() {
    return (
      <>
        <div className="prototype-banner">
          SHOPRITE ZAMBIA DOORSTEP DELIVERY · NATIONWIDE SUPERMARKET SHOPPING · LUSAKA, COPPERBELT & LIVINGSTONE
        </div>
        <header className="header">
          <div className="header-inner">
            <button className="brand" onClick={() => navigate('home')} aria-label="Return home">
              <Image
                src={shopriteLogo}
                alt="Shoprite"
                width={56}
                height={56}
                className="size-14 shrink-0 object-contain max-sm:size-11"
              />
              <span>
                <b>SHOPRITE</b>
                <small>Zambia Online Supermarket</small>
              </span>
            </button>
            <button className="branch-button" onClick={() => setBranchOpen(true)} title="Click to choose Shoprite branch in Lusaka">
              <Icon name="store" />
              <span>
                <small className="flex items-center gap-1">
                  Shopping from <span className="text-[10px] text-emerald-600 font-bold">🔒 Locked</span>
                </small>
                <b>{selectedBranch?.name ?? 'Choose a branch'}</b>
              </span>
              <Icon name="chevron" size={16} />
            </button>

            <div className="desktop-search">
              <Icon name="search" />
              <Field
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => {
                  setSelectedProduct(null)
                  setView('catalogue')
                }}
                placeholder="Search groceries, produce, beverages & household..."
                aria-label="Search groceries"
              />
            </div>
            {/* Account Profile Trigger */}
            <Button
              variant="secondary"
              className="flex items-center gap-2 max-sm:hidden"
              onClick={() => {
                if (currentUser) {
                  setAuthName(customerProfile?.displayName || '')
                  setAuthPhone(customerProfile?.phone || '')
                  setAuthAddress(customerProfile?.address || '')
                  setAuthCity(customerProfile?.city || 'Lusaka')
                  setAccountTab('profile')
                } else {
                  setAccountTab('login')
                }
                setAccountModalOpen(true)
              }}
            >
              <Icon name="user" size={18} />
              <span className="desktop-only text-xs font-semibold">
                {currentUser ? (customerProfile?.displayName?.split(' ')[0] || 'My Account') : 'Sign In'}
              </span>
            </Button>
            <Button variant="secondary" className="cart-button" onClick={() => navigate('cart')}>
              <Icon name="cart" />
              <span className="desktop-only">Cart</span>
              <span className="cart-count">{cartCount}</span>
            </Button>
          </div>
        </header>
      </>
    )
  }

  function Home() {
    return (
      <>
        <section className="hero shell">
          <div className="hero-copy">
            <span className="pill">
              <Icon name="truck" size={16} /> Fast Doorstep Delivery Across Zambia
            </span>
            <h1>Groceries for home, without the extra trip.</h1>
            <p>
              Shop fresh produce, beverages, pantry staples, personal care and frozen foods from your nearest Shoprite
              supermarket. Enjoy safe delivery right to your gate in Lusaka, Kitwe, Ndola and beyond.
            </p>
            <div className="hero-actions">
              <Button onClick={() => navigate('catalogue')}>
                Start shopping <Icon name="arrow" />
              </Button>
              <Button variant="secondary" onClick={() => setBranchOpen(true)}>
                <Icon name="pin" /> Choose branch
              </Button>
            </div>
            <div className="trust-row">
              <span>
                <Icon name="shield" size={18} /> MTN & Airtel MoMo Supported
              </span>
              <span>
                <Icon name="store" size={18} /> 5 Major Zambian Branches
              </span>
              <span>
                <Icon name="clock" size={18} /> Flexible 60-90 Min Express Slots
              </span>
            </div>
          </div>
          <div className="hero-image">
            <Image
              src="/shoprite-grocery-hero.jpg"
              width={1000}
              height={1000}
              priority
              alt="Shopping trolley filled with packaged groceries"
            />
            <div className="hero-note">
              <b>Fresh & Packaged Supermarket Range</b>
              <span>Pantry staples, dairy, fresh butchery & cleaning care</span>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="section shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Browse the supermarket aisles</p>
              <h2>Shop by Category</h2>
            </div>
            <Button variant="ghost" onClick={() => navigate('catalogue')}>
              View all <Icon name="arrow" />
            </Button>
          </div>
          <div className="category-grid">
            {categories.map(([name, description], index) => (
              <button
                key={name}
                className="category-card"
                onClick={() => {
                  setCategory(name)
                  navigate('catalogue')
                }}
              >
                <span className="category-number">{String(index + 1).padStart(2, '0')}</span>
                <span>
                  <b>{name}</b>
                  <small>{description}</small>
                </span>
                <Icon name="chevron" />
              </button>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="section products-section">
          <div className="shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Everyday Essentials</p>
                <h2>Popular in {selectedBranch?.name}</h2>
                <p className="muted">Standard shelf prices in Zambian Kwacha (ZMW).</p>
              </div>
              <Button variant="ghost" onClick={() => navigate('catalogue')}>
                Shop all {productsList.length} items <Icon name="arrow" />
              </Button>
            </div>
            <div className="product-grid">
              {branchProducts.slice(0, 8).map((product) => (
                <Fragment key={product.id}>{ProductCard({ product })}</Fragment>
              ))}
            </div>
          </div>
        </section>

        <section className="delivery-strip shell">
          <div>
            <Icon name="pin" size={28} />
            <span>
              <b>Reliable doorstep delivery in Zambia</b>
              <small>Choose standard or 60-90 min express delivery at checkout.</small>
            </span>
          </div>
          <Button variant="secondary" onClick={() => navigate('catalogue')}>
            Build your basket
          </Button>
        </section>
      </>
    )
  }

  function Catalogue() {
    return (
      <main className="shell page">
        <div className="page-title">
          <p className="eyebrow">
            SUPERMARKET CATALOGUE · {branchProducts.length} PRODUCTS · {categories.length} DEPARTMENTS
          </p>
          <h1>Groceries & Household Essentials</h1>
          <p>
            Browse Zambian pantry staples, fresh dairy, meats, drinks, personal care and household cleaning brands
            including Spekko, Trade Kings, Zambeef, Dairy Gold, Bokomo, and Yalelo.
          </p>
        </div>
        <div className="mobile-search">
          <Icon name="search" />
          <Field
            id="mobile-product-search"
            aria-label="Search products"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search groceries..."
          />
        </div>
        <div className="catalogue-toolbar">
          <div className="filter-pills">
            {['All', ...categories.map(([name]) => name)].map((name) => (
              <button
                className={category === name ? 'filter active' : 'filter'}
                key={name}
                onClick={() => setCategory(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <span className="muted">{filtered.length} products found</span>
        </div>

        {(category === 'Wines & Cellar' || category === 'LiquorShop & Alcohol') && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-xs">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-200 font-extrabold text-amber-950 text-sm">
              18+
            </span>
            <div className="text-xs leading-relaxed">
              <strong className="block text-amber-950 font-semibold mb-0.5 text-sm">
                Shoprite LiquorShop Zambia · Age Restriction Notice
              </strong>
              In accordance with the Laws of Zambia (Liquor Licensing Act), alcoholic beverages are strictly not for sale to persons under the age of 18. Valid photo ID (NRC or Passport) will be requested upon doorstep delivery. Please enjoy responsibly.
            </div>
          </div>
        )}

        {filtered.length ? (
          <div className="product-grid catalogue-grid">
            {filtered.map((product) => (
              <Fragment key={product.id}>{ProductCard({ product })}</Fragment>
            ))}
          </div>
        ) : (
          <div className="empty">
            <Icon name="search" size={40} />
            <h2>No products found</h2>
            <p>Try searching another keyword or clearing category filters.</p>
            <Button
              variant="secondary"
              onClick={() => {
                setQuery('')
                setCategory('All')
              }}
            >
              Show all products
            </Button>
          </div>
        )}
      </main>
    )
  }

  function Cart() {
    return (
      <main className="shell page narrow">
        <div className="page-title">
          <p className="eyebrow">YOUR BASKET</p>
          <h1>Shopping Cart</h1>
          <p>
            {cartCount} {cartCount === 1 ? 'item' : 'items'} from {selectedBranch.name}
          </p>
        </div>
        {!cartItems.length ? (
          <div className="empty">
            <Icon name="cart" size={44} />
            <h2>Your cart is empty</h2>
            <p>Explore the catalogue and add supermarket staples to get started.</p>
            <Button onClick={() => navigate('catalogue')}>Browse groceries</Button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-list">
              {cartItems.map(({ product, quantity }) => (
                <article className="cart-item" key={product.id}>
                  <ProductPhoto product={product} />
                  <div>
                    <p className="eyebrow">{product.brand}</p>
                    <h3>{product.name}</h3>
                    <p className="muted">{product.size}</p>
                    <button
                      className="remove-link"
                      onClick={() =>
                        setCart((current) => {
                          const next = { ...current }
                          delete next[product.id]
                          return next
                        })
                      }
                    >
                      Remove
                    </button>
                  </div>
                  <div className="cart-item-end">
                    <strong>K {(Math.round(product.price * 100) * quantity / 100).toFixed(2)}</strong>
                    <div className="quantity-control">
                      <Button
                        variant="secondary"
                        aria-label={`Decrease ${product.name}`}
                        onClick={() => updateCart(product.id, -1)}
                      >
                        <Icon name="minus" size={15} />
                      </Button>
                      <span>{quantity}</span>
                      <Button
                        variant="secondary"
                        aria-label={`Increase ${product.name}`}
                        disabled={quantity >= MAX_QUANTITY}
                        onClick={() => updateCart(product.id, 1)}
                      >
                        <Icon name="plus" size={15} />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <aside className="summary-card">
              <h2>Order summary</h2>
              <div>
                <span>Items Subtotal ({cartCount} items)</span>
                <b>K {subtotal.toFixed(2)}</b>
              </div>
              <div>
                <span>Delivery Fee ({selectedBranch.name})</span>
                <b>K {baseDeliveryFee.toFixed(2)}</b>
              </div>
              <div className="summary-total">
                <span>Total Due</span>
                <strong>K {(subtotal + baseDeliveryFee).toFixed(2)}</strong>
              </div>
              <p>Prices and delivery fees in Zambian Kwacha (ZMW). Free in-store collection available.</p>
              <Button className="full" onClick={() => navigate('checkout')}>
                Proceed to Checkout <Icon name="arrow" />
              </Button>
            </aside>
          </div>
        )}
      </main>
    )
  }

  function Checkout() {
    async function placeOrder(event: FormEvent) {
      event.preventDefault()
      if (submittingRef.current) return
      submittingRef.current = true
      setSubmitting(true)
      setCheckoutError('')

      // Validate Mobile Money number if selected
      const cleanPhone = (paymentMethod === 'cash-demo' ? phone : momoNumber || phone).replace(/[\s()-]/g, '')
      if (!/^(?:\+260|0)[79]\d{8}$/.test(cleanPhone)) {
        setCheckoutError('Please enter a valid Zambian mobile number (e.g. +260 97 123 4567 or 096 123 4567).')
        submittingRef.current = false
        setSubmitting(false)
        return
      }

      try {
        const fullAddress = `${address.trim()}, ${city}`
        const result = await placeDemoOrder({
          branch,
          address: fullAddress,
          phone: cleanPhone,
          instructions,
          paymentMethod,
          deliverySlot,
          deliveryFee,
          userId: currentUser?.uid,
          items: cartItems.map(({ product, quantity }) => ({ product: product.id, quantity })),
        })

        if (!result.ok) {
          setCheckoutError(result.error)
          return
        }

        const orderSnapshot: DemoOrder = {
          id: result.receipt.id,
          reference: result.reference,
          createdAt: new Date().toISOString(),
          total: totalAmount,
          status: 'Order received',
          address: fullAddress,
          phone: cleanPhone,
          branchName: selectedBranch.name,
          paymentMethod,
          paymentRef: result.paymentRef,
          paymentStatus: result.paymentStatus,
          deliverySlot,
          items: cartItems.map(({ product, quantity }) => ({
            name: product.name,
            packageSize: product.size,
            quantity,
            unitPrice: product.price,
          })),
        }

        // Persist order in Firestore collection 'orders'
        try {
          await setDoc(doc(db, 'orders', result.receipt.id), {
            ...orderSnapshot,
            userId: currentUser?.uid || null,
            userEmail: currentUser?.email || null,
            branchId: branch,
            branchArea: selectedBranch.area,
            subtotal,
            deliveryFee,
            serverTimestamp: serverTimestamp(),
          })

          // Initialize real delivery tracking document in Firestore
          await setDoc(
            doc(db, 'deliveries', result.receipt.id),
            {
              orderId: result.receipt.id,
              orderRef: result.reference,
              status: 'packed',
              driverName: 'Gift Mwila',
              driverPhone: '+260 97 789 1234',
              driverVehicle: 'Shoprite Express Rider · BAE 3921',
              storeName: selectedBranch.name,
              storeAddress: selectedBranch.area,
              destinationAddress: fullAddress,
              destinationCity: city,
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          )
        } catch (err) {
          console.warn('Could not save order to Firestore:', err)
        }

        setConfirmedOrder(orderSnapshot)
        setOrders((prev) => [orderSnapshot, ...prev])
        setReceipts((current) => [result.receipt, ...current].slice(0, 30))
        setCart({})

        if (paymentMethod === 'momo-mtn' || paymentMethod === 'momo-airtel') {
          // Open authentic USSD Push status modal
          setUssdModal({
            open: true,
            orderRef: result.reference,
            paymentRef: result.paymentRef || 'REF-ZM-' + Math.floor(100000 + Math.random() * 900000),
            momoNetwork: paymentMethod === 'momo-mtn' ? 'MTN' : 'Airtel',
            phone: cleanPhone,
            total: totalAmount,
            status: 'Awaiting Mobile PIN Authorization',
          })
        } else {
          showToast(`Order ${result.reference} confirmed! Store: ${selectedBranch.name}`)
          navigate('confirmation')
        }
        router.refresh()
      } catch {
        setCheckoutError('Connection failed. Please check your network and try again.')
      } finally {
        submittingRef.current = false
        setSubmitting(false)
      }
    }


    if (!cartItems.length) return Cart()

    return (
      <main className="shell page narrow">
        <div className="page-title">
          <p className="eyebrow">ORDER CHECKOUT</p>
          <h1>Delivery & Payment</h1>
          <p>Complete your delivery address and choose your preferred Zambian payment method.</p>
        </div>

        {/* Logged in notification / prompt */}
        {!currentUser && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div>
              <strong>Have a customer account?</strong> Log in to use your saved delivery address and track all your orders.
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setAccountTab('login')
                setAccountModalOpen(true)
              }}
            >
              Sign In
            </Button>
          </div>
        )}

        <form className="checkout-layout" onSubmit={placeOrder}>
          <div className="form-card">
            {/* Step 1: Delivery Details */}
            <div className="step-title">
              <span>1</span>
              <div>
                <h2>Delivery Location & Contact</h2>
                <p>Deliveries are fulfilled directly from {selectedBranch.name}.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <label>
                City / Town
                <select className="field" value={city} onChange={(e) => setCity(e.target.value)}>
                  {ZAMBIAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Contact Mobile Number
                <Field
                  required
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+260 97 123 4567"
                />
              </label>
            </div>

            <label>
              Full Delivery Address (Street, Plot / House No., Area)
              <Field
                required
                minLength={6}
                maxLength={500}
                autoComplete="street-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="e.g. Plot 1420, Lukasu Road, Kabulonga"
              />
            </label>

            <label>
              Delivery Instructions for Driver
              <Field
                maxLength={500}
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                placeholder="Black gate next to corner shop, call on arrival, etc."
              />
            </label>

            {/* Step 2: Delivery Time Slot */}
            <div className="step-title top-gap">
              <span>2</span>
              <div>
                <h2>Choose Delivery Time Slot</h2>
                <p>Schedule your grocery drop-off at your convenience.</p>
              </div>
            </div>

            <div className="mt-3 grid gap-2">
              {DELIVERY_SLOTS.map((slot) => (
                <label
                  key={slot.id}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 text-xs transition ${
                    deliverySlot === slot.label ? 'border-brand-red bg-red-50/50 font-bold' : 'border-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliverySlot"
                      value={slot.label}
                      checked={deliverySlot === slot.label}
                      onChange={() => setDeliverySlot(slot.label)}
                      className="accent-brand-red"
                    />
                    <span>{slot.label}</span>
                  </div>
                  <span className="text-zinc-500">
                    {slot.feeExtra ? `+K ${slot.feeExtra.toFixed(2)}` : 'Standard fee'}
                  </span>
                </label>
              ))}
            </div>

            {/* Step 3: Payment Method */}
            <div className="step-title top-gap">
              <span>3</span>
              <div>
                <h2>Payment Method</h2>
                <p>Choose cash/card upon delivery or mobile money prompt.</p>
              </div>
            </div>

            <div className="mt-3 grid gap-2.5">
              <label
                className={`radio-card flex cursor-pointer gap-3 ${
                  paymentMethod === 'cash-demo' ? 'border-brand-red bg-red-50/40' : ''
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cash-demo"
                  checked={paymentMethod === 'cash-demo'}
                  onChange={() => setPaymentMethod('cash-demo')}
                />
                <div>
                  <b>Cash / Card on Delivery</b>
                  <small>Pay with cash or swipe your debit card on the delivery driver’s mobile POS terminal.</small>
                </div>
              </label>

              <label
                className={`radio-card flex cursor-pointer gap-3 ${
                  paymentMethod === 'momo-mtn' ? 'border-yellow-500 bg-yellow-50/30' : ''
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="momo-mtn"
                  checked={paymentMethod === 'momo-mtn'}
                  onChange={() => setPaymentMethod('momo-mtn')}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <b>MTN Mobile Money (MoMo)</b>
                    <span className="rounded bg-yellow-400 px-1.5 py-0.5 text-[10px] font-bold text-yellow-950">
                      MTN ZM
                    </span>
                  </div>
                  <small>Receive a USSD push notification on your MTN mobile number to authorize with your PIN.</small>
                  {paymentMethod === 'momo-mtn' && (
                    <div className="mt-3">
                      <Field
                        type="tel"
                        placeholder="Enter MTN number (e.g. 096... or 076...)"
                        value={momoNumber}
                        onChange={(e) => setMomoNumber(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>
              </label>

              <label
                className={`radio-card flex cursor-pointer gap-3 ${
                  paymentMethod === 'momo-airtel' ? 'border-red-600 bg-red-50/30' : ''
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="momo-airtel"
                  checked={paymentMethod === 'momo-airtel'}
                  onChange={() => setPaymentMethod('momo-airtel')}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <b>Airtel Money</b>
                    <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Airtel ZM
                    </span>
                  </div>
                  <small>Receive an Airtel Money prompt on your handset to authorize the grocery transaction.</small>
                  {paymentMethod === 'momo-airtel' && (
                    <div className="mt-3">
                      <Field
                        type="tel"
                        placeholder="Enter Airtel number (e.g. 097... or 077...)"
                        value={momoNumber}
                        onChange={(e) => setMomoNumber(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          <aside className="summary-card">
            <h2>Order Summary</h2>
            <div>
              <span>Items Subtotal ({cartCount} items)</span>
              <b>K {subtotal.toFixed(2)}</b>
            </div>
            <div>
              <span>Base Delivery Fee ({selectedBranch.name})</span>
              <b>K {baseDeliveryFee.toFixed(2)}</b>
            </div>
            {selectedSlotObj.feeExtra > 0 && (
              <div>
                <span>Express Surcharge</span>
                <b>K {selectedSlotObj.feeExtra.toFixed(2)}</b>
              </div>
            )}
            <div className="summary-total">
              <span>Total Amount</span>
              <strong>K {totalAmount.toFixed(2)}</strong>
            </div>

            <div className="my-2 rounded bg-zinc-50 p-2.5 text-[11px] text-zinc-600">
              <div className="font-semibold text-zinc-800">Selected Slot:</div>
              <div>{deliverySlot}</div>
            </div>

            {cartItems.some(
              (item) =>
                item.product.category === 'Wines & Cellar' ||
                item.product.category === 'LiquorShop & Alcohol' ||
                item.product.sku.startsWith('ZM-WINE') ||
                item.product.sku.startsWith('ZM-ALC'),
            ) && (
              <div className="my-3 rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <span className="rounded bg-amber-200 px-1 text-[10px]">18+</span>
                  <span>LiquorShop Age Verification</span>
                </div>
                <p className="mt-1 text-[11px] leading-tight text-amber-800">
                  By placing this order, you certify that you are 18 years of age or older in compliance with the Laws of Zambia. Valid ID will be verified upon delivery.
                </p>
              </div>
            )}

            {checkoutError && (
              <p role="alert" className="text-sm font-semibold text-brand-red">
                {checkoutError}
              </p>
            )}

            <Button type="submit" className="full" disabled={submitting}>
              {submitting ? 'Processing Order…' : 'Place Delivery Order'} <Icon name="arrow" />
            </Button>
          </aside>
        </form>
      </main>
    )
  }

  function Orders() {
    return (
      <main className="shell page narrow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="page-title mb-0">
            <p className="eyebrow">ORDER TRACKING & HISTORY</p>
            <h1>My Orders</h1>
            <p>Track your active grocery deliveries and review previous orders.</p>
          </div>
          <Button
            variant="secondary"
            onClick={async () => {
              try {
                setOrders(await readDemoOrders(receipts, currentUser?.uid))
                showToast('Orders refreshed')
              } catch {
                showToast('Could not refresh orders')
              }
            }}
          >
            <Icon name="refresh" size={16} /> Refresh Progress
          </Button>
        </div>

        {!orders.length && !legacyOrders.length ? (
          <div className="empty mt-8">
            <Icon name="receipt" size={44} />
            <h2>No orders placed yet</h2>
            <p>Your supermarket orders and live delivery statuses will appear here.</p>
            <Button onClick={() => navigate('catalogue')}>Start shopping</Button>
          </div>
        ) : (
          <div className="order-list mt-8">
            {orders.map((order) => {
              const statusStep =
                order.status === 'Delivered'
                  ? 4
                  : order.status === 'On the way'
                    ? 3
                    : order.status === 'Assigned to driver'
                      ? 2
                      : order.status === 'Preparing at branch'
                        ? 1
                        : 0

              return (
                <article className="order-card" key={order.id}>
                  <div className="order-head">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="eyebrow mb-0">{order.reference}</p>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            order.status === 'Delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'Cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold">{order.branchName}</h2>
                      <p className="muted text-xs">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <strong>K {order.total.toFixed(2)}</strong>
                      <p className="text-[11px] text-zinc-500">
                        {order.paymentMethod === 'momo-mtn'
                          ? 'MTN MoMo'
                          : order.paymentMethod === 'momo-airtel'
                            ? 'Airtel Money'
                            : 'Cash/Card on Delivery'}
                      </p>
                    </div>
                  </div>

                  {/* 5-step progress bar */}
                  <div className="progress grid-cols-5">
                    {['Received', 'Preparing', 'Driver Assigned', 'On The Way', 'Delivered'].map((label, index) => (
                      <span key={label} className={index <= statusStep ? 'done' : ''}>
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="order-meta">
                    <span>
                      <Icon name="store" size={16} /> {order.branchName}
                    </span>
                    <span>
                      <Icon name="pin" size={16} /> {order.address}
                    </span>
                    {order.deliverySlot && (
                      <span>
                        <Icon name="clock" size={16} /> {order.deliverySlot}
                      </span>
                    )}
                    {order.phone && (
                      <span>
                        <Icon name="phone" size={16} /> {order.phone}
                      </span>
                    )}
                    {order.paymentRef && (
                      <span>
                        <Icon name="shield" size={16} /> Ref: {order.paymentRef}
                      </span>
                    )}
                  </div>

                  {/* Items summary */}
                  <div className="mt-4 border-t pt-3">
                    <p className="mb-2 text-xs font-bold text-zinc-700">Order Items:</p>
                    <div className="grid gap-1.5 text-xs text-zinc-600">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>
                            {item.quantity}x {item.name} {item.packageSize && `(${item.packageSize})`}
                          </span>
                          <span className="font-mono">K {(item.unitPrice * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Real GPS Live Tracking Action */}
                  <div className="mt-3.5 flex items-center justify-between border-t pt-3">
                    <span className="text-[11px] text-zinc-500">
                      Fulfilled at <b>{order.branchName}</b>
                    </span>
                    <Button
                      variant="secondary"
                      className="flex items-center gap-1.5 text-xs font-bold"
                      onClick={() => setTrackingOrder(order)}
                    >
                      <span className="size-2 animate-ping rounded-full bg-emerald-500" />
                      <Icon name="truck" size={14} /> Track Live GPS
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {legacyOrders.length > 0 && (
          <section className="mt-8 space-y-3">
            <div role="heading" aria-level={2} className="font-display text-xl font-bold">
              Archived Browser Demonstrations
            </div>
            {legacyOrders.map((order, index) => (
              <article className="order-card" key={`${order.id}-${index}`}>
                <b>{order.id}</b>
                <p className="muted text-xs">
                  {new Date(order.createdAt).toLocaleString()} · K {order.total.toFixed(2)}
                </p>
              </article>
            ))}
          </section>
        )}
      </main>
    )
  }

  function Confirmation() {
    const order = confirmedOrder || orders[0]
    if (!order) {
      return (
        <main className="shell page narrow empty">
          <h2>No recent order to display</h2>
          <Button onClick={() => navigate('catalogue')}>Start Shopping</Button>
        </main>
      )
    }

    return (
      <main className="shell page narrow space-y-6">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <Icon name="check" size={28} />
          </div>
          <span className="pill mx-auto mb-2 bg-emerald-100 text-emerald-800">
            Order Confirmed & Locked to Branch
          </span>
          <h1 className="text-2xl font-black text-zinc-900">Thank You For Your Order!</h1>
          <p className="mt-1 text-xs text-zinc-600">
            Your supermarket grocery delivery has been placed and locked to the Shoprite fulfilment branch.
          </p>
          <div className="mt-3 inline-block rounded-lg bg-white px-3 py-1 font-mono text-xs font-bold text-zinc-800 border border-emerald-200">
            Order Reference: {order.reference}
          </div>
        </div>

        {/* Store Location Card - Clearly Stating Store Location */}
        <div className="rounded-2xl border-2 border-red-500 bg-red-50/50 p-5 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow">
              <Icon name="store" size={24} />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold tracking-wider text-red-700 uppercase">
                Fulfilment Store & Dispatch Branch (Locked to Order)
              </span>
              <h2 className="text-lg font-bold text-zinc-900">{order.branchName}</h2>
              <p className="text-xs text-zinc-700 font-medium">
                {selectedBranch?.area || 'Lusaka Central'}
              </p>
              <div className="mt-2.5 rounded-lg bg-white p-3 text-xs text-zinc-600 border border-red-100">
                <div className="font-semibold text-zinc-800">Store Fulfilment Notice:</div>
                <div>
                  This order is assembled, packed from temperature-controlled shelves, and dispatched directly from <b>{order.branchName}</b>.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live GPS Tracker Action Banner */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-900 p-4 text-white flex flex-wrap items-center justify-between gap-3 shadow">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 animate-ping rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                Real GPS Delivery Tracking Active
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-0.5">
              Follow your driver’s live vehicle movement from {order.branchName} to your gate.
            </p>
          </div>
          <Button
            className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold"
            onClick={() => setTrackingOrder(order)}
          >
            <Icon name="truck" size={16} /> Track Live GPS Delivery
          </Button>
        </div>

        {/* Order Details Breakdown */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 border-b pb-2">Order Summary</h3>
          <div className="grid grid-cols-2 gap-3 text-xs max-sm:grid-cols-1">
            <div>
              <span className="text-zinc-500">Delivery Address:</span>
              <p className="font-semibold text-zinc-800">{order.address}</p>
            </div>
            <div>
              <span className="text-zinc-500">Scheduled Time Slot:</span>
              <p className="font-semibold text-zinc-800">{order.deliverySlot || 'Standard Delivery'}</p>
            </div>
            <div>
              <span className="text-zinc-500">Contact Number:</span>
              <p className="font-semibold text-zinc-800">{order.phone}</p>
            </div>
            <div>
              <span className="text-zinc-500">Payment Method:</span>
              <p className="font-semibold text-zinc-800">
                {order.paymentMethod === 'momo-mtn' ? 'MTN Mobile Money' : order.paymentMethod === 'momo-airtel' ? 'Airtel Money' : 'Cash / Card on Delivery'}
              </p>
            </div>
          </div>

          <div className="border-t pt-3">
            <span className="text-xs font-bold text-zinc-700">Packed Supermarket Items ({order.items.length}):</span>
            <div className="mt-2 divide-y divide-zinc-100 text-xs text-zinc-600">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex justify-between py-1.5">
                  <span>
                    {it.quantity}x {it.name} {it.packageSize && `(${it.packageSize})`}
                  </span>
                  <span className="font-mono font-semibold">
                    K {(it.unitPrice * it.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between border-t pt-2 text-sm font-bold text-zinc-900">
              <span>Total Amount</span>
              <span className="font-mono text-base text-red-600 font-bold">K {order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Navigation options */}
        <div className="flex flex-wrap gap-3">
          <Button className="flex-1 justify-center" onClick={() => navigate('orders')}>
            View My Orders & History
          </Button>
          <Button variant="secondary" className="flex-1 justify-center" onClick={() => navigate('catalogue')}>
            Continue Shopping
          </Button>
        </div>
      </main>
    )
  }


  function Admin() {
    return (
      <main className="shell page">
        <div className="admin-header mb-6">
          <div className="page-title mb-0">
            <p className="eyebrow">SUPERMARKET OPERATIONS & DISPATCH</p>
            <h1>Admin Management Dashboard</h1>
            <p>
              Manage live customer orders, update delivery statuses, adjust product shelf prices, and toggle in-stock
              availability directly in Cloud SQL PostgreSQL.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setNewProductModal(true)}>
              <Icon name="plus" size={16} /> Add Product
            </Button>
            <Link href="/admin" className="button button-secondary">
              Payload CMS
            </Link>
          </div>
        </div>

        {/* Operational KPI summary */}
        <div className="stats-grid">
          <div>
            <small>Active Catalogue SKUs</small>
            <strong>{productsList.length}</strong>
          </div>
          <div>
            <small>Total Customer Orders</small>
            <strong>{adminOrders.length}</strong>
          </div>
          <div>
            <small>Orders Requiring Dispatch</small>
            <strong>{adminOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length}</strong>
          </div>
        </div>

        {/* Two-column Operations Grid */}
        <div className="admin-grid gap-6">
          {/* Order fulfillment management */}
          <section className="form-card">
            <div className="flex items-center justify-between border-b pb-3">
              <h2>Recent Customer Orders ({adminOrders.length})</h2>
              <Button
                variant="ghost"
                onClick={async () => {
                  setAdminOrders(await readAllAdminOrders())
                  showToast('Orders refreshed')
                }}
              >
                <Icon name="refresh" size={16} /> Refresh
              </Button>
            </div>

            {adminOrders.length ? (
              <div className="mt-3 divide-y divide-zinc-100">
                {adminOrders.map((order) => (
                  <div className="py-4" key={order.id}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-zinc-900">{order.reference}</span>
                        <span className="ml-2 text-xs text-zinc-500">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="text-xs text-zinc-600">
                          {order.branchName} · {order.items.length} items · <b>K {order.total.toFixed(2)}</b>
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {order.address} · {order.phone}
                        </div>
                      </div>

                      {/* Status Dropdown selector */}
                      <div className="flex items-center gap-2">
                        <select
                          className="field h-9 text-xs font-semibold"
                          value={order.status}
                          onChange={(e) => handleAdminOrderStatusChange(order.id, e.target.value)}
                        >
                          <option value="Order received">Order received</option>
                          <option value="Preparing at branch">Preparing at branch</option>
                          <option value="Assigned to driver">Assigned to driver</option>
                          <option value="On the way">On the way</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted py-8 text-center">No orders have been recorded yet.</p>
            )}
          </section>

          {/* Product Price & Stock Management */}
          <section className="form-card">
            <div className="flex items-center justify-between border-b pb-3">
              <h2>Supermarket Price & Stock Control</h2>
              <span className="text-xs text-zinc-500">{productsList.length} products</span>
            </div>

            <div className="mt-4 max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-zinc-400">
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Price (ZMW)</th>
                    <th className="pb-2">Availability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {productsList.map((product) => (
                    <tr key={product.id} className="hover:bg-zinc-50">
                      <td className="py-2.5 pr-2">
                        <div className="font-semibold text-zinc-900">{product.name}</div>
                        <div className="text-[10px] text-zinc-400">
                          {product.brand} · {product.sku}
                        </div>
                      </td>
                      <td className="py-2.5 pr-2">
                        {editingPriceId === product.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.5"
                              className="w-20 rounded border border-zinc-300 px-1 py-0.5 text-xs"
                              value={editingPriceValue}
                              onChange={(e) => setEditingPriceValue(e.target.value)}
                            />
                            <button
                              onClick={() => handleSaveProductPrice(product.id)}
                              className="rounded bg-brand-red px-2 py-1 text-[10px] font-bold text-white"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingPriceId(null)}
                              className="text-[10px] text-zinc-500 hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-zinc-800">K {product.price.toFixed(2)}</span>
                            <button
                              onClick={() => {
                                setEditingPriceId(product.id)
                                setEditingPriceValue(product.price.toString())
                              }}
                              className="text-zinc-400 hover:text-brand-red"
                              title="Edit Price"
                            >
                              <Icon name="edit" size={12} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5">
                        <button
                          onClick={() => handleToggleStock(product.id)}
                          className={`rounded px-2 py-1 text-[10px] font-bold transition ${
                            product.availability === 'available'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {product.availability === 'available' ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    )
  }

  const screens: Record<View, () => React.ReactNode> = {
    home: Home,
    catalogue: Catalogue,
    cart: Cart,
    checkout: Checkout,
    orders: Orders,
    admin: Admin,
    confirmation: Confirmation,
  }


  return (
    <div className="app">
      {Header()}

      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          quantity={cart[selectedProduct.id] || 0}
          onClose={() => setSelectedProduct(null)}
          onAdd={() => {
            updateCart(selectedProduct.id, 1)
            showToast(`${selectedProduct.name} added to cart`)
          }}
        />
      )}

      {selectedBranch ? (
        screens[view]()
      ) : (
        <div className="shell page empty">
          <p>No branches have been configured yet.</p>
        </div>
      )}

      <footer>
        <div className="shell footer-inner">
          <div className="brand footer-brand">
            <Image
              src={shopriteLogo}
              alt="Shoprite"
              width={56}
              height={56}
              className="size-14 shrink-0 object-contain max-sm:size-11"
            />
            <span>
              <b>SHOPRITE</b>
              <small>Zambia Online Supermarket</small>
            </span>
          </div>
          <p>
            Shoprite Zambia doorstep grocery delivery. Cairo Road, Manda Hill, Makeni, Kitwe & Ndola branches. All
            deliveries dispatched in temperature-controlled packaging.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('admin')}>
              Operations & Admin
            </Button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        {[
          ['home', 'home', 'Home'],
          ['catalogue', 'grid', 'Categories'],
          ['catalogue', 'search', 'Search'],
          ['orders', 'receipt', 'Orders'],
          ['admin', 'user', 'Operations'],
        ].map(([target, icon, label], index) => (
          <button
            key={`${label}-${index}`}
            className={view === target && !(target === 'catalogue' && index === 2) ? 'active' : ''}
            onClick={() => {
              navigate(target as View)
              if (label === 'Search') {
                requestAnimationFrame(() => document.getElementById('mobile-product-search')?.focus())
              }
            }}
          >
            <Icon name={icon as IconName} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Branch Selection Modal */}
      {branchOpen && (
        <div className="modal-backdrop" onClick={() => setBranchOpen(false)}>
          <section
            className="modal max-w-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="branch-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="eyebrow mb-0">LUSAKA STORE LOCATIONS</p>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                    Order Locked
                  </span>
                </div>
                <h2 id="branch-title">Choose your Shoprite branch in Lusaka</h2>
              </div>
              <Button variant="ghost" aria-label="Close" onClick={() => setBranchOpen(false)}>
                <Icon name="close" />
              </Button>
            </div>
            <p className="text-xs text-zinc-600">
              Select your nearest Lusaka branch. The chosen branch is locked to your order for shelf availability, packing, and doorstep dispatch.
            </p>

            {/* Branch Search Input */}
            <div className="my-3">
              <Field
                placeholder="Search Lusaka branches (e.g. Cairo Road, Manda Hill, Woodlands, Twin Palm, Chilenje)..."
                value={branchSearch}
                onChange={(e) => setBranchSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className="branch-list max-h-[380px] overflow-y-auto pr-1">
              {branches
                .filter(
                  (item) =>
                    !branchSearch ||
                    item.name.toLowerCase().includes(branchSearch.toLowerCase()) ||
                    item.area.toLowerCase().includes(branchSearch.toLowerCase()),
                )
                .map((item) => (
                  <button
                    className={branch === item.id ? 'branch-option selected' : 'branch-option'}
                    key={item.id}
                    onClick={() => {
                      setBranch(item.id)
                      try {
                        localStorage.setItem('shoprite-branch-v1', item.id)
                        localStorage.setItem('shoprite-locked-branch', item.id)
                      } catch {}
                      setCart((current) =>
                        normaliseCart(
                          current,
                          productsList.filter((product) => product.branchIds.includes(item.id)),
                        ),
                      )
                      setBranchOpen(false)
                      setBranchSearch('')
                      showToast(`Branch locked to order: Shopping from ${item.name}`)
                    }}
                  >
                    <Icon name="store" />
                    <span>
                      <b className="flex items-center gap-1.5">
                        {item.name}
                        {branch === item.id && (
                          <span className="text-[10px] font-bold text-emerald-600">✓ Locked</span>
                        )}
                      </b>
                      <small>
                        {item.area} · Standard delivery K {(item.deliveryFee ?? 35).toFixed(2)}
                      </small>
                    </span>
                    <span className="radio-dot" />
                  </button>
                ))}
            </div>
          </section>
        </div>
      )}


      {/* Customer Account / Auth Modal */}
      {accountModalOpen && (
        <div className="modal-backdrop" onClick={() => setAccountModalOpen(false)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">CUSTOMER ACCOUNT</p>
                <h2>{currentUser ? 'My Profile' : accountTab === 'login' ? 'Customer Sign In' : 'Create Account'}</h2>
              </div>
              <Button variant="ghost" aria-label="Close" onClick={() => setAccountModalOpen(false)}>
                <Icon name="close" />
              </Button>
            </div>

            {currentUser ? (
              <div className="mt-3">
                {/* Profile Subtabs */}
                <div className="flex border-b border-zinc-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setProfileSubTab('details')}
                    className={`px-4 py-2 font-bold transition border-b-2 ${
                      profileSubTab === 'details'
                        ? 'border-brand-red text-brand-red'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    Profile Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileSubTab('history')}
                    className={`flex items-center gap-1.5 px-4 py-2 font-bold transition border-b-2 ${
                      profileSubTab === 'history'
                        ? 'border-brand-red text-brand-red'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    <Icon name="receipt" size={14} />
                    Order History
                  </button>
                </div>

                {profileSubTab === 'history' ? (
                  <div className="mt-4">
                    <OrderHistorySection
                      userId={currentUser.uid}
                      userEmail={currentUser.email}
                      localOrders={orders}
                      onTrackOrder={(ord) => {
                        setAccountModalOpen(false)
                        setTrackingOrder(ord)
                      }}
                    />
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="mt-4 space-y-3">
                    <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">
                      <div>
                        Signed in as: <b className="text-zinc-900">{currentUser.email}</b>
                      </div>
                    </div>

                    <label className="block text-xs font-bold text-zinc-700">
                      Full Name
                      <Field
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g. Mwansa Banda"
                      />
                    </label>

                    <label className="block text-xs font-bold text-zinc-700">
                      Zambian Phone Number
                      <Field
                        type="tel"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        placeholder="+260 97 123 4567"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="block text-xs font-bold text-zinc-700">
                        City
                        <select
                          className="field"
                          value={authCity}
                          onChange={(e) => setAuthCity(e.target.value)}
                        >
                          {ZAMBIAN_CITIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-xs font-bold text-zinc-700">
                        Delivery Address
                        <Field
                          value={authAddress}
                          onChange={(e) => setAuthAddress(e.target.value)}
                          placeholder="Plot & Street"
                        />
                      </label>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button type="submit" className="flex-1" disabled={authLoading}>
                        {authLoading ? 'Saving…' : 'Save Profile'}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={async () => {
                          await signOut(auth)
                          setAccountModalOpen(false)
                          showToast('Signed out')
                        }}
                      >
                        <Icon name="logout" size={16} /> Sign Out
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            ) : accountTab === 'login' ? (

              <div className="mt-4 space-y-4">
                <Button variant="secondary" className="w-full justify-center gap-2" onClick={handleGoogleLogin}>
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative text-center text-xs text-zinc-400">
                  <span className="bg-white px-2">or with email</span>
                </div>

                <form onSubmit={handleEmailLogin} className="space-y-3">
                  <label className="block text-xs font-bold text-zinc-700">
                    Email Address
                    <Field
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="name@example.com"
                    />
                  </label>
                  <label className="block text-xs font-bold text-zinc-700">
                    Password
                    <Field
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </label>
                  {authError && <p className="text-xs font-bold text-brand-red">{authError}</p>}
                  <Button type="submit" className="w-full" disabled={authLoading}>
                    {authLoading ? 'Signing in…' : 'Sign In'}
                  </Button>
                </form>

                <p className="text-center text-xs text-zinc-500">
                  Don’t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError('')
                      setAccountTab('register')
                    }}
                    className="font-bold text-brand-red hover:underline"
                  >
                    Register here
                  </button>
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <form onSubmit={handleEmailRegister} className="space-y-3">
                  <label className="block text-xs font-bold text-zinc-700">
                    Full Name
                    <Field
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="e.g. Chileshe Mulenga"
                    />
                  </label>
                  <label className="block text-xs font-bold text-zinc-700">
                    Email Address
                    <Field
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="name@example.com"
                    />
                  </label>
                  <label className="block text-xs font-bold text-zinc-700">
                    Mobile Number
                    <Field
                      type="tel"
                      required
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="+260 97 123 4567"
                    />
                  </label>
                  <label className="block text-xs font-bold text-zinc-700">
                    Password
                    <Field
                      type="password"
                      required
                      minLength={6}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="At least 6 characters"
                    />
                  </label>
                  {authError && <p className="text-xs font-bold text-brand-red">{authError}</p>}
                  <Button type="submit" className="w-full" disabled={authLoading}>
                    {authLoading ? 'Creating Account…' : 'Register Customer Account'}
                  </Button>
                </form>
                <p className="text-center text-xs text-zinc-500">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError('')
                      setAccountTab('login')
                    }}
                    className="font-bold text-brand-red hover:underline"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* USSD Mobile Money Authorization Modal */}
      {ussdModal && (
        <div className="modal-backdrop">
          <section
            className="modal max-w-md"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div
                className={`mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl ${
                  ussdModal.momoNetwork === 'MTN' ? 'bg-yellow-400 text-yellow-950' : 'bg-red-600 text-white'
                }`}
              >
                <Icon name="phone" size={28} />
              </div>
              <p className="eyebrow mb-1">
                {ussdModal.momoNetwork === 'MTN' ? 'MTN MOBILE MONEY' : 'AIRTEL MONEY'} TRANSACTION
              </p>
              <h2 className="text-2xl font-bold">Awaiting USSD PIN</h2>
              <p className="mt-2 text-xs text-zinc-600">
                A payment prompt for <b>K {ussdModal.total.toFixed(2)}</b> was initiated to your phone{' '}
                <b className="font-mono text-zinc-900">{ussdModal.phone}</b>.
              </p>
            </div>

            <div className="my-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Shoprite Order Ref:</span>
                <span className="font-mono font-bold">{ussdModal.orderRef}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Provider Trans Ref:</span>
                <span className="font-mono font-bold">{ussdModal.paymentRef}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Payment Status:</span>
                <span className="flex items-center gap-1 font-semibold text-amber-700">
                  <span className="size-2 animate-ping rounded-full bg-amber-500" />
                  {ussdModal.status}
                </span>
              </div>
            </div>

            <div className="space-y-2 rounded-lg bg-amber-50 p-3 text-[11px] text-amber-900">
              <div className="font-bold">Instructions:</div>
              <ol className="list-decimal space-y-1 pl-4">
                <li>Check your phone screen for the {ussdModal.momoNetwork} prompt.</li>
                <li>Enter your 4-digit Mobile Money PIN to approve the transaction.</li>
                <li>You will receive an official SMS receipt from {ussdModal.momoNetwork}.</li>
              </ol>
            </div>

            <div className="mt-5 space-y-2">
              <Button
                variant="secondary"
                className="w-full justify-center gap-2 text-xs"
                onClick={() => {
                  showToast('Checking provider gateway... Awaiting PIN approval on your handset.')
                }}
              >
                <Icon name="refresh" size={14} /> Check Gateway Status
              </Button>
              <Button
                className="w-full justify-center text-xs"
                onClick={() => {
                  setUssdModal(null)
                  navigate('confirmation')
                  showToast('Your order has been recorded in the delivery queue.')
                }}
              >
                View Order Confirmation & Live GPS Tracking
              </Button>

            </div>
          </section>
        </div>
      )}

      {/* Admin Add Product Modal */}
      {newProductModal && (
        <div className="modal-backdrop" onClick={() => setNewProductModal(false)}>
          <section
            className="modal max-w-lg"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">INVENTORY CONTROL</p>
                <h2>Add Supermarket Product</h2>
              </div>
              <Button variant="ghost" onClick={() => setNewProductModal(false)}>
                <Icon name="close" />
              </Button>
            </div>

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-3">
              <label className="block text-xs font-bold text-zinc-700">
                Product Name
                <Field
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Pure Honey 500g"
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs font-bold text-zinc-700">
                  Brand
                  <Field
                    required
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    placeholder="Brand name"
                  />
                </label>
                <label className="block text-xs font-bold text-zinc-700">
                  Package Size
                  <Field
                    required
                    value={newProdSize}
                    onChange={(e) => setNewProdSize(e.target.value)}
                    placeholder="e.g. 500g, 1 L, 6 pack"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs font-bold text-zinc-700">
                  Category
                  <select
                    className="field"
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                  >
                    {data.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-bold text-zinc-700">
                  Price in Kwacha (ZMW)
                  <Field
                    type="number"
                    step="0.5"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="45.00"
                  />
                </label>
              </div>

              <label className="block text-xs font-bold text-zinc-700">
                Product Photo URL
                <Field
                  type="url"
                  value={newProdImg}
                  onChange={(e) => setNewProdImg(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </label>

              <label className="block text-xs font-bold text-zinc-700">
                Description
                <Field
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Product description and highlights"
                />
              </label>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">
                  Save Product to Cloud SQL
                </Button>
                <Button type="button" variant="secondary" onClick={() => setNewProductModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Real GPS Live Delivery Tracking Modal */}
      {trackingOrder && (
        <LiveDeliveryTracker
          order={trackingOrder}
          onClose={() => setTrackingOrder(null)}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}


export default ShopriteApp

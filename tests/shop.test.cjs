const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

function loadSource(path, dependencies = {}) {
  const source = fs.readFileSync(path, 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const module = { exports: {} }
  new Function('require', 'module', 'exports', compiled)(
    (name) => dependencies[name] ?? require(name), module, module.exports,
  )
  return module.exports
}

const { normaliseCart, filterProducts, cartSubtotal } = loadSource('src/lib/shop-cart.ts')
const products = [
  { id: 'rice', name: 'White Rice', brand: 'Sample', category: 'Groceries', sku: 'ZM-1', size: '2 kg', description: 'Dry long grain rice', branchIds: ['lusaka'], price: 74.99, availability: 'unverified' },
  { id: 'boom', name: 'Boom Sparkle Plus Lemon', brand: 'Boom', category: 'Cleaning', sku: 'ZM-2', size: '750 ml', description: 'Dishwashing liquid', branchIds: ['lusaka', 'makeni'], price: 37, availability: 'unverified' },
  { id: 'milk', name: 'Fresh Milk', brand: 'Sample', category: 'Dairy', sku: 'ZM-3', size: '1 L', description: 'Milk', branchIds: ['lusaka'], price: 48.99, availability: 'unavailable' },
]

test('search combines words, brand, size and category with branch eligibility', () => {
  assert.equal(filterProducts(products, '  boom   750 ', 'All', 'lusaka')[0].id, 'boom')
  assert.equal(filterProducts(products, 'grain', 'Groceries', 'lusaka')[0].id, 'rice')
  assert.equal(filterProducts(products, '', 'Dairy', 'makeni').length, 0)
  assert.equal(filterProducts(products, 'rice', 'Cleaning', 'lusaka').length, 0)
})

test('stored carts discard stale, unavailable and invalid entries and bound quantities', () => {
  assert.deepEqual(normaliseCart({ rice: 999, boom: 2, milk: 1, stale: 1 }, products), { rice: 20, boom: 2 })
  for (const invalid of [null, [], 'bad', { rice: -1 }, { rice: 1.2 }, { rice: '2' }]) {
    assert.deepEqual(normaliseCart(invalid, products), {})
  }
})

test('totals use integer cents', () => {
  assert.equal(cartSubtotal(products, { rice: 3, boom: 2 }), 298.97)
  assert.equal(cartSubtotal(products, {}), 0)
})

class APIError extends Error {}
const { Orders } = loadSource('src/collections/Orders.ts', {
  payload: { APIError },
  '@/lib/shop-access': { shopAdmin: () => true, shopAdminField: () => true },
})
const orderHook = Orders.hooks.beforeChange[0]

function request(overrides = {}) {
  return {
    user: null,
    context: {},
    payload: {
      findByID: async ({ collection, id, overrideAccess, req }) => {
        assert.equal(overrideAccess, false)
        assert(req, 'nested reads share the transaction/request')
        if (collection === 'branches') return { id, isDemo: true, deliveryEnabled: true, deliveryFee: 35, name: 'Lusaka — Demo', ...overrides.branch }
        return { id, name: 'Rice', packageSize: '2 kg', unitPrice: 74.99, active: true, isDemo: true, availability: 'unverified', branches: ['lusaka'], ...overrides.product }
      },
    },
  }
}
function orderData(overrides = {}) {
  return {
    branch: 'lusaka', address: 'Demonstration address only, Lusaka', phone: '+260971234567',
    paymentMethod: 'cash-demo', receiptHash: 'a'.repeat(64),
    items: [{ product: 'rice', quantity: 2, unitPrice: 0, name: 'Tampered' }],
    total: 0, reference: 'TAMPERED', status: 'Delivered', ...overrides,
  }
}

test('checkout recalculates immutable line snapshots, totals, status and reference', async () => {
  const saved = await orderHook({ data: orderData(), operation: 'create', req: request() })
  assert.equal(saved.total, 184.98)
  assert.equal(saved.subtotal, 149.98)
  assert.equal(saved.items[0].unitPrice, 74.99)
  assert.equal(saved.items[0].name, 'Rice')
  assert.equal(saved.status, 'Order received')
  assert.match(saved.reference, /^SR-DEMO-/)
  assert.equal(saved.branchName, 'Lusaka — Demo')
})

test('checkout rejects ineligible branches and products at the collection boundary', async () => {
  for (const overrides of [
    { branch: { isDemo: false } }, { branch: { deliveryEnabled: false } },
    { product: { isDemo: false } }, { product: { active: false } },
    { product: { availability: 'unavailable' } }, { product: { branches: ['other'] } },
  ]) {
    await assert.rejects(orderHook({ data: orderData(), operation: 'create', req: request(overrides) }))
  }
})

test('checkout rejects duplicate lines, invalid quantities, phone and payment', async () => {
  for (const data of [
    orderData({ items: [{ product: 'rice', quantity: 1 }, { product: 'rice', quantity: 2 }] }),
    ...[0, 21, 1.5].map((quantity) => orderData({ items: [{ product: 'rice', quantity }] })),
    orderData({ phone: '1234' }), orderData({ address: 'short' }),
    orderData({ paymentMethod: 'mobile' }), orderData({ receiptHash: 'bad' }),
  ]) {
    await assert.rejects(orderHook({ data, operation: 'create', req: request() }))
  }
})

test('private orders cannot be anonymously listed or created outside checkout', () => {
  assert.equal(Orders.access.read({ req: { user: null, context: {} } }), false)
  assert.equal(Orders.access.create({ req: { user: null, context: {} } }), false)
  assert.equal(Orders.access.create({ req: { user: null, context: { demoCheckout: true } } }), true)
  assert.deepEqual(Orders.access.read({ req: { user: null, context: { receiptHash: 'hash' } } }), { receiptHash: { equals: 'hash' } })
})

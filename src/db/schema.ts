import { relations } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  uid: text('uid').primaryKey(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const branches = pgTable('branches', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  area: text('area').notNull(),
  deliveryFee: doublePrecision('delivery_fee').notNull().default(35),
  deliveryEnabled: boolean('delivery_enabled').notNull().default(true),
  isDemo: boolean('is_demo').notNull().default(true),
  notice: text('notice'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  legacyId: integer('legacy_id'),
  sku: text('sku').notNull().unique(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  manufacturer: text('manufacturer'),
  categoryId: text('category_id').references(() => categories.id),
  branchIds: text('branch_ids').array().notNull(),
  packageSize: text('package_size').notNull(),
  packVerification: text('pack_verification').notNull().default('sample'),
  unitPrice: doublePrecision('unit_price').notNull(),
  priceStatus: text('price_status').notNull().default('estimated'),
  availability: text('availability').notNull().default('available'),
  imageUrl: text('image_url'),
  imageAlt: text('image_alt'),
  description: text('description').notNull(),
  productSource: text('product_source'),
  active: boolean('active').notNull().default(true),
  isDemo: boolean('is_demo').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  reference: text('reference').notNull().unique(),
  branchId: text('branch_id').references(() => branches.id),
  branchName: text('branch_name').notNull(),
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  instructions: text('instructions'),
  paymentMethod: text('payment_method').notNull().default('cash-demo'),
  paymentRef: text('payment_ref'),
  paymentStatus: text('payment_status').notNull().default('pending'),
  deliverySlot: text('delivery_slot'),
  receiptHash: text('receipt_hash').notNull(),
  status: text('status').notNull().default('Order received'),
  subtotal: doublePrecision('subtotal').notNull().default(0),
  deliveryFee: doublePrecision('delivery_fee').notNull().default(0),
  total: doublePrecision('total').notNull().default(0),
  items: jsonb('items').notNull(),
  isDemo: boolean('is_demo').notNull().default(true),
  userId: text('user_id').references(() => users.uid),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const branchesRelations = relations(branches, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  branch: one(branches, {
    fields: [orders.branchId],
    references: [branches.id],
  }),
  user: one(users, {
    fields: [orders.userId],
    references: [users.uid],
  }),
}));

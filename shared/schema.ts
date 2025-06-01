import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isSeller: boolean("is_seller").default(false),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Seller profiles
export const sellers = pgTable("sellers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  businessName: varchar("business_name").notNull(),
  businessType: varchar("business_type").notNull().default("grocery"),
  description: text("description"),
  businessAddress: text("business_address").notNull(),
  city: varchar("city").notNull(),
  pincode: varchar("pincode").notNull(),
  businessPhone: varchar("business_phone").notNull(),
  gstNumber: varchar("gst_number"),
  bankAccountNumber: varchar("bank_account_number"),
  ifscCode: varchar("ifsc_code"),
  approvalStatus: varchar("approval_status").notNull().default("pending"), // pending, approved, rejected
  isVerified: boolean("is_verified").default(false),
  rejectionReason: text("rejection_reason"),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  deliveryRadius: integer("delivery_radius").default(5), // km radius for delivery
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalSales: decimal("total_sales", { precision: 12, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service providers (separate from product sellers)
export const serviceProviders = pgTable("service_providers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  businessName: varchar("business_name").notNull(),
  serviceType: varchar("service_type").notNull(), // electrician, plumber, etc.
  description: text("description"),
  serviceAddress: text("service_address").notNull(),
  city: varchar("city").notNull(),
  pincode: varchar("pincode").notNull(),
  phone: varchar("phone").notNull(),
  experience: varchar("experience"), // years of experience
  certification: varchar("certification"), // any certifications
  serviceRadius: integer("service_radius").default(10), // km radius for service
  isVerified: boolean("is_verified").default(false),
  isAvailable: boolean("is_available").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalJobs: integer("total_jobs").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service bookings
export const serviceBookings = pgTable("service_bookings", {
  id: serial("id").primaryKey(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  serviceProviderId: integer("service_provider_id").references(() => serviceProviders.id).notNull(),
  serviceType: varchar("service_type").notNull(),
  description: text("description").notNull(),
  customerAddress: text("customer_address").notNull(),
  customerPhone: varchar("customer_phone").notNull(),
  preferredTime: timestamp("preferred_time"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  status: varchar("status").notNull().default("pending"), // pending, accepted, in_progress, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Food vendors (local food and snacks providers)
export const foodVendors = pgTable("food_vendors", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  vendorName: varchar("vendor_name").notNull(),
  vendorType: varchar("vendor_type").notNull(), // snacks, meals, sweets, drinks
  description: text("description"),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  pincode: varchar("pincode").notNull(),
  phone: varchar("phone").notNull(),
  openingTime: varchar("opening_time"), // "06:00"
  closingTime: varchar("closing_time"), // "22:00"
  specialTimings: text("special_timings"), // JSON for different timings for different items
  isVerified: boolean("is_verified").default(false),
  isOpen: boolean("is_open").default(true),
  deliveryRadius: integer("delivery_radius").default(3), // km radius for delivery
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalOrders: integer("total_orders").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Food items with timing and availability
export const foodItems = pgTable("food_items", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => foodVendors.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  availableTimings: varchar("available_timings").notNull(), // "morning,lunch,evening,dinner"
  preparationTime: integer("preparation_time").default(15), // minutes
  isAvailable: boolean("is_available").default(true),
  dailyLimit: integer("daily_limit"), // max items per day
  currentStock: integer("current_stock").default(0),
  images: text("images").array(),
  approvalStatus: varchar("approval_status").notNull().default("pending"), // pending, approved, rejected
  rejectionReason: text("rejection_reason"),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Food orders
export const foodOrders = pgTable("food_orders", {
  id: serial("id").primaryKey(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  vendorId: integer("vendor_id").references(() => foodVendors.id).notNull(),
  foodItemId: integer("food_item_id").references(() => foodItems.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  customerAddress: text("customer_address").notNull(),
  customerPhone: varchar("customer_phone").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, accepted, preparing, ready, delivered
  estimatedDeliveryTime: timestamp("estimated_delivery_time"),
  actualDeliveryTime: timestamp("actual_delivery_time"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Delivery Boys
export const deliveryBoys = pgTable("delivery_boys", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  name: varchar("name").notNull(),
  phone: varchar("phone").notNull().unique(),
  email: varchar("email").unique(),
  vehicleType: varchar("vehicle_type").notNull(), // bike, bicycle, car
  vehicleNumber: varchar("vehicle_number").notNull(),
  licenseNumber: varchar("license_number"),
  aadharNumber: varchar("aadhar_number").notNull(),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  pincode: varchar("pincode").notNull(),
  emergencyContact: varchar("emergency_contact").notNull(),
  profileImage: varchar("profile_image"),
  isActive: boolean("is_active").default(true),
  isAvailable: boolean("is_available").default(true),
  currentLocation: jsonb("current_location"), // { lat, lng, timestamp }
  totalDeliveries: integer("total_deliveries").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  earnings: decimal("earnings", { precision: 10, scale: 2 }).default("0.00"),
  approvalStatus: varchar("approval_status").notNull().default("pending"), // pending, approved, rejected
  rejectionReason: text("rejection_reason"),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Delivery Assignments
export const deliveryAssignments = pgTable("delivery_assignments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  foodOrderId: integer("food_order_id").references(() => foodOrders.id),
  serviceBookingId: integer("service_booking_id").references(() => serviceBookings.id),
  deliveryBoyId: integer("delivery_boy_id").references(() => deliveryBoys.id).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  pickedUpAt: timestamp("picked_up_at"),
  onTheWayAt: timestamp("on_the_way_at"),
  deliveredAt: timestamp("delivered_at"),
  status: varchar("status").notNull().default("assigned"), // assigned, accepted, picked_up, on_the_way, delivered, cancelled
  pickupAddress: text("pickup_address").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  customerPhone: varchar("customer_phone").notNull(),
  deliveryInstructions: text("delivery_instructions"),
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).notNull(),
  distance: decimal("distance", { precision: 5, scale: 2 }), // in km
  estimatedTime: integer("estimated_time"), // in minutes
  actualDeliveryTime: integer("actual_delivery_time"), // in minutes
  customerRating: integer("customer_rating"), // 1-5
  customerFeedback: text("customer_feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").references(() => sellers.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  sku: varchar("sku").unique(),
  stock: integer("stock").default(0),
  images: text("images").array(),
  approvalStatus: varchar("approval_status").notNull().default("pending"), // pending, approved, rejected
  rejectionReason: text("rejection_reason"),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  isActive: boolean("is_active").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  orderNumber: varchar("order_number").notNull().unique(),
  status: varchar("status").notNull().default("pending"), // pending, confirmed, shipped, delivered, cancelled
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method").notNull(),
  paymentStatus: varchar("payment_status").notNull().default("pending"), // pending, completed, failed
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  shippingAddress: jsonb("shipping_address").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  sellerId: integer("seller_id").references(() => sellers.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cart items
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  seller: one(sellers, {
    fields: [users.id],
    references: [sellers.userId],
  }),
  deliveryBoy: one(deliveryBoys, {
    fields: [users.id],
    references: [deliveryBoys.userId],
  }),
  orders: many(orders),
  cartItems: many(cartItems),
}));

export const sellersRelations = relations(sellers, ({ one, many }) => ({
  user: one(users, {
    fields: [sellers.userId],
    references: [users.id],
  }),
  products: many(products),
  orderItems: many(orderItems),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  seller: one(sellers, {
    fields: [products.sellerId],
    references: [sellers.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
  cartItems: many(cartItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  seller: one(sellers, {
    fields: [orderItems.sellerId],
    references: [sellers.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const serviceProvidersRelations = relations(serviceProviders, ({ one, many }) => ({
  user: one(users, {
    fields: [serviceProviders.userId],
    references: [users.id],
  }),
  serviceBookings: many(serviceBookings),
}));

export const serviceBookingsRelations = relations(serviceBookings, ({ one }) => ({
  customer: one(users, {
    fields: [serviceBookings.customerId],
    references: [users.id],
  }),
  serviceProvider: one(serviceProviders, {
    fields: [serviceBookings.serviceProviderId],
    references: [serviceProviders.id],
  }),
}));

export const foodVendorsRelations = relations(foodVendors, ({ one, many }) => ({
  user: one(users, {
    fields: [foodVendors.userId],
    references: [users.id],
  }),
  foodItems: many(foodItems),
  foodOrders: many(foodOrders),
}));

export const foodItemsRelations = relations(foodItems, ({ one, many }) => ({
  vendor: one(foodVendors, {
    fields: [foodItems.vendorId],
    references: [foodVendors.id],
  }),
  category: one(categories, {
    fields: [foodItems.categoryId],
    references: [categories.id],
  }),
  foodOrders: many(foodOrders),
}));

export const foodOrdersRelations = relations(foodOrders, ({ one }) => ({
  customer: one(users, {
    fields: [foodOrders.customerId],
    references: [users.id],
  }),
  vendor: one(foodVendors, {
    fields: [foodOrders.vendorId],
    references: [foodVendors.id],
  }),
  foodItem: one(foodItems, {
    fields: [foodOrders.foodItemId],
    references: [foodItems.id],
  }),
}));

export const deliveryBoysRelations = relations(deliveryBoys, ({ one, many }) => ({
  user: one(users, {
    fields: [deliveryBoys.userId],
    references: [users.id],
  }),
  deliveryAssignments: many(deliveryAssignments),
}));

export const deliveryAssignmentsRelations = relations(deliveryAssignments, ({ one }) => ({
  deliveryBoy: one(deliveryBoys, {
    fields: [deliveryAssignments.deliveryBoyId],
    references: [deliveryBoys.id],
  }),
  order: one(orders, {
    fields: [deliveryAssignments.orderId],
    references: [orders.id],
  }),
  foodOrder: one(foodOrders, {
    fields: [deliveryAssignments.foodOrderId],
    references: [foodOrders.id],
  }),
  serviceBooking: one(serviceBookings, {
    fields: [deliveryAssignments.serviceBookingId],
    references: [serviceBookings.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertSellerSchema = createInsertSchema(sellers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true, createdAt: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertServiceProviderSchema = createInsertSchema(serviceProviders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertServiceBookingSchema = createInsertSchema(serviceBookings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFoodVendorSchema = createInsertSchema(foodVendors).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFoodItemSchema = createInsertSchema(foodItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFoodOrderSchema = createInsertSchema(foodOrders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDeliveryBoySchema = createInsertSchema(deliveryBoys).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDeliveryAssignmentSchema = createInsertSchema(deliveryAssignments).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSeller = z.infer<typeof insertSellerSchema>;
export type Seller = typeof sellers.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;
export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceBooking = z.infer<typeof insertServiceBookingSchema>;
export type ServiceBooking = typeof serviceBookings.$inferSelect;
export type InsertFoodVendor = z.infer<typeof insertFoodVendorSchema>;
export type FoodVendor = typeof foodVendors.$inferSelect;
z.infer<typeof insertFoodOrderSchema>;
export type FoodOrder = typeof foodOrders.$inferSelect;
export type InsertDeliveryBoy = z.infer<typeof insertDeliveryBoySchema>;
export type DeliveryBoy = typeof deliveryBoys.$inferSelect;
export type InsertDeliveryAssignment = z.infer<typeof insertDeliveryAssignmentSchema>;
export type DeliveryAssignment = typeof deliveryAssignments.$inferSelect;

// Extended types for API responses
export type ProductWithSeller = Product & {
  seller: Seller & { user: User };
  category: Category;
};

export type CartItemWithProduct = CartItem & {
  product: ProductWithSeller;
};

export type OrderWithItems = Order & {
  orderItems: (OrderItem & {
    product: Product;
    seller: Seller;
  })[];
};

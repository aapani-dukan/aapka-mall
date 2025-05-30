import {
  users,
  sellers,
  categories,
  products,
  orders,
  orderItems,
  cartItems,
  type User,
  type UpsertUser,
  type InsertSeller,
  type Seller,
  type InsertCategory,
  type Category,
  type InsertProduct,
  type Product,
  type ProductWithSeller,
  type InsertOrder,
  type Order,
  type InsertOrderItem,
  type OrderItem,
  type InsertCartItem,
  type CartItem,
  type CartItemWithProduct,
  type OrderWithItems,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Seller operations
  createSeller(seller: InsertSeller): Promise<Seller>;
  getSellerByUserId(userId: string): Promise<Seller | undefined>;
  updateSeller(id: number, data: Partial<InsertSeller>): Promise<Seller>;
  getSellerById(id: number): Promise<Seller | undefined>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  getCategoryById(id: number): Promise<Category | undefined>;
  
  // Product operations
  getProducts(filters?: { categoryId?: number; sellerId?: number; search?: string }): Promise<ProductWithSeller[]>;
  getProductById(id: number): Promise<ProductWithSeller | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  
  // Cart operations
  getCartItems(userId: string): Promise<CartItemWithProduct[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]>;
  getOrderById(id: number): Promise<OrderWithItems | undefined>;
  getOrdersByUserId(userId: string): Promise<Order[]>;
  getOrdersBySellerId(sellerId: number): Promise<OrderWithItems[]>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  updateOrderPaymentStatus(id: number, status: string, paymentIntentId?: string): Promise<Order>;
  
  // Admin operations
  getPendingVendors(): Promise<Seller[]>;
  getPendingProducts(): Promise<ProductWithSeller[]>;
  getPendingFoodItems(): Promise<any[]>;
  approveVendor(vendorId: number, adminId: string): Promise<Seller>;
  rejectVendor(vendorId: number, reason: string, adminId: string): Promise<Seller>;
  approveProduct(productId: number, adminId: string): Promise<Product>;
  rejectProduct(productId: number, reason: string, adminId: string): Promise<Product>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Seller operations
  async createSeller(seller: InsertSeller): Promise<Seller> {
    const [newSeller] = await db.insert(sellers).values(seller).returning();
    
    // Update user to mark as seller
    await db.update(users).set({ isSeller: true }).where(eq(users.id, seller.userId));
    
    return newSeller;
  }

  async getSellerByUserId(userId: string): Promise<Seller | undefined> {
    const [seller] = await db.select().from(sellers).where(eq(sellers.userId, userId));
    return seller;
  }

  async updateSeller(id: number, data: Partial<InsertSeller>): Promise<Seller> {
    const [seller] = await db
      .update(sellers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sellers.id, id))
      .returning();
    return seller;
  }

  async getSellerById(id: number): Promise<Seller | undefined> {
    const [seller] = await db.select().from(sellers).where(eq(sellers.id, id));
    return seller;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.name));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  // Product operations
  async getProducts(filters?: { categoryId?: number; sellerId?: number; search?: string }): Promise<ProductWithSeller[]> {
    let query = db
      .select({
        id: products.id,
        sellerId: products.sellerId,
        categoryId: products.categoryId,
        name: products.name,
        description: products.description,
        price: products.price,
        originalPrice: products.originalPrice,
        sku: products.sku,
        stock: products.stock,
        images: products.images,
        isActive: products.isActive,
        rating: products.rating,
        reviewCount: products.reviewCount,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        seller: {
          id: sellers.id,
          userId: sellers.userId,
          businessName: sellers.businessName,
          description: sellers.description,
          businessAddress: sellers.businessAddress,
          businessPhone: sellers.businessPhone,
          gstNumber: sellers.gstNumber,
          bankAccountNumber: sellers.bankAccountNumber,
          ifscCode: sellers.ifscCode,
          isVerified: sellers.isVerified,
          rating: sellers.rating,
          totalSales: sellers.totalSales,
          createdAt: sellers.createdAt,
          updatedAt: sellers.updatedAt,
          user: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
            isSeller: users.isSeller,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
          },
        },
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          imageUrl: categories.imageUrl,
          isActive: categories.isActive,
          createdAt: categories.createdAt,
        },
      })
      .from(products)
      .innerJoin(sellers, eq(products.sellerId, sellers.id))
      .innerJoin(users, eq(sellers.userId, users.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.isActive, true));

    if (filters?.categoryId) {
      query = query.where(and(eq(products.isActive, true), eq(products.categoryId, filters.categoryId)));
    }

    if (filters?.sellerId) {
      query = query.where(and(eq(products.isActive, true), eq(products.sellerId, filters.sellerId)));
    }

    if (filters?.search) {
      query = query.where(
        and(
          eq(products.isActive, true),
          like(products.name, `%${filters.search}%`)
        )
      );
    }

    return await query.orderBy(desc(products.createdAt));
  }

  async getProductById(id: number): Promise<ProductWithSeller | undefined> {
    const [product] = await db
      .select({
        id: products.id,
        sellerId: products.sellerId,
        categoryId: products.categoryId,
        name: products.name,
        description: products.description,
        price: products.price,
        originalPrice: products.originalPrice,
        sku: products.sku,
        stock: products.stock,
        images: products.images,
        isActive: products.isActive,
        rating: products.rating,
        reviewCount: products.reviewCount,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        seller: {
          id: sellers.id,
          userId: sellers.userId,
          businessName: sellers.businessName,
          description: sellers.description,
          businessAddress: sellers.businessAddress,
          businessPhone: sellers.businessPhone,
          gstNumber: sellers.gstNumber,
          bankAccountNumber: sellers.bankAccountNumber,
          ifscCode: sellers.ifscCode,
          isVerified: sellers.isVerified,
          rating: sellers.rating,
          totalSales: sellers.totalSales,
          createdAt: sellers.createdAt,
          updatedAt: sellers.updatedAt,
          user: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
            isSeller: users.isSeller,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
          },
        },
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          imageUrl: categories.imageUrl,
          isActive: categories.isActive,
          createdAt: categories.createdAt,
        },
      })
      .from(products)
      .innerJoin(sellers, eq(products.sellerId, sellers.id))
      .innerJoin(users, eq(sellers.userId, users.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id));

    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  }

  // Cart operations
  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    return await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        updatedAt: cartItems.updatedAt,
        product: {
          id: products.id,
          sellerId: products.sellerId,
          categoryId: products.categoryId,
          name: products.name,
          description: products.description,
          price: products.price,
          originalPrice: products.originalPrice,
          sku: products.sku,
          stock: products.stock,
          images: products.images,
          isActive: products.isActive,
          rating: products.rating,
          reviewCount: products.reviewCount,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          seller: {
            id: sellers.id,
            userId: sellers.userId,
            businessName: sellers.businessName,
            description: sellers.description,
            businessAddress: sellers.businessAddress,
            businessPhone: sellers.businessPhone,
            gstNumber: sellers.gstNumber,
            bankAccountNumber: sellers.bankAccountNumber,
            ifscCode: sellers.ifscCode,
            isVerified: sellers.isVerified,
            rating: sellers.rating,
            totalSales: sellers.totalSales,
            createdAt: sellers.createdAt,
            updatedAt: sellers.updatedAt,
            user: {
              id: users.id,
              email: users.email,
              firstName: users.firstName,
              lastName: users.lastName,
              profileImageUrl: users.profileImageUrl,
              isSeller: users.isSeller,
              createdAt: users.createdAt,
              updatedAt: users.updatedAt,
            },
          },
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            description: categories.description,
            imageUrl: categories.imageUrl,
            isActive: categories.isActive,
            createdAt: categories.createdAt,
          },
        },
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .innerJoin(sellers, eq(products.sellerId, sellers.id))
      .innerJoin(users, eq(sellers.userId, users.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(cartItems.userId, userId));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, item.userId), eq(cartItems.productId, item.productId)));

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ 
          quantity: existingItem.quantity + item.quantity,
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Create new cart item
      const [newItem] = await db.insert(cartItems).values(item).returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [item] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, id))
      .returning();
    return item;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]> {
    return await db.insert(orderItems).values(items).returning();
  }

  async getOrderById(id: number): Promise<OrderWithItems | undefined> {
    const [order] = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        orderNumber: orders.orderNumber,
        status: orders.status,
        subtotal: orders.subtotal,
        tax: orders.tax,
        shipping: orders.shipping,
        total: orders.total,
        paymentMethod: orders.paymentMethod,
        paymentStatus: orders.paymentStatus,
        stripePaymentIntentId: orders.stripePaymentIntentId,
        shippingAddress: orders.shippingAddress,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .where(eq(orders.id, id));

    if (!order) return undefined;

    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        sellerId: orderItems.sellerId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        total: orderItems.total,
        createdAt: orderItems.createdAt,
        product: {
          id: products.id,
          sellerId: products.sellerId,
          categoryId: products.categoryId,
          name: products.name,
          description: products.description,
          price: products.price,
          originalPrice: products.originalPrice,
          sku: products.sku,
          stock: products.stock,
          images: products.images,
          isActive: products.isActive,
          rating: products.rating,
          reviewCount: products.reviewCount,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        },
        seller: {
          id: sellers.id,
          userId: sellers.userId,
          businessName: sellers.businessName,
          description: sellers.description,
          businessAddress: sellers.businessAddress,
          businessPhone: sellers.businessPhone,
          gstNumber: sellers.gstNumber,
          bankAccountNumber: sellers.bankAccountNumber,
          ifscCode: sellers.ifscCode,
          isVerified: sellers.isVerified,
          rating: sellers.rating,
          totalSales: sellers.totalSales,
          createdAt: sellers.createdAt,
          updatedAt: sellers.updatedAt,
        },
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(sellers, eq(orderItems.sellerId, sellers.id))
      .where(eq(orderItems.orderId, id));

    return { ...order, orderItems: items };
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getOrdersBySellerId(sellerId: number): Promise<OrderWithItems[]> {
    const orderIds = await db
      .selectDistinct({ orderId: orderItems.orderId })
      .from(orderItems)
      .where(eq(orderItems.sellerId, sellerId));

    const orderPromises = orderIds.map(({ orderId }) => this.getOrderById(orderId));
    const orders = await Promise.all(orderPromises);
    
    return orders.filter((order): order is OrderWithItems => order !== undefined);
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async updateOrderPaymentStatus(id: number, status: string, paymentIntentId?: string): Promise<Order> {
    const updateData: any = { paymentStatus: status, updatedAt: new Date() };
    if (paymentIntentId) {
      updateData.stripePaymentIntentId = paymentIntentId;
    }

    const [order] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Admin operations
  async getPendingVendors(): Promise<Seller[]> {
    return await db
      .select()
      .from(sellers)
      .where(eq(sellers.approvalStatus, "pending"));
  }

  async getPendingProducts(): Promise<ProductWithSeller[]> {
    return await db
      .select({
        id: products.id,
        sellerId: products.sellerId,
        categoryId: products.categoryId,
        name: products.name,
        description: products.description,
        price: products.price,
        originalPrice: products.originalPrice,
        sku: products.sku,
        stock: products.stock,
        images: products.images,
        approvalStatus: products.approvalStatus,
        rejectionReason: products.rejectionReason,
        approvedAt: products.approvedAt,
        approvedBy: products.approvedBy,
        isActive: products.isActive,
        rating: products.rating,
        reviewCount: products.reviewCount,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        seller: {
          id: sellers.id,
          userId: sellers.userId,
          businessName: sellers.businessName,
          businessType: sellers.businessType,
          businessPhone: sellers.businessPhone,
          businessEmail: sellers.businessEmail,
          businessAddress: sellers.businessAddress,
          city: sellers.city,
          pincode: sellers.pincode,
          gstNumber: sellers.gstNumber,
          panNumber: sellers.panNumber,
          bankAccountNumber: sellers.bankAccountNumber,
          ifscCode: sellers.ifscCode,
          description: sellers.description,
          logo: sellers.logo,
          approvalStatus: sellers.approvalStatus,
          rejectionReason: sellers.rejectionReason,
          approvedAt: sellers.approvedAt,
          approvedBy: sellers.approvedBy,
          isActive: sellers.isActive,
          createdAt: sellers.createdAt,
          updatedAt: sellers.updatedAt,
          user: users
        },
        category: categories
      })
      .from(products)
      .leftJoin(sellers, eq(products.sellerId, sellers.id))
      .leftJoin(users, eq(sellers.userId, users.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.approvalStatus, "pending"));
  }

  async getPendingFoodItems(): Promise<any[]> {
    return [];
  }

  async approveVendor(vendorId: number, adminId: string): Promise<Seller> {
    const [seller] = await db
      .update(sellers)
      .set({ 
        approvalStatus: "approved",
        approvedAt: new Date(),
        approvedBy: adminId,
        rejectionReason: null,
        updatedAt: new Date()
      })
      .where(eq(sellers.id, vendorId))
      .returning();
    return seller;
  }

  async rejectVendor(vendorId: number, reason: string, adminId: string): Promise<Seller> {
    const [seller] = await db
      .update(sellers)
      .set({ 
        approvalStatus: "rejected",
        rejectionReason: reason,
        approvedBy: adminId,
        updatedAt: new Date()
      })
      .where(eq(sellers.id, vendorId))
      .returning();
    return seller;
  }
        approvedBy: adminId,
        rejectionReason: null,
        updatedAt: new Date()
      })
      .where(eq(products.id, productId))
      .returning();
    return product;
  }

  async rejectProduct(productId: number, reason: string, adminId: string): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ 
        approvalStatus: "rejected",
        rejectionReason: reason,
        approvedBy: adminId,
        updatedAt: new Date()
      })
      .where(eq(products.id, productId))
      .returning();
    return product;
  }
}

export const storage = new DatabaseStorage();

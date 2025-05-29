import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupDevAuth, isAuthenticated } from "./devAuth";
import { insertSellerSchema, insertCategorySchema, insertProductSchema, insertCartItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupDevAuth(app);

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      const userId = 'dev-user-123';
      let user = await storage.getUser(userId);
      
      // Create dev user if doesn't exist or update to admin
      if (!user) {
        user = await storage.upsertUser({
          id: userId,
          email: 'developer@example.com',
          firstName: 'Dev',
          lastName: 'User',
          isAdmin: true,
        });
      } else if (!user.isAdmin) {
        // Update existing user to be admin
        user = await storage.upsertUser({
          id: userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: true,
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error with dev user:", error);
      res.status(500).json({ message: "Failed to create dev user" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", isAuthenticated, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { categoryId, sellerId, search } = req.query;
      const filters: any = {};
      
      if (categoryId) filters.categoryId = parseInt(categoryId as string);
      if (sellerId) filters.sellerId = parseInt(sellerId as string);
      if (search) filters.search = search as string;

      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seller = await storage.getSellerByUserId(userId);
      
      if (!seller) {
        return res.status(403).json({ message: "You must be a verified seller to add products" });
      }

      const productData = insertProductSchema.parse({
        ...req.body,
        sellerId: seller.id
      });
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productId = parseInt(req.params.id);
      const seller = await storage.getSellerByUserId(userId);
      
      if (!seller) {
        return res.status(403).json({ message: "You must be a seller to update products" });
      }

      const product = await storage.getProductById(productId);
      if (!product || product.sellerId !== seller.id) {
        return res.status(403).json({ message: "You can only update your own products" });
      }

      const updatedProduct = await storage.updateProduct(productId, req.body);
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productId = parseInt(req.params.id);
      const seller = await storage.getSellerByUserId(userId);
      
      if (!seller) {
        return res.status(403).json({ message: "You must be a seller to delete products" });
      }

      const product = await storage.getProductById(productId);
      if (!product || product.sellerId !== seller.id) {
        return res.status(403).json({ message: "You can only delete your own products" });
      }

      await storage.deleteProduct(productId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Seller routes
  app.post("/api/sellers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check if user is already a seller
      const existingSeller = await storage.getSellerByUserId(userId);
      if (existingSeller) {
        return res.status(400).json({ message: "User is already registered as a seller" });
      }

      const sellerData = insertSellerSchema.parse({
        ...req.body,
        userId
      });
      
      const seller = await storage.createSeller(sellerData);
      res.status(201).json(seller);
    } catch (error) {
      console.error("Error creating seller:", error);
      res.status(500).json({ message: "Failed to register as seller" });
    }
  });

  app.get("/api/sellers/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seller = await storage.getSellerByUserId(userId);
      
      if (!seller) {
        return res.status(404).json({ message: "Seller profile not found" });
      }
      
      res.json(seller);
    } catch (error) {
      console.error("Error fetching seller:", error);
      res.status(500).json({ message: "Failed to fetch seller profile" });
    }
  });

  app.put("/api/sellers/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seller = await storage.getSellerByUserId(userId);
      
      if (!seller) {
        return res.status(404).json({ message: "Seller profile not found" });
      }

      const updatedSeller = await storage.updateSeller(seller.id, req.body);
      res.json(updatedSeller);
    } catch (error) {
      console.error("Error updating seller:", error);
      res.status(500).json({ message: "Failed to update seller profile" });
    }
  });

  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId
      });
      
      const cartItem = await storage.addToCart(cartItemData);
      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/:id", isAuthenticated, async (req: any, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      const { quantity } = req.body;
      
      const cartItem = await storage.updateCartItem(cartItemId, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", isAuthenticated, async (req: any, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      await storage.removeFromCart(cartItemId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  app.delete("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.clearCart(userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Order routes
  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getOrdersByUserId(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.get("/api/seller/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seller = await storage.getSellerByUserId(userId);
      
      if (!seller) {
        return res.status(404).json({ message: "Seller profile not found" });
      }

      const orders = await storage.getOrdersBySellerId(seller.id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching seller orders:", error);
      res.status(500).json({ message: "Failed to fetch seller orders" });
    }
  });

  // Stripe payment route
  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { shippingAddress } = req.body;

      // Get cart items
      const cartItems = await storage.getCartItems(userId);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => 
        sum + (parseFloat(item.product.price) * item.quantity), 0
      );
      const tax = subtotal * 0.18; // 18% GST
      const shipping = subtotal > 999 ? 0 : 50; // Free shipping over ₹999
      const total = subtotal + tax + shipping;

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // For now, we'll create orders without payment processing

      // Create order in database
      const order = await storage.createOrder({
        userId,
        orderNumber,
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        shipping: shipping.toString(),
        total: total.toString(),
        paymentMethod: "card",
        shippingAddress,
        status: "pending",
        paymentStatus: "pending",
      });

      // Create order items
      const orderItemsData = cartItems.map(item => ({
        orderId: order.id,
        productId: item.productId,
        sellerId: item.product.sellerId,
        quantity: item.quantity,
        price: item.product.price,
        total: (parseFloat(item.product.price) * item.quantity).toString(),
      }));

      await storage.createOrderItems(orderItemsData);

      // Clear cart
      await storage.clearCart(userId);

      res.json({ 
        message: "Order placed successfully",
        orderId: order.id,
        orderNumber: order.orderNumber
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Admin routes for vendor and product approval
  app.get('/api/admin/pending-vendors', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const vendors = await storage.getPendingVendors();
      res.json(vendors);
    } catch (error) {
      console.error("Error fetching pending vendors:", error);
      res.status(500).json({ message: "Failed to fetch pending vendors" });
    }
  });

  app.get('/api/admin/pending-products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const products = await storage.getPendingProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching pending products:", error);
      res.status(500).json({ message: "Failed to fetch pending products" });
    }
  });

  app.post('/api/admin/approve-vendor/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const vendorId = parseInt(req.params.id);
      const vendor = await storage.approveVendor(vendorId, userId);
      res.json(vendor);
    } catch (error) {
      console.error("Error approving vendor:", error);
      res.status(500).json({ message: "Failed to approve vendor" });
    }
  });

  app.post('/api/admin/reject-vendor/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const vendorId = parseInt(req.params.id);
      const { reason } = req.body;
      const vendor = await storage.rejectVendor(vendorId, reason, userId);
      res.json(vendor);
    } catch (error) {
      console.error("Error rejecting vendor:", error);
      res.status(500).json({ message: "Failed to reject vendor" });
    }
  });

  app.post('/api/admin/approve-product/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const productId = parseInt(req.params.id);
      const product = await storage.approveProduct(productId, userId);
      res.json(product);
    } catch (error) {
      console.error("Error approving product:", error);
      res.status(500).json({ message: "Failed to approve product" });
    }
  });

  app.post('/api/admin/reject-product/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const productId = parseInt(req.params.id);
      const { reason } = req.body;
      const product = await storage.rejectProduct(productId, reason, userId);
      res.json(product);
    } catch (error) {
      console.error("Error rejecting product:", error);
      res.status(500).json({ message: "Failed to reject product" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

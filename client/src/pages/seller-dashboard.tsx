import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, insertSellerSchema, insertCategorySchema } from "@shared/schema";
import type { Seller, ProductWithSeller, Category, OrderWithItems } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Star, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  Settings
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";

const productFormSchema = insertProductSchema.extend({
  images: z.array(z.string()).optional(),
});

const sellerFormSchema = insertSellerSchema.omit({ userId: true });
const categoryFormSchema = insertCategorySchema;

export default function SellerDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithSeller | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  // Fetch seller profile
  const { data: seller, isLoading: sellerLoading } = useQuery<Seller>({
    queryKey: ["/api/sellers/me"],
  });

  // Fetch seller's products
  const { data: products, isLoading: productsLoading } = useQuery<ProductWithSeller[]>({
    queryKey: ["/api/products", { sellerId: seller?.id }],
    enabled: !!seller?.id,
  });

  // Fetch seller's orders
  const { data: orders, isLoading: ordersLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/seller/orders"],
    enabled: !!seller?.id,
  });

  // Fetch categories for product form
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Product form
  const productForm = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      categoryId: undefined,
      stock: 0,
      images: [],
    },
  });

  // Category form
  const categoryForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      isActive: true,
    },
  });

  // Seller form
  const sellerForm = useForm<z.infer<typeof sellerFormSchema>>({
    resolver: zodResolver(sellerFormSchema),
    defaultValues: seller || {
      businessName: "",
      description: "",
      businessAddress: "",
      businessPhone: "",
      gstNumber: "",
      bankAccountNumber: "",
      ifscCode: "",
    },
  });

  // Create/Update product mutation
  const productMutation = useMutation({
    mutationFn: async (data: z.infer<typeof productFormSchema>) => {
      if (editingProduct) {
        return await apiRequest("PUT", `/api/products/${editingProduct.id}`, data);
      } else {
        return await apiRequest("POST", "/api/products", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: editingProduct ? "Product updated" : "Product created",
        description: `Product has been ${editingProduct ? "updated" : "created"} successfully`,
      });
      setIsProductDialogOpen(false);
      setEditingProduct(null);
      productForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${editingProduct ? "update" : "create"} product`,
        variant: "destructive",
      });
    },
  });

  // Update seller mutation
  const sellerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof sellerFormSchema>) => {
      return await apiRequest("PUT", "/api/sellers/me", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sellers/me"] });
      toast({
        title: "Profile updated",
        description: "Your seller profile has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update seller profile",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      return await apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  // Category creation mutation
  const categoryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof categoryFormSchema>) => {
      return await apiRequest("POST", "/api/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category created",
        description: "Category has been created successfully",
      });
      setIsCategoryDialogOpen(false);
      categoryForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    },
  });

  const onProductSubmit = (data: z.infer<typeof productFormSchema>) => {
    productMutation.mutate(data);
  };

  const onSellerSubmit = (data: z.infer<typeof sellerFormSchema>) => {
    sellerMutation.mutate(data);
  };

  const onCategorySubmit = (data: z.infer<typeof categoryFormSchema>) => {
    categoryMutation.mutate(data);
  };

  const handleEditProduct = (product: ProductWithSeller) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      description: product.description || "",
      price: product.price,
      originalPrice: product.originalPrice || "",
      categoryId: product.categoryId,
      stock: product.stock || 0,
      images: product.images || [],
    });
    setIsProductDialogOpen(true);
  };

  const handleDeleteProduct = (productId: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  // Calculate dashboard metrics
  const totalRevenue = orders?.reduce((sum, order) => 
    sum + order.orderItems.reduce((itemSum, item) => 
      itemSum + parseFloat(item.total), 0
    ), 0
  ) || 0;

  const totalOrders = orders?.length || 0;
  const totalProducts = products?.length || 0;
  const averageRating = parseFloat(seller?.rating || "0");

  if (sellerLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-2xl font-bold mb-4">Seller Profile Not Found</h2>
          <p className="text-muted-foreground mb-6">
            It looks like you haven't set up your seller profile yet.
          </p>
          <Button onClick={() => window.location.href = "/"}>
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Seller Dashboard</h1>
            <p className="text-muted-foreground">Manage your products and orders</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            {seller.isVerified ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified Seller
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                Pending Verification
              </Badge>
            )}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-secondary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Your Products</CardTitle>
                  <div className="flex gap-2">
                    <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => {
                          categoryForm.reset();
                        }}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Category
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Category</DialogTitle>
                        </DialogHeader>
                        <Form {...categoryForm}>
                          <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                            <FormField
                              control={categoryForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={categoryForm.control}
                              name="slug"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category Slug</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="e.g., electronics" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={categoryForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description (Optional)</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={categoryForm.control}
                              name="imageUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Image URL (Optional)</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="url" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-end space-x-2">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsCategoryDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" disabled={categoryMutation.isPending}>
                                {categoryMutation.isPending ? "Creating..." : "Create Category"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => {
                          setEditingProduct(null);
                          productForm.reset();
                        }}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Product
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingProduct ? "Edit Product" : "Add New Product"}
                        </DialogTitle>
                      </DialogHeader>
                      <Form {...productForm}>
                        <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4">
                          <FormField
                            control={productForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={productForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={productForm.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price (₹)</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="number" step="0.01" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={productForm.control}
                              name="originalPrice"
                              render={({ field }) => (
                                <FormItem>
                                   <FormLabel>Original Price (₹)</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="number" step="0.01" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={productForm.control}
                              name="categoryId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category</FormLabel>
                                  <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {categories?.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                          {category.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                  </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsProductDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={productMutation.isPending}>
                              {productMutation.isPending ? "Saving..." : (editingProduct ? "Update" : "Create")}
                            </Button>
                          </div>
                        </form>
                      </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <Skeleton className="w-16 h-16" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                      </div>
                    ))}
                  </div>
                ) : products?.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                    <p className="text-muted-foreground">Add your first product to start selling</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products?.map((product) => (
                      <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <Package className="h-6 w-6" />
                          )}
                        </div>
                                                <div className="flex-1">
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ₹{parseFloat(product.price).toLocaleString()} • Stock: {product.stock}
                          </p>
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                      
                            variant="outline"
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deleteProductMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : orders?.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground">Orders will appear here when customers purchase your products</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders?.map((order) => (
                      <div key={order.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">Order #{order.orderNumber}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₹{parseFloat(order.total).toLocaleString()}</p>
                            <Badge variant={
                              order.status === 'delivered' ? 'default' :
                              order.status === 'shipped' ? 'secondary' :
                              order.status === 'confirmed' ? 'outline' : 'destructive'
                            }>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {order.orderItems.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.product.name} × {item.quantity}</span>
                              <span>₹{parseFloat(item.total).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Seller Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...sellerForm}>
                  <form onSubmit={sellerForm.handleSubmit(onSellerSubmit)} className="space-y-4">
                    <FormField
                      control={sellerForm.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                                                      <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={sellerForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={sellerForm.control}
                      name="businessAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Address</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={sellerForm.control}
                        name="businessPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Phone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                                              render={({ field }) => (
                          <FormItem>
                            <FormLabel>GST Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={sellerForm.control}
                        name="bankAccountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Account Number</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={sellerForm.control}
                        name="ifscCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IFSC Code</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" disabled={sellerMutation.isPending}>
                      {sellerMutation.isPending ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
                        </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
                      }
                      

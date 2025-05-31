import Header from "@/components/header";
import ProductCard from "@/components/product-card";
import CartDrawer from "@/components/cart-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { ProductWithSeller, Category } from "@shared/schema";
import { Search, Filter, Grid, List, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function Products() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const categoryParam = params.get('category');
    const searchParam = params.get('search');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location]);

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<ProductWithSeller[]>({
    queryKey: ["/api/products", { 
      categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
      search: searchQuery || undefined 
    }],
  });

  const handleSearch = () => {
    // The search will be triggered by the query key change
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const sortedProducts = products ? [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      case "rating":
        return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  }) : [];

  const selectedCategoryData = categories?.find(cat => cat.id.toString() === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <SlidersHorizontal className="h-5 w-5 mr-2" />
                  <h3 className="text-lg font-semibold">Filters</h3>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">Search Products</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">Categories</label>
                  {categoriesLoading ? (
                    <div className="space-y-2">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        variant={selectedCategory === "" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleCategoryChange("")}
                      >
                        All Categories
                      </Button>
                      {categories?.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id.toString() ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => handleCategoryChange(category.id.toString())}
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">Price Range</label>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start">Under ₹1,000</Button>
                    <Button variant="ghost" className="w-full justify-start">₹1,000 - ₹5,000</Button>
                    <Button variant="ghost" className="w-full justify-start">₹5,000 - ₹10,000</Button>
                    <Button variant="ghost" className="w-full justify-start">Above ₹10,000</Button>
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Customer Rating</label>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start">4★ & above</Button>
                    <Button variant="ghost" className="w-full justify-start">3★ & above</Button>
                    <Button variant="ghost" className="w-full justify-start">2★ & above</Button>
                    <Button variant="ghost" className="w-full justify-start">1★ & above</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {selectedCategoryData ? selectedCategoryData.name : "All Products"}
                </h1>
                <p className="text-muted-foreground">
                  {productsLoading ? "Loading..." : `${sortedProducts.length} products found`}
                </p>
              </div>

              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {productsLoading ? (
              <div className={viewMode === "grid" ? "products-grid" : "space-y-4"}>
                {[...Array(12)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-0">
                      {viewMode === "grid" ? (
                        <>
                          <Skeleton className="aspect-square" />
                          <div className="p-4 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-3 w-1/4" />
                            <div className="flex justify-between items-center">
                              <Skeleton className="h-6 w-20" />
                              <Skeleton className="h-8 w-20" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex p-4 space-x-4">
                          <Skeleton className="w-24 h-24" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-3 w-1/4" />
                            <div className="flex justify-between items-center">
                              <Skeleton className="h-6 w-20" />
                              <Skeleton className="h-8 w-20" />
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or browse different categories
                </p>
                <Button onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "products-grid" : "space-y-4"}>
                {sortedProducts.map((product) => (
                  viewMode === "grid" ? (
                    <ProductCard key={product.id} product={product} />
                  ) : (
                    <Card key={product.id} className="product-card group cursor-pointer">
                      <CardContent className="p-0">
                        <div className="flex p-4 space-x-4">
                          <div className="w-24 h-24 bg-muted rounded flex items-center justify-center flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <img 
                                src={product.images[0]} 
                                alt={product.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <span className="text-2xl">📦</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              by {product.seller.businessName}
                            </p>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xl font-bold text-foreground">
                                  ₹{parseFloat(product.price).toLocaleString()}
                                </span>
                                {product.originalPrice && (
                                  <span className="text-sm text-muted-foreground line-through ml-2">
                                    ₹{parseFloat(product.originalPrice).toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <Button size="sm" className="btn-primary">
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            )}

            {/* Load More */}
            {sortedProducts.length > 0 && (
              <div className="text-center mt-8">
                <Button variant="outline" size="lg">
                  Load More Products
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <CartDrawer />
    </div>
  );
}

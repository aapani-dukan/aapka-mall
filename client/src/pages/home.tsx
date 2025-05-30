import Header from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/product-card";
import CartDrawer from "@/components/cart-drawer";
import { useQuery } from "@tanstack/react-query";
import { ProductWithSeller, Category } from "@shared/schema";
import { 
  Shield, 
  Truck, 
  RotateCcw, 
  Headphones,
  Star,
  CheckCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [, setLocation] = useLocation();

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<ProductWithSeller[]>({
    queryKey: ["/api/products"],
  });

  const featuredSellers = [
    { name: "TechStore India", category: "Electronics Specialist", rating: 4.9, verified: true },
    { name: "StyleCraft", category: "Fashion Designer", rating: 4.7, verified: true },
    { name: "GreenHome", category: "Home & Garden", rating: 4.8, verified: true },
    { name: "BeautyBliss", category: "Beauty & Wellness", rating: 4.6, verified: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="hero-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Discover Amazing Products
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Shop from thousands of verified sellers across India. Quality products, competitive prices, fast delivery.
              </p>
              <Button 
                size="lg"
                onClick={() => setLocation("/products")}
                className="bg-white text-primary hover:bg-gray-100 font-semibold"
              >
                Explore Products
              </Button>
            </div>
            <div className="hidden lg:block">
              <Card className="p-8 bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-0">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🛍️</div>
                    <h3 className="text-xl font-semibold mb-2">Shop with Confidence</h3>
                    <p className="text-blue-100">
                      Secure payments, easy returns, and verified sellers
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-card py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Shield className="h-8 w-8 text-green-600 mb-2" />
              <span className="font-semibold text-foreground">Secure Payments</span>
              <span className="text-sm text-muted-foreground">256-bit SSL Encryption</span>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="h-8 w-8 text-green-600 mb-2" />
              <span className="font-semibold text-foreground">Fast Delivery</span>
              <span className="text-sm text-muted-foreground">Pan-India Coverage</span>
            </div>
            <div className="flex flex-col items-center">
              <RotateCcw className="h-8 w-8 text-green-600 mb-2" />
              <span className="font-semibold text-foreground">Easy Returns</span>
              <span className="text-sm text-muted-foreground">7-day Return Policy</span>
            </div>
            <div className="flex flex-col items-center">
              <Headphones className="h-8 w-8 text-green-600 mb-2" />
              <span className="font-semibold text-foreground">24/7 Support</span>
              <span className="text-sm text-muted-foreground">Customer Care</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Showcase */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Shop by Category</h2>
          
          {categoriesLoading ? (
            <div className="categories-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-16 w-16 rounded-lg mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="categories-grid">
              {categories?.slice(0, 8).map((category) => (
                <div 
                  key={category.id} 
                  className="category-card group cursor-pointer"
                  onClick={() => setLocation(`/products?category=${category.id}`)}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-lg bg-muted mx-auto mb-2 flex items-center justify-center">
                      {category.imageUrl ? (
                        <img src={category.imageUrl} alt={category.name} className="w-8 h-8" />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground">{category.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-muted py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">Trending Products</h2>
            <Button 
              variant="link" 
              className="text-primary font-semibold"
              onClick={() => setLocation("/products")}
            >
              View All
            </Button>
          </div>

          {productsLoading ? (
            <div className="products-grid">
              {[...Array(8)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-0">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {products?.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Seller Spotlight */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Featured Sellers</h2>
          
          <div className="sellers-grid">
            {featuredSellers.map((seller) => (
              <Card key={seller.name} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-muted flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{seller.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{seller.category}</p>
                  <div className="flex items-center justify-center mb-2">
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3" fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground ml-1">({seller.rating})</span>
                  </div>
                  {seller.verified && (
                    <div className="verified-seller">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span>Verified Seller</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CartDrawer />
    </div>
  );
}

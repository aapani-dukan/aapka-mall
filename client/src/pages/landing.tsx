import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ShoppingCart, 
  User, 
  Store, 
  Shield, 
  Truck, 
  RotateCcw, 
  Headphones,
  Star,
  CheckCircle,
  Play,
  Clock,
  ShoppingBag
} from "lucide-react";
import { useSellerRegistrationStore } from "@/lib/store";
import SellerRegistrationModal from "@/components/seller-registration-modal";
export default function Landing() {
  const { open: openSellerModal } = useSellerRegistrationStore();

  const handleSignIn = () => {
    // Redirect to Replit Auth login
    window.location.href = '/api/login';
  };

  const productCategories = [
    { name: "Groceries & Kirana", image: "🛒" },
    { name: "Fruits & Vegetables", image: "🍎" },
    { name: "Dairy Products", image: "🥛" },
    { name: "Bakery Items", image: "🍞" },
    { name: "Snacks & Beverages", image: "🥤" },
    { name: "Personal Care", image: "🧴" },
  ];

  const serviceCategories = [
    { name: "Electrician", image: "⚡" },
    { name: "Plumber", image: "🔧" },
    { name: "AC/Appliance Repair", image: "❄️" },
    { name: "Carpenter", image: "🔨" },
    { name: "House Cleaning", image: "🧽" },
    { name: "Home Tutor", image: "📚" },
  ];

  const foodCategories = [
    { name: "Snacks", image: "🥟" },
    { name: "Thali & Meals", image: "🍽️" },
    { name: "Sweets", image: "🍮" },
    { name: "Drinks & Lassi", image: "🥤" },
    { name: "Street Food", image: "🌮" },
    { name: "Fresh Meals", image: "🍛" },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: "Tata Salt - 1kg",
      seller: "Sharma General Store",
      price: "₹25",
      originalPrice: "₹28",
      rating: 4.8,
      image: "🧂"
    },
    {
      id: 2,
      name: "Fortune Rice Bran Oil - 1L",
      seller: "Krishna Provision Store",
      price: "₹180",
      originalPrice: "₹195",
      rating: 4.5,
      image: "🛢️"
    },
    {
      id: 3,
      name: "Toor Dal - 1kg",
      seller: "Gupta Kirana",
      price: "₹120",
      originalPrice: "₹135",
      rating: 4.7,
      image: "🫘"
    },
    {
      id: 4,
      name: "Aashirvaad Atta - 5kg",
      seller: "Local Grocery Mart",
      price: "₹275",
      originalPrice: "₹295",
      rating: 4.6,
      image: "🌾"
    },
  ];

  const featuredFoodItems = [
    {
      id: 1,
      name: "Hot Samosa (2 pcs)",
      vendor: "Sharma Snacks Corner",
      price: "₹20",
      timing: "Morning & Evening",
      rating: 4.9,
      image: "🥟",
      available: true
    },
    {
      id: 2,
      name: "Special Thali",
      vendor: "Maa Ka Dhaba",
      price: "₹120",
      timing: "Lunch & Dinner",
      rating: 4.7,
      image: "🍽️",
      available: true
    },
    {
      id: 3,
      name: "Fresh Jalebi (250g)",
      vendor: "Gupta Sweets",
      price: "₹80",
      timing: "All Day",
      rating: 4.8,
      image: "🍮",
      available: true
    },
    {
      id: 4,
      name: "Sweet Lassi",
      vendor: "Lassi Wala",
      price: "₹35",
      timing: "Morning & Afternoon",
      rating: 4.6,
      image: "🥤",
      available: true
    },
  ];

  const sellers = [
    { name: "Sharma General Store", category: "Local Grocery Store", rating: 4.9, verified: true },
    { name: "Krishna Provision Store", category: "Kirana & Essentials", rating: 4.7, verified: true },
    { name: "Gupta Kirana", category: "Daily Needs Store", rating: 4.8, verified: true },
    { name: "Local Grocery Mart", category: "Household Items", rating: 4.6, verified: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top notification bar */}
      <div className="notification-bar">
        <span>⚡ Delivery within 1 hour | Free delivery on orders over ₹199 | Same city delivery only</span>
      </div>

      {/* Header */}
      <header className="bg-card shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">Aap Ka Mall</h1>
              <Badge variant="secondary" className="ml-2 text-xs">MARKETPLACE</Badge>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for products, brands, and more..."
                  className="search-input w-full pl-10 pr-20 py-2 border border-border rounded-lg focus:outline-none"
                />
                <Button className="absolute right-2 top-1 h-8 px-4 text-sm">
                  Search
                </Button>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={openSellerModal}
                className="text-muted-foreground hover:text-foreground"
              >
                <Store className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Sell</span>
              </Button>
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  0
                </Badge>
              </Button>
              <Button
                onClick={handleSignIn}
                className="btn-primary"
              >
                <User className="h-4 w-4 mr-2" />
                Sign in with Google
              </Button>
            </div>
          </div>

          {/* Category Navigation */}
          <nav className="border-t border-border py-3">
            <div className="flex space-x-8 overflow-x-auto">
              {[...productCategories.slice(0, 4), ...serviceCategories.slice(0, 4)].map((category) => (
                <button
                  key={category.name}
                  className="whitespace-nowrap text-muted-foreground hover:text-primary font-medium transition-colors"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Essentials & Home Services in 1 Hour
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Get groceries, fresh produce, and daily essentials. Plus instant home services like electrician, plumber, and cleaning - all from local providers in your city.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  size="lg"
                  onClick={handleSignIn}
                  className="bg-white text-primary hover:bg-gray-100 font-semibold"
                >
                  Start Shopping
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={openSellerModal}
                  className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold"
                >
                  Become a Seller
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <Card className="p-8 bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-0">
                  <div className="text-center">
                    <div className="text-6xl mb-4">⚡</div>
                    <h3 className="text-xl font-semibold mb-2">1-Hour Delivery</h3>
                    <p className="text-blue-100">
                      Get your daily essentials delivered from local shops within an hour
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
              <Clock className="h-8 w-8 text-green-600 mb-2" />
              <span className="font-semibold text-foreground">1-Hour Delivery</span>
              <span className="text-sm text-muted-foreground">Same City Only</span>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="h-8 w-8 text-green-600 mb-2" />
              <span className="font-semibold text-foreground">Local Shops</span>
              <span className="text-sm text-muted-foreground">Fresh from Nearby Stores</span>
            </div>
            <div className="flex flex-col items-center">
              <ShoppingBag className="h-8 w-8 text-green-600 mb-2" />
              <span className="font-semibold text-foreground">Daily Essentials</span>
              <span className="text-sm text-muted-foreground">Groceries & Household Items</span>
            </div>
            <div className="flex flex-col items-center">
              <Headphones className="h-8 w-8 text-green-600 mb-2" />
              <span className="font-semibold text-foreground">Local Support</span>
              <span className="text-sm text-muted-foreground">Community Focused</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Showcase */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Shop Products & Book Services</h2>
          
          {/* Product Categories */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Essential Products</h3>
            <div className="categories-grid mb-8">
              {productCategories.map((category) => (
                <div key={category.name} className="category-card group">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{category.image}</div>
                    <span className="text-sm font-medium text-foreground">{category.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Food Categories */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Local Food & Snacks</h3>
            <div className="categories-grid mb-8">
              {foodCategories.map((category) => (
                <div key={category.name} className="category-card group">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{category.image}</div>
                    <span className="text-sm font-medium text-foreground">{category.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Categories */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Home Services</h3>
            <div className="categories-grid">
              {serviceCategories.map((category) => (
                <div key={category.name} className="category-card group">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{category.image}</div>
                    <span className="text-sm font-medium text-foreground">{category.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Local Food & Snacks Section */}
      <section className="bg-gradient-to-r from-orange-50 to-yellow-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Fresh Local Food & Snacks</h2>
            <p className="text-lg text-muted-foreground">Hot meals and fresh snacks delivered from local vendors in your town</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredFoodItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-shadow duration-300 border-2 border-orange-100">
                <CardContent className="p-4">
                  <div className="text-center mb-3">
                    <div className="text-5xl mb-2">{item.image}</div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">{item.vendor}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-lg text-foreground">{item.price}</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-muted-foreground ml-1">{item.rating}</span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Timing:</span>
                      <span className="font-medium">{item.timing}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`font-medium ${item.available ? 'text-green-600' : 'text-red-600'}`}>
                        {item.available ? 'Available' : 'Sold Out'}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full"
                    disabled={!item.available}
                    onClick={() => {/* Order now logic */}}
                  >
                    {item.available ? 'Order Now' : 'Sold Out'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-muted py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">Trending Products</h2>
            <Button variant="link" className="text-primary font-semibold">
              View All
            </Button>
          </div>

          <div className="products-grid">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="product-card group cursor-pointer">
                <CardContent className="p-0">
                  <div className="aspect-square p-8 text-center text-6xl">
                    {product.image}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">by {product.seller}</p>
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3" fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground ml-1">({product.rating})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-foreground">{product.price}</span>
                        <span className="text-sm text-muted-foreground line-through ml-2">{product.originalPrice}</span>
                      </div>
                      <Button size="sm" className="btn-primary">
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Seller Spotlight */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Featured Sellers</h2>
          
          <div className="sellers-grid">
            {sellers.map((seller) => (
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

      {/* Seller Registration CTA */}
      <section className="seller-gradient py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-6">Join as Local Seller</h2>
              <p className="text-xl mb-8 text-green-100">
                Register your local grocery store, kirana shop, or provision store to reach customers in your city with 1-hour delivery.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-200 mr-3" />
                  <span>Free registration for local shops</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-200 mr-3" />
             

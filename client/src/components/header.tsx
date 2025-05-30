import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ShoppingCart, 
  User, 
  Store, 
  LogOut,
  Settings
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useSeller } from "@/hooks/useSeller";
import { useCartStore, useSellerRegistrationStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { useLocation } from "wouter";
import { useState } from "react";
import SellerRegistrationModal from "./seller-registration-modal";

export default function Header() {
  const { user } = useAuth();
  const { isSeller } = useSeller();
  const { getTotalItems, toggleCart } = useCartStore();
  const { open: openSellerModal } = useSellerRegistrationStore();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      {/* Top notification bar */}
      <div className="notification-bar">
        <span>🎉 Free shipping on orders over ₹999 | 24/7 Customer Support</span>
      </div>

      {/* Main Header */}
      <header className="bg-card shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => setLocation("/")}>
              <h1 className="text-2xl font-bold text-primary">Aap Ka Mall</h1>
              <Badge variant="secondary" className="ml-2 text-xs">MARKETPLACE</Badge>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for products, brands, and more..."
                  className="search-input pl-10 pr-20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button 
                  className="absolute right-2 top-1 h-8 px-4 text-sm"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {!isSeller && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={openSellerModal}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Store className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Sell</span>
                </Button>
              )}

              {isSeller && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLocation("/seller")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Store className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              )}

              <Button 
                variant="ghost" 
                size="sm" 
                className="relative"
                onClick={toggleCart}
              >
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    {user?.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm">
                    <div className="font-medium">{user?.displayName || user?.email}</div>
                    <div className="text-muted-foreground">{user?.email}</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Category Navigation */}
          <nav className="border-t border-border py-3">
            <div className="flex space-x-8 overflow-x-auto">
              <button
                onClick={() => setLocation("/products")}
                className="whitespace-nowrap text-muted-foreground hover:text-primary font-medium transition-colors"
              >
                All Products
              </button>
              {categories?.slice(0, 7).map((category) => (
                <button
                  key={category.id}
                  onClick={() => setLocation(`/products?category=${category.id}`)}
                  className="whitespace-nowrap text-muted-foreground hover:text-primary font-medium transition-colors"
                >
                  {category.name}
                </button>
              ))}
              {categories && categories.length > 7 && (
                <button className="whitespace-nowrap text-muted-foreground hover:text-primary font-medium transition-colors">
                  More
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      <SellerRegistrationModal />
    </>
  );
}

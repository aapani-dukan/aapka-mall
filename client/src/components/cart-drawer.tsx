import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CartItemWithProduct } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function CartDrawer() {
  const { 
    isOpen, 
    closeCart, 
    setItems, 
    updateQuantity, 
    removeItem, 
    getTotalPrice,
    items: localItems 
  } = useCartStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch cart items from server
  const { data: cartItems } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    refetchOnMount: true,
  });

  // Update local cart when server data changes
  useEffect(() => {
    if (cartItems) {
      setItems(cartItems);
    }
  }, [cartItems, setItems]);

  // Update cart item mutation
  const updateCartMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      return await apiRequest("PUT", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive",
      });
    },
  });

  // Remove cart item mutation
  const removeCartMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    
    updateQuantity(id, newQuantity);
    updateCartMutation.mutate({ id, quantity: newQuantity });
  };

  const handleRemoveItem = (id: number) => {
    removeItem(id);
    removeCartMutation.mutate(id);
  };

  const handleCheckout = () => {
    if (localItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }
    closeCart();
    setLocation("/checkout");
  };

  if (!isOpen) return null;

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.18; // 18% GST
  const shipping = subtotal > 999 ? 0 : 50;
  const total = subtotal + tax + shipping;

  return (
    <div className="cart-drawer animate-fade-in">
      <div className="cart-overlay" onClick={closeCart} />
      <div className="cart-content animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Shopping Cart</h3>
          <Button variant="ghost" size="sm" onClick={closeCart}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {localItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🛒</div>
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button 
                className="mt-4" 
                onClick={() => {
                  closeCart();
                  setLocation("/products");
                }}
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {localItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      by {item.product.seller.businessName}
                    </p>
                    <p className="text-sm font-semibold">₹{parseFloat(item.product.price).toLocaleString()}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-6 w-6 p-0"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={updateCartMutation.isPending}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm min-w-[20px] text-center">{item.quantity}</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-6 w-6 p-0"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={updateCartMutation.isPending}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={removeCartMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {localItems.length > 0 && (
          <div className="border-t p-4">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (18% GST):</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
            <Button 
              className="w-full" 
              onClick={handleCheckout}
              disabled={localItems.length === 0}
            >
              Proceed to Checkout
            </Button>
            {subtotal < 999 && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Add ₹{(999 - subtotal).toLocaleString()} more for free shipping
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

    

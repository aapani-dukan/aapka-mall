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
    

import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { CartItemWithProduct } from "@shared/schema";
import { useCartStore } from "@/lib/store";
import { Lock, CreditCard, Smartphone, Wallet, Banknote, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Checkout() {
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pinCode: "",
  });
  const { toast } = useToast();
  const { items: cartItems, clearCart } = useCartStore();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch cart items
  const { data: serverCartItems } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    

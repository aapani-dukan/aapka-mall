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
    

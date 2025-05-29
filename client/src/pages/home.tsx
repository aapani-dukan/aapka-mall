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
    

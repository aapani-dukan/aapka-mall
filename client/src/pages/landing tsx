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

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Truck, 
  MapPin, 
  Phone, 
  Clock, 
  IndianRupee, 
  CheckCircle, 
  Navigation,
  Package,
  Bell,
  Star,
  LogOut,
  AlertCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function DeliveryDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);

  // Fetch delivery assignments
  const { data: assignments, isLoading } = useQuery({
    queryKey: ["/api/delivery/assignments"],
    refetchInterval: 30000, // Refresh every 30 seconds for new orders
    

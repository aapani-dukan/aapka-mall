import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSellerSchema } from "@shared/schema";
import type { InsertSeller } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSellerRegistrationStore } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import { Store, CheckCircle, Clock, FileText, CreditCard, Phone } from "lucide-react";
import { z } from "zod";

const sellerFormSchema = insertSellerSchema.omit({ userId: true });

export default function SellerRegistrationModal() {
  const { isOpen, close } = useSellerRegistrationStore();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  

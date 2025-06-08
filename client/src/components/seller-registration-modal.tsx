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

  const form = useForm<z.infer<typeof sellerFormSchema>>({
    resolver: zodResolver(sellerFormSchema),
    defaultValues: {
      businessName: "",
      businessType: "grocery",
      description: "",
      businessAddress: "",
      city: "",
      pincode: "",
      businessPhone: "",
      gstNumber: "",
      bankAccountNumber: "",
      ifscCode: "",
      deliveryRadius: 5,
    },
  });

  const registerSellerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof sellerFormSchema>) => {
      if (!user) {
        throw new Error("User not authenticated");
      }
      return await apiRequest("POST", "/api/sellers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sellers/me"] });
      toast({
        title: "Registration Successful!",
        description: "Your seller account has been created. Verification is pending.",
      });
      close();
      form.reset();
      // Redirect to seller dashboard
      window.location.href = "/seller";
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register as seller. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof sellerFormSchema>) => {
    registerSellerMutation.mutate(data);
  };

  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={close}>
        <DialogContent className="max-w-md z-[100]" />
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Store className="h-5 w-5 mr-2" />
              Join as a Seller
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-lg font-semibold mb-2">Login Required</h3>
            <p className="text-muted-foreground mb-4">
              Please log in to register as a seller on our platform.
            </p>
            <Button onClick={() => window.location.href = '/api/login'} className="w-full">
              Login to Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <Store className="h-6 w-6 mr-2" />
            Become a Seller
          </DialogTitle>
          <p className="text-muted-foreground">
            Register your local grocery store or kirana shop for same-city delivery within 1 hour
          </p>
        </DialogHeader>

        {/* Benefits Section */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <Clock className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium">1-Hour Delivery</span>
          </div>
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium">Local Customers</span>
          </div>
          <div className="flex items-center p-3 bg-purple-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium">Easy Dashboard</span>
          </div>
          <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-sm font-medium">Daily Essentials Focus</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Business Information */}
            <div className="space-y-4">
              <div className="flex items-center">
                <Store className="h-5 w-5 mr-2 text-primary" />
                <h3 className="text-lg font-semibold">Business Information</h3>
              </div>

              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your business name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe your business and products"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Address *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Enter your complete business address"
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter your city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter pincode" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="businessPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Phone *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="tel" 
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tax Information */}
            <div className="space-y-4">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                <h3 className="text-lg font-semibold">Tax Information</h3>
              </div>

              <FormField
                control={form.control}
                name="gstNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="GSTIN (if applicable)"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Required for businesses with turnover above ₹20 lakhs
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Banking Information */}
            <div className="space-y-4">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-primary" />
                <h3 className="text-lg font-semibold">Banking Information</h3>
              </div>

              <FormField
                control={form.control}
                name="bankAccountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Account Number *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="password"
                        placeholder="Enter your bank account number"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      This information is securely encrypted and used for payments only
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ifscCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IFSC Code *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="IFSC Code"
                        style={{ textTransform: 'uppercase' }}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Verification Notice */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-medium text-yellow-800">Verification Process</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your seller account will be reviewed within 24-48 hours. You'll receive an email once verification is complete.
                  </p>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                By registering as a seller, you agree to our{" "}
                <button type="button" className="text-primary hover:underline">
                  Terms of Service
                </button>{" "}
                and{" "}
                <button type="button" className="text-primary hover:underline">
                  Seller Guidelines
                </button>
                . You confirm that all information provided is accurate and up-to-date.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={close}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={registerSellerMutation.isPending}
                className="flex-1"
              >
                {registerSellerMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Registering...
                  </div>
                ) : (
                  "Register as Seller"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

  

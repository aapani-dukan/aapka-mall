import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Truck, Phone, Lock } from "lucide-react";
import { signInWithGoogle } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function DeliveryLogin() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!isLoading && user) {
      // Check if user is a delivery boy
      setLocation("/delivery-dashboard");
    }
  }, [user, isLoading, setLocation]);

  const handleDeliveryLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Failed to sign in. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Truck className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">डिलीवरी बॉय लॉगिन</CardTitle>
          <p className="text-muted-foreground">
            Delivery Partner Access Portal
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your registered phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Secure delivery partner access</span>
            </div>
            
            <Button 
              onClick={handleDeliveryLogin}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Sign in with Google
            </Button>
          </div>
          
          <div className="text-center text-xs text-muted-foreground">
            Only registered delivery partners can access this portal
          </div>
          
          <div className="border-t pt-4">
            <p className="text-sm text-center text-muted-foreground">
              New delivery partner? Contact admin for registration
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

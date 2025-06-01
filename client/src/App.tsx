import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
//import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Products from "@/pages/products";
import SellerDashboard from "@/pages/seller-dashboard";
import Checkout from "@/pages/checkout";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import DeliveryLogin from "@/pages/delivery-login";
import DeliveryDashboard from "@/pages/delivery-dashboard";
import NotFound from "@/pages/not-found";
import ProtectedSellerRoute from "@/components/ProtectedSellerRoute";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <Switch>
      {/* Hidden admin routes - not visible in main app */}
      <Route path="/admin-access" component={AdminLogin} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      
      {/* Hidden delivery routes - not visible in main app */}
      <Route path="/delivery-login" component={DeliveryLogin} />
      <Route path="/delivery-dashboard" component={DeliveryDashboard} />
      
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/products/:category" component={Products} />
          <Route path="/seller">
            <ProtectedSellerRoute>
              <SellerDashboard />
            </ProtectedSellerRoute>
          </Route>
          <Route path="/seller-dashboard">
            <ProtectedSellerRoute>
              <SellerDashboard />
            </ProtectedSellerRoute>
          </Route>
          <Route path="/checkout" component={Checkout} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

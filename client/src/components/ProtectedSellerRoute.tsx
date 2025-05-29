import { useSeller } from "@/hooks/useSeller";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSellerRegistrationStore } from "@/lib/store";
import { Store, AlertCircle } from "lucide-react";

interface ProtectedSellerRouteProps {
  children: React.ReactNode;
}

export default function ProtectedSellerRoute({ children }: ProtectedSellerRouteProps) {
  const { isSeller, isLoading, isAuthenticated } = useSeller();
  const { open: openSellerModal } = useSellerRegistrationStore();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access the seller dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isSeller) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">

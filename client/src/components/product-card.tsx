import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, CheckCircle } from "lucide-react";
import { ProductWithSeller } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/lib/store";

interface ProductCardProps {
  product: ProductWithSeller;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { openCart } = useCartStore();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
      openCart();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCartMutation.mutate();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3 w-3 fill-current" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-3 w-3 fill-current opacity-50" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3" />);
    }

    return stars;
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)
    : 0;

  return (
    <Card className="product-card group cursor-pointer">
      <CardContent className="p-0">
        <div className="relative">
          <div className="aspect-square p-8 text-center bg-muted">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-full h-full object-cover rounded-t-lg"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-4xl">
                📦
              </div>
            )}
          </div>
          {discountPercentage > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 left-2 text-xs"
            >
              -{discountPercentage}%
            </Badge>
          )}
          {product.stock <= 10 && product.stock > 0 && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 right-2 text-xs"
            >
              Only {product.stock} left
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 right-2 text-xs"
            >
              Out of Stock
            </Badge>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{product.name}</h3>
          <div className="flex items-center mb-2">
            <p className="text-sm text-muted-foreground">by {product.seller.businessName}</p>
            {product.seller.isVerified && (
              <CheckCircle className="h-3 w-3 text-green-600 ml-1" />
            )}
          </div>
          
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {renderStars(parseFloat(product.rating || "0"))}
            </div>
            <span className="text-sm text-muted-foreground ml-1">
              ({parseFloat(product.rating || "0").toFixed(1)})
            </span>
            {product.reviewCount > 0 && (
              <span className="text-sm text-muted-foreground ml-1">
                · {product.reviewCount} reviews
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-foreground">
                ₹{parseFloat(product.price).toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through ml-2">
                  ₹{parseFloat(product.originalPrice).toLocaleString()}
                </span>
              )}
            </div>
            <Button 
              size="sm" 
              className="btn-primary"
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending || product.stock === 0}
            >
              {addToCartMutation.isPending ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
          
          {product.seller.isVerified && (
            <div className="verified-seller mt-2">
              <CheckCircle className="h-3 w-3 mr-1" />
              <span>Verified Seller</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

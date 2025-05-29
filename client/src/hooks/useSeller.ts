import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export function useSeller() {
  const { user, isAuthenticated } = useAuth();
  
  const { data: seller, isLoading } = useQuery({
    queryKey: ["/api/sellers/me"],
    enabled: isAuthenticated,
    retry: false,
  });

  return {
    seller,
    isSeller: !!seller,
    isLoading,
    isAuthenticated,
  };
}

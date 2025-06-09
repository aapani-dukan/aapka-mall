// pages/register-seller.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/shared/loader";
import SellerRegistrationModal from "@/components/modals/seller-registration-modal";

export default function RegisterSellerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // अगर user नहीं है तो login पर redirect करें
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <Loader />;
  }

  // जब user login है तो seller registration modal दिखाएं
  return <SellerRegistrationModal />;
}

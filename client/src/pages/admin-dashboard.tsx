import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Shield, CheckCircle, XCircle, Clock, Store, Package, Users, LogOut } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Redirect if not admin
  if (!user?.isAdmin) {
    setLocation("/admin-access");
    return null;
  }

  // Fetch pending vendors
  const { data: pendingVendors } = useQuery({
    queryKey: ["/api/admin/pending-vendors"],
  });

  // Fetch pending products
  const { data: pendingProducts } = useQuery({
    queryKey: ["/api/admin/pending-products"],
  });

  // Fetch pending food items
  const { data: pendingFoodItems } = useQuery({
    queryKey: ["/api/admin/pending-food-items"],
  });

  // Approve vendor mutation
  const approveVendorMutation = useMutation({
    mutationFn: async (vendorId: number) => {
      return await apiRequest("POST", `/api/admin/approve-vendor/${vendorId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-vendors"] });
      toast({
        title: "Vendor Approved",
        description: "Vendor has been approved and can now start selling.",
      });
    },
  });

  // Reject vendor mutation
  const rejectVendorMutation = useMutation({
    mutationFn: async ({ vendorId, reason }: { vendorId: number; reason: string }) => {
      return await apiRequest("POST", `/api/admin/reject-vendor/${vendorId}`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-vendors"] });
      setRejectionReason("");
      setSelectedItem(null);
      toast({
        title: "Vendor Rejected",
        description: "Vendor has been notified of the rejection.",
      });
    },
  });

  // Approve product mutation
  const approveProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      return await apiRequest("POST", `/api/admin/approve-product/${productId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-products"] });
      toast({
        title: "Product Approved",
        description: "Product is now live on the platform.",
      });
    },
  });

  // Reject product mutation
  const rejectProductMutation = useMutation({
    mutationFn: async ({ productId, reason }: { productId: number; reason: string }) => {
      return await apiRequest("POST", `/api/admin/reject-product/${productId}`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-products"] });
      setRejectionReason("");
      setSelectedItem(null);
      toast({
        title: "Product Rejected",
        description: "Seller has been notified of the rejection.",
      });
    },
  });

  const handleLogout = () => {
    setLocation("/");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Vendor & Product Management</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Store className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Vendors</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingVendors?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Products</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingProducts?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Food Items</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingFoodItems?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="vendors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vendors">Pending Vendors</TabsTrigger>
            <TabsTrigger value="products">Pending Products</TabsTrigger>
            <TabsTrigger value="food-items">Pending Food Items</TabsTrigger>
          </TabsList>

          {/* Pending Vendors */}
          <TabsContent value="vendors">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Approval Queue</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingVendors?.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending vendors</p>
                ) : (
                  <div className="space-y-4">
                    {pendingVendors?.map((vendor: any) => (
                      <div key={vendor.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{vendor.businessName}</h3>
                            <p className="text-gray-600">{vendor.businessType}</p>
                            <p className="text-sm text-gray-500 mt-1">{vendor.city}, {vendor.pincode}</p>
                            <p className="text-sm text-gray-500">Phone: {vendor.businessPhone}</p>
                            {vendor.description && (
                              <p className="text-sm mt-2">{vendor.description}</p>
                            )}
                            <div className="mt-2">
                              {getStatusBadge(vendor.approvalStatus)}
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button
                              onClick={() => approveVendorMutation.mutate(vendor.id)}
                              disabled={approveVendorMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  onClick={() => setSelectedItem(vendor)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject Vendor</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Label htmlFor="reason">Rejection Reason</Label>
                                  <Textarea
                                    id="reason"
                                    placeholder="Please provide a reason for rejection..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="destructive"
                                      onClick={() => {
                                        if (selectedItem && rejectionReason.trim()) {
                                          rejectVendorMutation.mutate({
                                            vendorId: selectedItem.id,
                                            reason: rejectionReason,
                                          });
                                        }
                                      }}
                                      disabled={!rejectionReason.trim() || rejectVendorMutation.isPending}
                                    >
                                      Confirm Rejection
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Products */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Product Approval Queue</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingProducts?.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending products</p>
                ) : (
                  <div className="space-y-4">
                    {pendingProducts?.map((product: any) => (
                      <div key={product.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <p className="text-gray-600">by {product.seller?.businessName}</p>
                            <p className="text-lg font-bold text-green-600">₹{product.price}</p>
                            {product.description && (
                              <p className="text-sm mt-2">{product.description}</p>
                            )}
                            <div className="mt-2">
                              {getStatusBadge(product.approvalStatus)}
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button
                              onClick={() => approveProductMutation.mutate(product.id)}
                              disabled={approveProductMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  onClick={() => setSelectedItem(product)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject Product</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Label htmlFor="reason">Rejection Reason</Label>
                                  <Textarea
                                    id="reason"
                                    placeholder="Please provide a reason for rejection..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="destructive"
                                      onClick={() => {
                                        if (selectedItem && rejectionReason.trim()) {
                                          rejectProductMutation.mutate({
                                            productId: selectedItem.id,
                                            reason: rejectionReason,
                                          });
                                        }
                                      }}
                                      disabled={!rejectionReason.trim() || rejectProductMutation.isPending}
                                    >
                                      Confirm Rejection
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Food Items */}
          <TabsContent value="food-items">
            <Card>
              <CardHeader>
                <CardTitle>Food Item Approval Queue</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingFoodItems?.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending food items</p>
                ) : (
                  <div className="space-y-4">
                    {pendingFoodItems?.map((item: any) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <p className="text-gray-600">by {item.vendor?.vendorName}</p>
                            <p className="text-lg font-bold text-green-600">₹{item.price}</p>
                            <p className="text-sm text-gray-500">Available: {item.availableTimings}</p>
                            {item.description && (
                              <p className="text-sm mt-2">{item.description}</p>
                            )}
                            <div className="mt-2">
                              {getStatusBadge(item.approvalStatus)}
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button
                              onClick={() => approveProductMutation.mutate(item.id)}
                              disabled={approveProductMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  onClick={() => setSelectedItem(item)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject Food Item</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Label htmlFor="reason">Rejection Reason</Label>
                                  <Textarea
                                    id="reason"
                                    placeholder="Please provide a reason for rejection..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="destructive"
                                      onClick={() => {
                                        if (selectedItem && rejectionReason.trim()) {
                                          rejectProductMutation.mutate({
                                            productId: selectedItem.id,
                                            reason: rejectionReason,
                                          });
                                        }
                                      }}
                                      disabled={!rejectionR

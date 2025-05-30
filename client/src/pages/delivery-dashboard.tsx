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
  });

  // Fetch delivery boy profile
  const { data: profile } = useQuery({
    queryKey: ["/api/delivery/profile"],
  });

  // Update delivery status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ assignmentId, status }: { assignmentId: number; status: string }) => {
      return await apiRequest("POST", `/api/delivery/update-status/${assignmentId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/delivery/assignments"] });
      toast({
        title: "Status Updated",
        description: "Delivery status has been updated successfully.",
      });
    },
  });

  // Accept delivery mutation
  const acceptDeliveryMutation = useMutation({
    mutationFn: async (assignmentId: number) => {
      return await apiRequest("POST", `/api/delivery/accept/${assignmentId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/delivery/assignments"] });
      toast({
        title: "Order Accepted",
        description: "You have accepted this delivery assignment.",
      });
    },
  });

  const handleLogout = () => {
    setLocation("/delivery-login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "picked_up":
        return "bg-purple-100 text-purple-800";
      case "on_the_way":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "assigned":
        return "नया ऑर्डर";
      case "accepted":
        return "स्वीकार किया";
      case "picked_up":
        return "पिक अप किया";
      case "on_the_way":
        return "रास्ते में";
      case "delivered":
        return "डिलीवर किया";
      default:
        return status;
    }
  };

  const openGoogleMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const pendingAssignments = assignments?.filter((a: any) => a.status === "assigned") || [];
  const activeAssignments = assignments?.filter((a: any) => ["accepted", "picked_up", "on_the_way"].includes(a.status)) || [];
  const completedAssignments = assignments?.filter((a: any) => a.status === "delivered") || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">डिलीवरी डैशबोर्ड</h1>
                  <p className="text-sm text-gray-600">Delivery Partner Portal</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {profile && (
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={profile.profileImage} />
                    <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium">{profile.name}</p>
                    <p className="text-gray-500">⭐ {profile.rating} • {profile.totalDeliveries} deliveries</p>
                  </div>
                </div>
              )}
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bell className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">नए ऑर्डर</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingAssignments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">चल रहे ऑर्डर</p>
                  <p className="text-2xl font-bold text-gray-900">{activeAssignments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">आज पूरे किए</p>
                  <p className="text-2xl font-bold text-gray-900">{completedAssignments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <IndianRupee className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">आज की कमाई</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{completedAssignments.reduce((sum: number, a: any) => sum + parseFloat(a.deliveryFee || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="relative">
              नए ऑर्डर
              {pendingAssignments.length > 0 && (
                <Badge className="ml-2 bg-red-500">{pendingAssignments.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">चल रहे ऑर्डर</TabsTrigger>
            <TabsTrigger value="completed">पूरे किए गए</TabsTrigger>
          </TabsList>

          {/* Pending Orders */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  नए ऑर्डर असाइनमेंट
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingAssignments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">कोई नया ऑर्डर नहीं है</p>
                ) : (
                  <div className="space-y-4">
                    {pendingAssignments.map((assignment: any) => (
                      <div key={assignment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">Order #{assignment.orderId || assignment.foodOrderId}</h3>
                            <Badge className={getStatusColor(assignment.status)}>
                              {getStatusText(assignment.status)}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">₹{assignment.deliveryFee}</p>
                            <p className="text-sm text-gray-500">{assignment.distance}km</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">पिकअप</p>
                            <p className="text-sm">{assignment.pickupAddress}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={() => openGoogleMaps(assignment.pickupAddress)}
                            >
                              <Navigation className="h-4 w-4 mr-1" />
                              Map
                            </Button>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">डिलीवरी</p>
                            <p className="text-sm">{assignment.deliveryAddress}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={() => openGoogleMaps(assignment.deliveryAddress)}
                            >
                              <Navigation className="h-4 w-4 mr-1" />
                              Map
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1 text-gray-400" />
                              <span className="text-sm">{assignment.customerPhone}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-400" />
                              <span className="text-sm">{assignment.estimatedTime} min</span>
                            </div>
                          </div>
                          <Button
                            onClick={() => acceptDeliveryMutation.mutate(assignment.id)}
                            disabled={acceptDeliveryMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            स्वीकार करें
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Orders */}
          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>चल रहे ऑर्डर</CardTitle>
              </CardHeader>
              <CardContent>
                {activeAssignments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">कोई चल रहा ऑर्डर नहीं है</p>
                ) : (
                  <div className="space-y-4">
                    {activeAssignments.map((assignment: any) => (
                      <div key={assignment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">Order #{assignment.orderId || assignment.foodOrderId}</h3>
                            <Badge className={getStatusColor(assignment.status)}>
                              {getStatusText(assignment.status)}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">₹{assignment.deliveryFee}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">पिकअप</p>
                            <p className="text-sm">{assignment.pickupAddress}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">डिलीवरी</p>
                            <p className="text-sm">{assignment.deliveryAddress}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openGoogleMaps(assignment.deliveryAddress)}
                            >
                              <Navigation className="h-4 w-4 mr-1" />
                              Navigate
                            </Button>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1 text-gray-400" />
                              <span className="text-sm">{assignment.customerPhone}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {assignment.status === "accepted" && (
                              <Button
                                size="sm"
                                onClick={() => updateStatusMutation.mutate({ assignmentId: assignment.id, status: "picked_up" })}
                                disabled={updateStatusMutation.isPending}
                              >
                                पिक अप किया
                              </Button>
                            )}
                            {assignment.status === "picked_up" && (
                              <Button
                                size="sm"
                                onClick={() => updateStatusMutation.mutate({ assignmentId: assignment.id, status: "on_the_way" })}
                                disabled={updateStatusMutation.isPending}
                              >
                                रास्ते में
                              </Button>
                            )}
                            {assignment.status === "on_the_way" && (
                              <Button
                                size="sm"
                                onClick={() => updateStatusMutation.mutate({ assignmentId: assignment.id, status: "delivered" })}
                                disabled={updateStatusMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                डिलीवर किया
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Completed Orders */}
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>पूरे किए गए ऑर्डर</CardTitle>
              </CardHeader>
              <CardContent>
                {completedAssignments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">आज कोई ऑर्डर पूरा नहीं किया</p>
                ) : (
                  <div className="space-y-4">
                    {completedAssignments.map((assignment: any) => (
                      <div key={assignment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">Order #{assignment.orderId || assignment.foodOrderId}</h3>
                            <Badge className={getStatusColor(assignment.status)}>
                              {getStatusText(assignment.status)}
                            </Badge>
                            <p className="text-sm text-gray-500 mt-1">
                              डिलीवर किया: {new Date(assignment.deliveredAt).toLocaleString('hi-IN')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">₹{assignment.deliveryFee}</p>
                            {assignment.customerRating && (
                              <div className="flex items-center mt-1">
                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                <span className="text-sm">{assignment.customerRating}/5</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
                            }

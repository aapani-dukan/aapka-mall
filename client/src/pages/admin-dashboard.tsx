import { useEffect, useState } from "react";
import { apiRequest } from "../utils/apiRequest";

interface Vendor {
  _id: string;
  businessName: string;
  phoneNumber: string;
  status: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  status: string;
}

export default function AdminDashboard() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState("vendors");

  const fetchVendors = async () => {
    const res = await apiRequest("GET", "/api/admin/vendors");
    setVendors(res.data);
  };

  const fetchProducts = async () => {
    const res = await apiRequest("GET", "/api/admin/products");
    setProducts(res.data);
  };

  const approveVendor = async (vendorId: string) => {
    await apiRequest("POST", `/api/admin/approve-vendor/${vendorId}`, {});
    fetchVendors();
  };

  const rejectVendor = async (vendorId: string) => {
    await apiRequest("POST", `/api/admin/reject-vendor/${vendorId}`, {});
    fetchVendors();
  };

  const approveProduct = async (productId: string) => {
    await apiRequest("POST", `/api/admin/approve-product/${productId}`, {});
    fetchProducts();
  };

  const rejectProduct = async (productId: string) => {
    await apiRequest("POST", `/api/admin/reject-product/${productId}`, {});
    fetchProducts();
  };

  useEffect(() => {
    fetchVendors();
    fetchProducts();
  }, []);

  return (
    <div className="p-4">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setActiveTab("vendors")}
          className={`px-4 py-2 rounded ${activeTab === "vendors" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Vendors
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 rounded ${activeTab === "products" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Products
        </button>
      </div>

      {activeTab === "vendors" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Vendors</h2>
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2">Business Name</th>
                <th className="px-4 py-2">Phone Number</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor._id}>
                  <td className="border px-4 py-2">{vendor.businessName}</td>
                  <td className="border px-4 py-2">{vendor.phoneNumber}</td>
                  <td className="border px-4 py-2">{vendor.status}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      onClick={() => approveVendor(vendor._id)}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectVendor(vendor._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "products" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Products</h2>
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="border px-4 py-2">{product.name}</td>
                  <td className="border px-4 py-2">{product.price}</td>
                  <td className="border px-4 py-2">{product.category}</td>
                  <td className="border px-4 py-2">{product.status}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      onClick={() => approveProduct(product._id)}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectProduct(product._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

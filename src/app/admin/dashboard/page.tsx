"use client"

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stockLevel: number;
  inStock: boolean;
  category: string[];
  unit: string;
  image: string;
  description: string;
  seller: string;
}

interface SellerApplication {
  _id: string;
  name: string;
  email: string;
  phoneno: string;
  fssaino?: string;
  fssailicense?: string;
  kishancreditcard?: string;
  govtid?: string;
  sellerstatus?: string;
}

interface OrderItem {
  quantity: number;
  price: number;
  product?: {
    name: string;
    image: string;
    seller?: {
      name: string;
      email: string;
      phoneno: string;
    };
  };
}

interface Order {
  _id: string;
  status: string;
  totalamount: number;
  createdAt: string;
  buyer?: {
    name: string;
    email: string;
    phoneno: string;
  };
  items: OrderItem[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'sellers' | 'orders'>('products');
  const [user, setUser] = useState<User | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<SellerApplication[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Product Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch Profile to ensure they are admin
        const profileRes = await fetch('/api/profile');
        if (!profileRes.ok) {
          console.error("Profile fetch failed:", profileRes.status);
          router.push('/');
          return;
        }
        
        const profileJson = await profileRes.json();
        setUser(profileJson.data);
        
        if (profileJson.data?.role !== 'admin') {
          router.push('/');
          return;
        }

        // 2. Fetch All Products
        const productsRes = await fetch('/api/product');
        if (productsRes.ok) {
          const productsJson = await productsRes.json();
          setProducts(productsJson.data || []);
        }

        // 3. Fetch Pending Sellers
        const sellersRes = await fetch('/api/admin/seller-application?status=pending');
        if (sellersRes.ok) {
          const sellersJson = await sellersRes.json();
          setSellers(sellersJson.data || []);
        }

        // 4. Fetch All Orders
        const ordersRes = await fetch('/api/admin/orders');
        if (ordersRes.ok) {
          const ordersJson = await ordersRes.json();
          setOrders(ordersJson.data || []);
        }

      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // --- PRODUCT MANAGEMENT ---
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/product/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p._id !== productId));
        alert('Product deleted successfully');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete product');
      }
    } catch (e) { alert('An error occurred while deleting'); }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct({ ...product });
    setIsEditModalOpen(true);
    setMessage(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSaving(true);
    setMessage(null);
    try {
        const res = await fetch(`/api/product/${editingProduct._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: editingProduct.name,
                price: editingProduct.price,
                stockLevel: editingProduct.stockLevel,
                description: editingProduct.description
            })
        });

        const data = await res.json();
        if (res.ok) {
            setMessage({ type: 'success', text: 'Product updated successfully' });
            setProducts(prev => prev.map(p => p._id === editingProduct._id ? { ...p, ...data.data } : p));
            setTimeout(() => { setIsEditModalOpen(false); }, 1000);
        } else {
            setMessage({ type: 'error', text: data.message || 'Failed to update' });
        }
    } catch (e) {
        setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
        setIsSaving(false);
    }
  };

  // --- SELLER MANAGEMENT ---
  const handleSellerStatusUpdate = async (sellerId: string, status: 'approved' | 'rejected') => {
      if (!confirm(`Are you sure you want to mark this application as ${status}?`)) return;
      try {
          const res = await fetch(`/api/admin/seller-application/${sellerId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status })
          });
          if (res.ok) {
             alert(`Seller successfully ${status}`);
             setSellers(prev => prev.filter(s => s._id !== sellerId));
          } else {
             const data = await res.json();
             alert(data.message || "Failed to update seller status");
          }
      } catch(e) {
          alert('An error occurred while communicating with the server');
      }
  };

  // --- ORDER MANAGEMENT ---
  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
      try {
          const res = await fetch(`/api/admin/orders/${orderId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
          });
          const data = await res.json();
          if (res.ok) {
              setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
          } else {
              alert(data.message || 'Failed to update order status');
          }
      } catch(e) {
          alert('An error occurred while updating order');
      }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('WARNING: This will permanently delete this order. Are you sure?')) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o._id !== orderId));
        alert('Order deleted successfully');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete order');
      }
    } catch (e) { alert('An error occurred while deleting'); }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return;
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute:'2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="grow flex justify-center items-center">
          <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="md:flex md:items-center md:justify-between mb-8 border-b border-gray-200 pb-5">
          <div className="min-w-0 flex-1">
            <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:truncate sm:text-4xl sm:tracking-tight">
              Admin Master Control
            </h2>
            <p className="mt-2 text-sm text-gray-500">Manage products, verify sellers, and oversee global orders.</p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0 gap-3">
             <button
               onClick={() => router.push('/admin/uploadProduct')}
               className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
             >
               Add Global Product
             </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
              <nav className="flex flex-col p-2 space-y-1">
                <button 
                  onClick={() => setActiveTab('products')}
                  className={`flex items-center text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <svg className="mr-3 h-5 w-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  All Products ({products.length})
                </button>
                <button 
                  onClick={() => setActiveTab('sellers')}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'sellers' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <div className="flex items-center">
                      <svg className="mr-3 h-5 w-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Seller Approvals
                  </div>
                  {sellers.length > 0 && (
                      <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">{sellers.length}</span>
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <svg className="mr-3 h-5 w-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Global Orders ({orders.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* --- PRODUCTS TAB --- */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                   <h3 className="text-lg font-bold text-gray-900">Manage All Products</h3>
                 </div>
                 
                 <div className="divide-y divide-gray-100">
                    {products.length > 0 ? (
                        products.map(product => (
                            <div key={product._id} className="p-6 flex flex-col sm:flex-row gap-6 items-center hover:bg-gray-50 transition-colors">
                                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className="h-full w-full object-contain object-center" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">No Image</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h4 className="text-lg font-bold text-gray-900 truncate">{product.name}</h4>
                                    <p className="text-xs text-gray-400 font-mono mb-2">ID: {product._id}</p>
                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                                        <span className="font-semibold text-gray-900">${product.price.toFixed(2)}</span>
                                        <span>Stock: {product.stockLevel} {product.unit}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-3 shrink-0">
                                    <button 
                                      onClick={() => openEditModal(product)} 
                                      className="px-3 py-1.5 text-sm font-medium rounded text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteProduct(product._id)} 
                                      className="px-3 py-1.5 text-sm font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                           <p>No products exist in the database.</p>
                         </div>
                    )}
                 </div>
              </div>
            )}

            {/* --- SELLERS TAB --- */}
            {activeTab === 'sellers' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                   <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                       Applicant Queue
                       {sellers.length > 0 && <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-bold">{sellers.length} Pending</span>}
                   </h3>
                   <p className="text-sm text-gray-500 mt-1">Review applicant documents and grant selling privileges.</p>
                 </div>
                 
                 <div className="divide-y divide-gray-100">
                    {sellers.length > 0 ? (
                        sellers.map(seller => (
                            <div key={seller._id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900">{seller.name}</h4>
                                        <div className="text-sm text-gray-500 space-y-1 mt-1">
                                            <p><span className="font-medium text-gray-700">Email:</span> {seller.email}</p>
                                            <p><span className="font-medium text-gray-700">Phone:</span> {seller.phoneno}</p>
                                            <p><span className="font-medium text-gray-700">FSSAI Number:</span> <span className="font-mono bg-gray-100 px-1 rounded">{seller.fssaino}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex sm:flex-col gap-2 shrink-0">
                                        <button 
                                            onClick={() => handleSellerStatusUpdate(seller._id, 'approved')}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded shadow-sm w-full text-center"
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            onClick={() => handleSellerStatusUpdate(seller._id, 'rejected')}
                                            className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded shadow-sm w-full text-center"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Verification Documents</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {seller.fssailicense && (
                                            <a href={seller.fssailicense} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition group">
                                                <svg className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                                                    <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                                                </svg>
                                                <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 truncate">FSSAI License</span>
                                            </a>
                                        )}
                                        {seller.kishancreditcard && (
                                            <a href={seller.kishancreditcard} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition group">
                                                <svg className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 truncate">Kishan Credit Card</span>
                                            </a>
                                        )}
                                        {seller.govtid && (
                                            <a href={seller.govtid} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition group">
                                                <svg className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 truncate">Government ID</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-16 text-center text-gray-500">
                           <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                           <p className="mt-4 font-medium text-gray-900">All caught up!</p>
                           <p className="text-sm mt-1">There are no pending seller applications.</p>
                         </div>
                    )}
                 </div>
              </div>
            )}

            {/* --- ORDERS TAB --- */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-lg font-bold text-gray-900">Global Orders Log</h3>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                          <div>
                            <p className="text-xs font-mono text-gray-400 mb-1">ID: {order._id}</p>
                            <p className="text-sm text-gray-500 mb-1">Placed: <span className="font-medium text-gray-900">{formatDate(order.createdAt)}</span></p>
                            {order.buyer && (
                              <div className="mt-3 p-3 bg-gray-100 rounded text-sm w-fit border border-gray-200">
                                <p className="font-medium text-gray-900 mb-1 flex items-center gap-1">
                                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Buyer Details
                                </p>
                                <p className="text-gray-700">{order.buyer.name}</p>
                                <p className="text-gray-500">{order.buyer.email}</p>
                                <p className="text-gray-500">{order.buyer.phoneno}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col sm:items-end gap-3 shrink-0">
                            <select 
                                value={order.status}
                                onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                                className={`text-sm font-bold uppercase tracking-wider rounded-md border-0 py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-indigo-600 sm:text-sm ${
                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}
                            >
                                <option value="pending">Pending</option>
                                <option value="ordered">Ordered</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            
                            <span className="font-bold text-gray-900 text-lg">${order.totalamount.toFixed(2)}</span>

                            <button onClick={() => handleDeleteOrder(order._id)} className="text-xs text-red-500 hover:text-red-700 font-medium underline mt-2">
                                Terminate Record
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 border border-gray-100 rounded-lg overflow-hidden bg-white">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price (ea)</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {order.items.map((item, idx) => (
                                <tr key={idx}>
                                  <td className="px-4 py-3 text-sm text-gray-900 flex flex-col gap-1">
                                    <div className="flex items-center gap-3">
                                      {item.product?.image && <img src={item.product?.image} className="h-8 w-8 shrink-0 rounded-md object-cover border border-gray-200" />}
                                      <span className="font-medium">{item.product?.name || 'Deleted Product/Item'}</span>
                                    </div>
                                    {item.product?.seller ? (
                                      <div className="text-xs text-gray-500 ml-11 mt-1 bg-gray-50 rounded p-2 border border-gray-100">
                                        <span className="font-bold text-gray-700 text-[10px] uppercase tracking-wider">Seller Details</span><br/>
                                        <span className="text-gray-900 font-medium">{item.product.seller.name}</span> <br/>
                                        <a href={`mailto:${item.product.seller.email}`} className="text-indigo-600 hover:underline">{item.product.seller.email}</a><br/>
                                        {item.product.seller.phoneno}
                                      </div>
                                    ) : null}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{item.quantity}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">${item.price.toFixed(2)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium text-right">${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-gray-500">
                      <p>No orders found in the database.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Product Modal (Reused) */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Edit Global Product</h3>
                    <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">
                    {message && (
                        <div className={`mb-4 p-3 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {message.text}
                        </div>
                    )}
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Product Name</label>
                            <input 
                                type="text" 
                                value={editingProduct.name} 
                                onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={editingProduct.price} 
                                    onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Stock Level</label>
                                <input 
                                    type="number" 
                                    value={editingProduct.stockLevel} 
                                    onChange={e => setEditingProduct({...editingProduct, stockLevel: parseInt(e.target.value)})}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea 
                                value={editingProduct.description} 
                                onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                                required
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border"
                            />
                        </div>
                        <div className="pt-4 flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className={`px-4 py-2 rounded-md text-sm font-medium text-white shadow-sm ${isSaving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

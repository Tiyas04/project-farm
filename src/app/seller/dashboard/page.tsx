"use client"

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface User {
  _id: string;
  name: string;
  email: string;
  sellerstatus?: string;
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
}

interface OrderItem {
  quantity: number;
  price: number;
  product?: {
    name: string;
    image: string;
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
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderItem[];
}

export default function SellerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [user, setUser] = useState<User | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
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
        // 1. Fetch Profile to ensure they are an approved seller
        const profileRes = await fetch('/api/profile');
        if (profileRes.status === 401) {
          router.push('/');
          return;
        }
        
        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          setUser(profileJson.data);
          
          if (profileJson.data.sellerstatus !== 'approved' && profileJson.data.role !== 'admin') {
            router.push('/seller');
            return;
          }
        }

        // 2. Fetch Seller Products
        const productsRes = await fetch('/api/seller/products');
        if (productsRes.ok) {
          const productsJson = await productsRes.json();
          setProducts(productsJson.data || []);
        }

        // 3. Fetch Seller Orders
        const ordersRes = await fetch('/api/seller/orders');
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

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const res = await fetch(`/api/product/${productId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p._id !== productId));
        alert('Product deleted successfully');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete product');
      }
    } catch (e) {
        alert('An error occurred while deleting');
    }
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
            // Update local state
            setProducts(prev => prev.map(p => p._id === editingProduct._id ? { ...p, ...data.data } : p));
            setTimeout(() => {
                setIsEditModalOpen(false);
            }, 1000);
        } else {
            setMessage({ type: 'error', text: data.message || 'Failed to update' });
        }
    } catch (e) {
        setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
        setIsSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return;
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // Helper to calculate only the subtotal for the seller's specific items in an order
  const calculateSellerSubtotal = (items: OrderItem[]) => {
      return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
      try {
          const res = await fetch(`/api/seller/orders/${orderId}`, {
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

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="grow flex justify-center items-center">
          <svg className="animate-spin h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:truncate sm:text-4xl sm:tracking-tight">
              Seller Dashboard
            </h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
             <button
               onClick={() => router.push('/seller/uploadProduct')}
               className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
             >
               Upload New Product
             </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
              <nav className="flex flex-col p-2 space-y-1">
                <button 
                  onClick={() => setActiveTab('products')}
                  className={`flex items-center text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  My Products ({products.length})
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  My Orders ({orders.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {activeTab === 'products' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                   <h3 className="text-lg font-bold text-gray-900">Manage Products</h3>
                 </div>
                 
                 <div className="divide-y divide-gray-100">
                    {products.length > 0 ? (
                        products.map(product => (
                            <div key={product._id} className="p-6 flex flex-col sm:flex-row gap-6 items-center hover:bg-gray-50 transition-colors">
                                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <img src={product.image} alt={product.name} className="h-full w-full object-cover object-center" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h4 className="text-lg font-medium text-gray-900 truncate">{product.name}</h4>
                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                                        <span className="font-semibold text-gray-900">₹{product.price.toFixed(2)}</span>
                                        <span>Stock: {product.stockLevel} {product.unit}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-3 shrink-0">
                                    <button 
                                      onClick={() => openEditModal(product)} 
                                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteProduct(product._id)} 
                                      className="text-sm font-medium text-red-600 hover:text-red-500"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                           <p>You haven't uploaded any products yet.</p>
                           <button onClick={() => router.push('/uploadProduct')} className="mt-4 inline-block text-green-600 font-medium hover:underline">
                             Upload Product
                           </button>
                         </div>
                    )}
                 </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-lg font-bold text-gray-900">Customer Orders</h3>
                  <p className="text-sm text-gray-500 mt-1">Orders containing your specific products</p>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Order Date: <span className="font-medium text-gray-900">{formatDate(order.createdAt)}</span></p>
                            <p className="text-sm text-gray-500 mb-1">Order ID: <span className="font-medium inline-block text-gray-900">{order._id}</span></p>
                            {order.buyer && (
                              <div className="mt-2 text-sm space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-700">Buyer:</span>
                                  <span className="text-gray-900">{order.buyer.name}</span>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <a href={`mailto:${order.buyer.email}`} className="hover:text-green-600 transition-colors">{order.buyer.email}</a>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>{order.buyer.phoneno}</span>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2 pt-1">
                                  <svg className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <div className="text-gray-600">
                                    <p className="font-medium text-gray-700 text-xs uppercase tracking-wider mb-0.5">Shipping Address:</p>
                                    <p>{order.buyer.address}</p>
                                    <p>{order.buyer.city}, {order.buyer.state} - {order.buyer.pincode}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col sm:items-end gap-2 shrink-0">
                            <select 
                                value={order.status}
                                onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                                disabled={order.status === 'delivered' || order.status === 'cancelled'}
                                className={`text-sm font-bold uppercase tracking-wider rounded-md border border-gray-200 py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-green-600 disabled:opacity-75 disabled:cursor-not-allowed ${
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
                            <span className="font-bold text-gray-900">Your Share: ₹{calculateSellerSubtotal(order.items).toFixed(2)}</span>
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
                                  <td className="px-4 py-3 text-sm text-gray-900 flex items-center gap-3">
                                    {item.product?.image && <img src={item.product?.image} className="h-8 w-8 rounded-md object-cover" />}
                                    <span>{item.product?.name || 'Deleted Product'}</span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{item.quantity}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">₹{item.price.toFixed(2)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-gray-500">
                      <p>No orders yet for your products.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Product Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Edit Product</h3>
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
                                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 border"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={editingProduct.price} 
                                    onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Stock Level</label>
                                <input 
                                    type="number" 
                                    value={editingProduct.stockLevel} 
                                    onChange={e => setEditingProduct({...editingProduct, stockLevel: parseInt(e.target.value)})}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 border"
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
                                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 border"
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
                                className={`px-4 py-2 rounded-md text-sm font-medium text-white shadow-sm ${isSaving ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}`}
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

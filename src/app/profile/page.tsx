"use client"

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  phoneno: string;
  createdAt?: string;
}

interface OrderItem {
  quantity: number;
  price: number;
  product?: {
    name: string;
    price: number;
  };
}

interface Order {
  _id: string;
  status: string;
  totalamount: number;
  createdAt: string;
  items: OrderItem[];
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'password'>('orders');
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({ name: '', email: '', phoneno: '', password: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/order')
        ]);
        
        if (profileRes.status === 401) {
           router.push('/');
           return;
        }

        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          setUser(profileJson.data);
          setFormData({
            name: profileJson.data.name || '',
            email: profileJson.data.email || '',
            phoneno: profileJson.data.phoneno || '',
            password: ''
          });
        }

        if (ordersRes.ok) {
          const ordersJson = await ordersRes.json();
          setOrders(ordersJson.data || []);
        }
      } catch (error) {
        console.error("Error fetching profile data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage(null);
    try {
        const res = await fetch('/api/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const json = await res.json();
        if (res.ok) {
            setUpdateMessage({ type: 'success', text: 'Profile updated successfully!' });
            setUser(json.data);
        } else {
            setUpdateMessage({ type: 'error', text: json.message || 'Failed to update profile.' });
        }
    } catch (err) {
        setUpdateMessage({ type: 'error', text: 'Network error occurred.' });
    } finally {
        setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
        await fetch('/api/logout', { method: 'POST' });
        router.push('/');
    } catch (e) {
        router.push('/');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
        const res = await fetch(`/api/order/${orderId}/cancel`, {
            method: 'PATCH'
        });
        const data = await res.json();
        if (res.ok) {
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'cancelled' } : o));
            alert('Order cancelled successfully.');
        } else {
            alert(data.message || 'Failed to cancel order.');
        }
    } catch(e) {
        alert('An error occurred while cancelling the order.');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
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

  if (!user) return null; // Redirecting handles this

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:truncate sm:text-4xl sm:tracking-tight">
              My Account
            </h2>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
              <nav className="flex flex-col p-2 space-y-1">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Edit Profile
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Past Orders
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-4 border-t border-gray-100"
                >
                  <svg className="mr-3 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* User Information Display Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-2xl font-bold mr-4">
                        {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                        <p className="text-gray-500 text-sm">Member since {formatDate(user.createdAt)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</h4>
                        <p className="text-gray-900 font-medium">{user.email}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</h4>
                        <p className="text-gray-900 font-medium">{user.phoneno || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Profile Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">Edit Profile Information</h3>
                  </div>
                  <div className="p-6">
                    {updateMessage && (
                        <div className={`mb-6 p-4 rounded-md text-sm font-medium ${updateMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {updateMessage.text}
                        </div>
                    )}
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                        <div className="sm:col-span-2">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                          <input 
                            type="text" 
                            id="name" 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500 border" 
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                          <input 
                            type="email" 
                            id="email" 
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500 border" 
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                          <input 
                            type="tel" 
                            id="phone" 
                            value={formData.phoneno}
                            onChange={e => setFormData({...formData, phoneno: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500 border" 
                          />
                        </div>
                        <div className="sm:col-span-2 mt-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password <span className="text-gray-400 font-normal text-xs">(leave blank to keep current password)</span></label>
                            <div className="relative mt-1">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                disabled={isUpdating}
                                className="block w-full rounded-md border-gray-300 pl-4 pr-12 py-3 shadow-sm focus:border-green-500 focus:ring-green-500 border transition-all"
                                placeholder="Enter a new password..."
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-green-600 focus:outline-none"
                              >
                                {showPassword ? (
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                ) : (
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0l1.414 1.414M3 3l18 18" />
                                  </svg>
                                )}
                              </button>
                            </div>
                        </div>
                      </div>
                      <div className="flex justify-end mt-6">
                        <button type="submit" disabled={isUpdating} className={`text-white font-medium py-2 px-6 rounded-md transition-colors shadow-sm ${isUpdating ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                          {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="text-lg font-bold text-gray-900">Past Orders</h3>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Order Placed: <span className="font-medium text-gray-900">{formatDate(order.createdAt)}</span></p>
                            <p className="text-sm text-gray-500 truncate max-w-[200px] sm:max-w-xs">Order ID: <span className="font-medium inline-block text-gray-900">{order._id}</span></p>
                          </div>
                          <div className="flex flex-col sm:items-end gap-2 shrink-0">
                            <span className={`inline-flex px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status}
                            </span>
                            <span className="font-bold text-gray-900">Total: ${order.totalamount?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>

                        <div className="mt-4 border border-gray-100 rounded-lg overflow-hidden bg-white">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {order.items.map((item, idx) => (
                                <tr key={idx}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.product?.name || 'Deleted Product'}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{item.quantity}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">${(item.price || item.product?.price || 0).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="mt-4 flex justify-end gap-4 items-center">
                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <button 
                              onClick={() => handleCancelOrder(order._id)}
                              className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-md"
                            >
                              Cancel Order
                            </button>
                          )}
                          <Link href={`#`} className="text-sm font-medium text-gray-400 hover:text-green-500 transition-colors">
                            Need help? <span aria-hidden="true">&rarr;</span>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-gray-500">
                      <p>You haven't placed any orders yet.</p>
                      <Link href="/products" className="mt-4 inline-block text-green-600 font-medium hover:underline">
                        Start Shopping
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

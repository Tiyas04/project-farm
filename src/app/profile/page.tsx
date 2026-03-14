"use client"

import React, { useState } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Mock User Data
const MOCK_USER = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  phone: '+1 (555) 123-4567',
  address: '123 Farm Lane, Ruralville, CA 90210',
  memberSince: 'March 2023'
};

// Mock Order History Data
const MOCK_ORDERS = [
  {
    id: 'ORD-2024-001',
    date: 'Oct 15, 2023',
    status: 'Delivered',
    total: 35.98,
    items: [
      { name: 'Organic Fertilizer', quantity: 1, price: 25.99 },
      { name: 'Tomato Seeds', quantity: 2, price: 4.99 }
    ]
  },
  {
    id: 'ORD-2024-002',
    date: 'Nov 02, 2023',
    status: 'Processing',
    total: 104.49,
    items: [
      { name: 'Drip Irrigation Kit', quantity: 1, price: 89.99 },
      { name: 'Neem Oil Pesticide', quantity: 1, price: 15.49 },
      { name: 'Shipping', quantity: 1, price: 5.00 } // Including shipping as an item for simplicity here if we want or just let total handle it
    ]
  }
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'password'>('orders');
  const router = useRouter();

  const handleLogout = () => {
    // In a real app, clear auth tokens here
    router.push('/');
  };
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
                  onClick={() => setActiveTab('password')}
                  className={`flex items-center text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'password' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Change Password
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
                        {MOCK_USER.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{MOCK_USER.name}</h3>
                        <p className="text-gray-500 text-sm">Member since {MOCK_USER.memberSince}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</h4>
                        <p className="text-gray-900 font-medium">{MOCK_USER.email}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</h4>
                        <p className="text-gray-900 font-medium">{MOCK_USER.phone}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Shipping Address</h4>
                        <p className="text-gray-900 font-medium">{MOCK_USER.address}</p>
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
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                        <div className="sm:col-span-2">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                          <input type="text" id="name" defaultValue={MOCK_USER.name} className="mt-1 block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500 border" />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                          <input type="email" id="email" defaultValue={MOCK_USER.email} className="mt-1 block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500 border" />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                          <input type="tel" id="phone" defaultValue={MOCK_USER.phone} className="mt-1 block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500 border" />
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Shipping Address</label>
                          <textarea id="address" rows={3} defaultValue={MOCK_USER.address} className="mt-1 block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500 border" />
                        </div>
                      </div>
                      <div className="flex justify-end mt-6">
                        <button type="button" className="bg-green-600 text-white hover:bg-green-700 font-medium py-2 px-6 rounded-md transition-colors shadow-sm">
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
                </div>
                <div className="p-6">
                  <form className="space-y-6 max-w-md">
                    <div>
                      <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">Current Password</label>
                      <input type="password" id="current-password" placeholder="••••••••" className="mt-1 block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500 border" />
                    </div>
                    <div>
                      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">New Password</label>
                      <input type="password" id="new-password" placeholder="••••••••" className="mt-1 block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500 border" />
                    </div>
                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                      <input type="password" id="confirm-password" placeholder="••••••••" className="mt-1 block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500 border" />
                    </div>
                    <div className="pt-2">
                      <button type="button" className="bg-green-600 text-white hover:bg-green-700 font-medium py-2 px-6 rounded-md transition-colors shadow-sm">
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="text-lg font-bold text-gray-900">Past Orders</h3>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {MOCK_ORDERS.length > 0 ? (
                    MOCK_ORDERS.map((order) => (
                      <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Order Placed: <span className="font-medium text-gray-900">{order.date}</span></p>
                            <p className="text-sm text-gray-500">Order ID: <span className="font-medium text-gray-900">{order.id}</span></p>
                          </div>
                          <div className="flex flex-col sm:items-end gap-2">
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                              order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                            <span className="font-bold text-gray-900">Total: ${order.total.toFixed(2)}</span>
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
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{item.quantity}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">${item.price.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Link href={`#`} className="text-sm font-medium text-green-600 hover:text-green-500">
                            View Invoice <span aria-hidden="true">&rarr;</span>
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

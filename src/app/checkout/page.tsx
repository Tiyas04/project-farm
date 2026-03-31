"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/navbar';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const firstName = formData.get('first-name') as string;
    const lastName = formData.get('last-name') as string;
    
    const payload = {
        fullName: `${firstName} ${lastName}`.trim(),
        email: formData.get('email') as string,
        phoneno: Number(formData.get('phoneno')),
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        pincode: formData.get('pincode') as string,
        paymentMethod: formData.get('payment-method') as string || 'COD'
    };

    try {
        const res = await fetch('/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            setIsSuccess(true);
            clearCart();
        } else {
            const data = await res.json();
            alert(data.message || 'Checkout failed');
        }
    } catch (error) {
        alert('An error occurred during checkout');
    } finally {
        setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100">
            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Order Confirmed!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for supporting our farm. Your fresh produce will be on its way soon.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8">
          <Link href="/cart" className="text-green-600 hover:text-green-700 flex items-center text-sm font-medium">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Cart
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                    <div className="mt-1">
                      <input type="email" id="email" name="email" required className="block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500 border" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phoneno" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <div className="mt-1">
                      <input type="tel" id="phoneno" name="phoneno" required className="block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500 border" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Details</h2>
                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">First name</label>
                    <div className="mt-1">
                      <input type="text" id="first-name" name="first-name" required className="block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500 border" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">Last name</label>
                    <div className="mt-1">
                      <input type="text" id="last-name" name="last-name" required className="block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500 border" />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                    <div className="mt-1">
                      <input type="text" id="address" name="address" required className="block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500 border" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                    <div className="mt-1">
                      <input type="text" id="city" name="city" required className="block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500 border" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State / Province</label>
                    <div className="mt-1">
                      <input type="text" id="state" name="state" required className="block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500 border" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">Postal Code (Pincode)</label>
                    <div className="mt-1">
                      <input type="text" id="pincode" name="pincode" required className="block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500 border" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment</h2>
                <div className="space-y-4">
                  <div className="flex items-start sm:items-center p-4 border rounded-lg border-green-500 bg-green-50 cursor-pointer">
                    <input id="payment-cod" name="payment-method" type="radio" value="cod" defaultChecked className="mt-1 sm:mt-0 h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500" />
                    <div className="ml-3 flex flex-col">
                      <label htmlFor="payment-cod" className="block text-sm font-medium text-gray-900">
                        Cash on Delivery (COD)
                      </label>
                      <span className="text-sm text-gray-500 mt-1">Pay with cash upon delivery. No upfront payment required.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-sm text-base font-medium text-white ${isProcessing ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all`}
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Order...
                    </span>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Checkout Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              <ul className="text-sm border-b border-gray-200 pb-6 mb-6 divide-y divide-gray-100">
                {cartItems.map(item => (
                  <li key={item.id} className="flex justify-between py-3">
                    <div className="flex">
                      <span className="font-medium text-gray-900">{item.name}</span>
                      <span className="ml-2 text-gray-500 text-xs">x {item.quantity}</span>
                    </div>
                    <span className="text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>

              <dl className="space-y-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="font-medium text-gray-900">₹{cartTotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Shipping</dt>
                  <dd className="font-medium text-gray-900">₹5.00</dd>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-bold text-gray-900">Total to pay</dt>
                  <dd className="text-base font-bold text-gray-900 text-green-600">₹{(cartTotal + (cartItems.length > 0 ? 5 : 0)).toFixed(2)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

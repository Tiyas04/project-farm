"use client";

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Navbar from '@/components/navbar';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  const shipping = 5.00;
  const total = cartTotal + (cartItems.length > 0 ? shipping : 0);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <div className="lg:col-span-8">
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <svg className="mx-auto h-24 w-24 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Looks like you haven't added any fresh produce yet.</p>
                <Link href="/products" className="inline-block bg-green-600 px-6 py-3 rounded-lg text-white font-medium hover:bg-green-700 transition-colors shadow-sm">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <ul className="space-y-6">
                {cartItems.map((item) => (
                  <li key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                      {item.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <span className="text-green-800 font-medium tracking-wider text-xs p-2 text-center">ITEM</span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between sm:items-start gap-4 flex-col sm:flex-row">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                          <p className="mt-1 text-sm text-gray-500">Fresh from farm</p>
                        </div>
                        <p className="text-lg font-bold text-gray-900 mt-2 sm:mt-0">${item.price.toFixed(2)}</p>
                      </div>

                      <div className="mt-4 flex flex-1 items-end justify-between">
                        <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50 p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 px-3 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors focus:outline-none"
                          >
                            &minus;
                          </button>
                          <span className="px-4 text-sm font-medium text-gray-900 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 px-3 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors focus:outline-none"
                          >
                            &#43;
                          </button>
                        </div>

                        <div className="ml-4">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-sm font-medium text-red-500 hover:text-red-600 hover:underline transition-colors focus:outline-none p-2 rounded-md hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Order summary */}
          {cartItems.length > 0 && (
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>

                <dl className="space-y-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <dt>Subtotal</dt>
                    <dd className="font-medium text-gray-900">${cartTotal.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-4">
                    <dt className="flex items-center text-gray-600">
                      <span>Shipping estimate</span>
                    </dt>
                    <dd className="font-medium text-gray-900">${shipping.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-4">
                    <dt className="text-base font-bold text-gray-900">Order total</dt>
                    <dd className="text-base font-bold text-gray-900">${total.toFixed(2)}</dd>
                  </div>
                </dl>

                <div className="mt-8">
                  <Link
                    href="/checkout"
                    className="w-full flex justify-center items-center rounded-lg bg-green-600 hover:bg-green-700 px-6 py-4 text-base font-semibold text-white shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
                
                <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                  <p>
                    or{' '}
                    <Link href="/products" className="font-medium text-green-600 hover:text-green-500">
                      Continue Shopping<span aria-hidden="true"> &rarr;</span>
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

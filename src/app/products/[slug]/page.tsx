"use client"

import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Link from "next/link";
import { use } from "react";
import { useCart } from "@/context/CartContext";
import { MOCK_PRODUCTS } from "@/lib/products";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { addToCart } = useCart();
    const { slug } = use(params);
    const productId = parseInt(slug);
    const product = MOCK_PRODUCTS.find(p => p.id === productId) || MOCK_PRODUCTS[0];
    const [quantity, setQuantity] = useState(1);

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <Navbar />
            <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Breadcrumbs */}
                <div className="mb-8 flex items-center text-sm text-gray-500">
                    <Link href="/" className="hover:text-green-700">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/products" className="hover:text-green-700">Products</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">{product.category}</span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">{product.name}</span>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        {/* Product Image section */}
                        <div className="bg-gray-100 flex items-center justify-center p-12 min-h-[400px] overflow-hidden">
                            {product.image ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover object-center rounded-xl shadow-sm" />
                            ) : (
                                <svg className="w-32 h-32 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            )}
                        </div>

                        {/* Product Details Section */}
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                            <span className="text-green-700 font-semibold tracking-wider text-sm mb-2">{product.category.toUpperCase()}</span>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                            <p className="text-2xl font-black text-gray-900 mb-6">${product.price.toFixed(2)}</p>
                            
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                {product.longDescription || product.description}
                            </p>

                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest mb-3">Key Features</h3>
                                <ul className="space-y-2">
                                    {(product.features || []).map((feature, idx) => (
                                        <li key={idx} className="flex items-center text-gray-600">
                                            <svg className="w-5 h-5 text-green-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 items-end mt-auto pt-8 border-t border-gray-100">
                                <div className="w-full sm:w-32">
                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                    <div className="flex items-center border border-gray-300 rounded-md">
                                        <button 
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                                        >-</button>
                                        <input 
                                            type="number" 
                                            id="quantity" 
                                            min="0" 
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-full text-center text-gray-500 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                                        />
                                        <button 
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                                        >+</button>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => addToCart({ ...product, id: String(product.id), quantity })}
                                    className="flex-1 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md transition-colors shadow-md flex justify-center items-center cursor-pointer"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
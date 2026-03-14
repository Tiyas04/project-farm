"use client"

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useCart } from "@/context/CartContext";
import { MOCK_PRODUCTS } from "@/lib/products";

const CATEGORIES = ["All", "Fertilizers", "Pesticides", "Seeds", "Equipment"];

export default function ProductsPage() {
    const { addToCart } = useCart();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const filteredProducts = MOCK_PRODUCTS.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <section className="mb-12">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <h2 className="text-3xl font-bold text-gray-900">Products</h2>
                        
                        {/* Search and Filter Controls */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <input 
                                    type="text" 
                                    placeholder="Search products..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white shadow-sm"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            
                            <select 
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full sm:w-48 py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white shadow-sm cursor-pointer"
                            >
                                {CATEGORIES.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                            <h3 className="text-xl text-gray-600">No products found for your search.</h3>
                            <button 
                                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                                className="mt-4 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-md transition-colors"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                                    <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {product.image ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover object-center" />
                                        ) : (
                                            <span className="text-green-800 font-medium tracking-wider text-sm">{product.category.toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="p-4 flex flex-col grow">
                                        <Link href={`/products/${product.id}`} className="hover:text-green-700 transition-colors">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                                        </Link>
                                        <p className="text-gray-600 mb-4 text-sm grow">{product.description}</p>
                                        <div className="text-xl font-bold text-gray-900 mb-4">${product.price.toFixed(2)}</div>
                                        <div className="flex items-center justify-between gap-2 mt-auto">
                                            <button 
                                                onClick={() => addToCart({ ...product, id: String(product.id), quantity: 1 })}
                                                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors cursor-pointer"
                                            >
                                                Add to Cart
                                            </button>
                                            <Link href={`/products/${product.id}`} className="flex-1 block">
                                                <button className="w-full py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-md text-sm font-medium transition-colors cursor-pointer">
                                                    Details
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
}
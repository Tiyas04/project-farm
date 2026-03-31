"use client"

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import Footer from "@/components/footer";
import { useCart } from "@/context/CartContext";
import Link from 'next/link';

export default function Home() {
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getFeaturedProducts() {
        try {
            const res = await fetch('/api/product');
            const data = await res.json();
            if (data.success && data.data) {
                // Return only 4 for the featured section
                setFeaturedProducts(data.data.slice(0, 4));
            }
        } catch (error) {
            console.error("Failed to fetch featured products for home page", error);
        } finally {
            setIsLoading(false);
        }
    }
    getFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <Hero />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Featured Products</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20 w-full">
                <svg className="animate-spin h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-500 font-medium bg-white rounded-lg shadow-sm border border-gray-100">
                No featured products currently available in the database.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                    <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                        <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                            {product.image ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover object-center" />
                            ) : (
                                <span className="text-green-800 font-medium tracking-wider text-sm">{product.category.toUpperCase()}</span>
                            )}
                        </div>
                        <div className="p-4 flex flex-col grow">
                            <Link href={`/products/${product._id}`} className="hover:text-green-700 transition-colors">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                            </Link>
                            <p className="text-gray-600 mb-4 text-sm grow">{product.description}</p>
                            <div className="text-xl font-bold text-gray-900 mb-4">₹{product.price.toFixed(2)} <span className="text-sm font-medium text-gray-500">/ {product.unit || 'item'}</span></div>
                            <div className="flex items-center justify-between gap-2 mt-auto">
                                <button 
                                    onClick={() => addToCart({ ...product, id: String(product._id), quantity: 1 })}
                                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors cursor-pointer"
                                >
                                    Add to Cart
                                </button>
                                <Link href={`/products/${product._id}`} className="flex-1 block">
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

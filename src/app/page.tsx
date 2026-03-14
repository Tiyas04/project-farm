"use client"

import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import Footer from "@/components/footer";
import { useCart } from "@/context/CartContext";
import { MOCK_PRODUCTS } from "@/lib/products";
import Link from 'next/link';

export default function Home() {
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <Hero />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_PRODUCTS.slice(0, 4).map((product) => (
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
        </section>
      </main>
      <Footer />
    </div>
  );
}

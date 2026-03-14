"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import AuthModal from './authmodal';

export default function Navbar() {
    const { cartCount } = useCart();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authView, setAuthView] = useState<'login' | 'signup'>('login');

    const openLogin = () => {
        setAuthView('login');
        setIsAuthModalOpen(true);
    };

    const openSignup = () => {
        setAuthView('signup');
        setIsAuthModalOpen(true);
    };
    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <div className="shrink-0">
                            <span className="text-2xl font-bold text-green-600">FarmConnect</span>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link href="/" className="text-gray-900 hover:bg-green-50 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                                <Link href="/products" className="text-gray-900 hover:bg-green-50 px-3 py-2 rounded-md text-sm font-medium">Products</Link>
                                <Link href="/cart" className="text-gray-900 hover:bg-green-50 px-3 py-2 rounded-md text-sm font-medium relative">
                                    Cart
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-2 bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                                <Link href="/profile" className="text-gray-900 hover:bg-green-50 px-3 py-2 rounded-md text-sm font-medium">Profile</Link>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <button onClick={openLogin} className="text-gray-900 hover:bg-green-50 px-3 py-2 rounded-md text-sm font-medium">Login</button>
                        <button onClick={openSignup} className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium">Sign Up</button>
                    </div>
                </div>
            </div>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialView={authView} />
        </nav>
    );
}
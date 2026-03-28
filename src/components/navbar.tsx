"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import AuthModal from './authmodal';

export default function Navbar() {
    const { cartCount } = useCart();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authView, setAuthView] = useState<'login' | 'signup'>('login');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/profile');
                if (res.ok) {
                    setIsLoggedIn(true);
                } else {
                    setIsLoggedIn(false);
                }
            } catch (e) {
                console.error("Auth check failed", e);
            }
        };
        checkAuth();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
            setIsLoggedIn(false);
            window.location.href = '/'; 
        } catch (e) {
            console.error("Logout failed", e);
        }
    };

    const openLogin = () => {
        setAuthView('login');
        setIsAuthModalOpen(true);
        setIsMobileMenuOpen(false); 
    };

    const openSignup = () => {
        setAuthView('signup');
        setIsAuthModalOpen(true);
        setIsMobileMenuOpen(false);
    };

    useEffect(() => {
        const handleRequireAuth = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail === 'login') openLogin();
            else openSignup();
        };
        window.addEventListener('require-auth', handleRequireAuth);
        return () => window.removeEventListener('require-auth', handleRequireAuth);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <>
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="shrink-0 flex items-center">
                            <span className="text-2xl font-bold text-green-600 tracking-tight">FarmConnect</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-1 ml-10">
                        <Link href="/" className="text-gray-700 hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
                        <Link href="/products" className="text-gray-700 hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">Products</Link>
                        <Link href="/contact" className="text-gray-700 hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">Contact Us</Link>
                        {isLoggedIn && (
                            <Link href="/profile" className="text-gray-700 hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">Profile</Link>
                        )}
                    </div>

                    {/* Desktop Right Side Controls */}
                    <div className="hidden md:flex items-center space-x-2">
                        <Link href="/cart" className="text-gray-700 hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded-md text-sm font-medium relative mx-2 transition-colors flex items-center">
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            Cart
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform scale-90 border-2 border-white shadow-sm">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <div className="w-px h-6 bg-gray-200 mx-2"></div>
                        
                        {!isLoggedIn ? (
                            <>
                                <button onClick={openLogin} className="text-gray-700 hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer">Login</button>
                                <button onClick={openSignup} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium shadow-sm transition-colors cursor-pointer">Sign Up</button>
                            </>
                        ) : (
                            <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium shadow-sm transition-colors cursor-pointer">Logout</button>
                        )}
                    </div>

                    {/* Mobile Menu Button & Cart icon visible alongside it */}
                    <div className="flex md:hidden items-center gap-4">
                        <Link href="/cart" className="text-gray-700 hover:text-green-600 relative transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <button 
                            onClick={toggleMobileMenu}
                            type="button" 
                            className="inline-flex items-center justify-center text-gray-700 hover:text-green-600 focus:outline-none transition-colors"
                            aria-label="Open menu"
                        >
                            <svg className="block h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialView={authView} />
        </nav>

        {/* --- MOBILE DRAWER PATTERN --- */}
        
        {/* Backdrop Overlay */}
        {isMobileMenuOpen && (
            <div 
                className="md:hidden fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[140] transition-opacity duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
            />
        )}

        {/* Drawer Panel */}
        <div className={`md:hidden fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white shadow-2xl z-[150] transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <span className="text-xl font-bold text-gray-900 tracking-wide">Menu</span>
                <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-500 hover:text-gray-800 transition-colors bg-gray-100/80 hover:bg-gray-200 p-2 rounded-full cursor-pointer"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Links Block */}
            <div className="flex-1 overflow-y-auto py-8 px-6 space-y-6">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center text-gray-700 hover:text-green-600 group transition-colors">
                    <svg className="w-6 h-6 mr-4 text-gray-400 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    <span className="text-lg font-medium">Home</span>
                </Link>
                
                <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center text-gray-700 hover:text-green-600 group transition-colors">
                    <svg className="w-6 h-6 mr-4 text-gray-400 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                    <span className="text-lg font-medium">Products</span>
                </Link>

                <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center text-gray-700 hover:text-green-600 group transition-colors">
                    <svg className="w-6 h-6 mr-4 text-gray-400 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    <span className="text-lg font-medium">Contact Us</span>
                </Link>

                {isLoggedIn && (
                    <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center text-gray-700 hover:text-green-600 group transition-colors mt-8 pt-8 border-t border-gray-100">
                        <svg className="w-6 h-6 mr-4 text-gray-400 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                        <span className="text-lg font-medium">My Profile</span>
                    </Link>
                )}
            </div>

            {/* Auth Block Drawer Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50">
                {!isLoggedIn ? (
                    <div className="space-y-3">
                        <button 
                            onClick={openLogin} 
                            className="w-full text-center px-4 py-3.5 bg-white hover:bg-gray-100 text-gray-800 rounded-xl text-[15px] font-medium shadow-sm transition-colors border border-gray-200 cursor-pointer"
                        >
                            Sign In
                        </button>
                        <button 
                            onClick={openSignup} 
                            className="w-full text-center flex items-center justify-center px-4 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[15px] font-medium shadow-md shadow-green-600/20 transition-colors cursor-pointer"
                        >
                            Create Account
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center justify-center px-4 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[15px] font-medium border border-red-200 transition-colors cursor-pointer"
                    >
                        Secure Logout
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                )}
            </div>
        </div>
        </>
    );
}
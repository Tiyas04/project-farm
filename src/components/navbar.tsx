"use client"

export default function Navbar() {
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
                                <a href="/" className="text-gray-900 hover:bg-green-50 px-3 py-2 rounded-md text-sm font-medium">Home</a>
                                <a href="/products" className="text-gray-900 hover:bg-green-50 px-3 py-2 rounded-md text-sm font-medium">Products</a>
                                <a href="/about" className="text-gray-900 hover:bg-green-50 px-3 py-2 rounded-md text-sm font-medium">About</a>
                                <a href="/contact" className="text-gray-900 hover:bg-green-50 px-3 py-2 rounded-md text-sm font-medium">Contact</a>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <button className="text-gray-900 hover:bg-green-50 px-3 py-2 rounded-md text-sm font-medium">Login</button>
                        <button className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium">Sign Up</button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
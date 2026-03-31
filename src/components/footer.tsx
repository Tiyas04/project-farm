"use client"

export default function Footer() {
    return (
        <footer className="bg-green-900 text-white mt-12 border-t border-green-800 rounded-t-4xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">FarmConnect</h3>
                        <p className="text-sm text-green-200">
                            Your one-stop solution for all agricultural needs. Providing quality products and services to farmers across the region.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><a href="/" className="text-sm text-green-200 hover:text-white transition-colors">Home</a></li>
                            <li><a href="/products" className="text-sm text-green-200 hover:text-white transition-colors">Products</a></li>
                            <li><a href="/contact" className="text-sm text-green-200 hover:text-white transition-colors">Contact</a></li>
                            <li><a href="/seller" className="text-sm text-green-200 hover:text-white transition-colors">Become a seller</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-2">
                            <li className="text-sm text-green-200">Email: [EMAIL_ADDRESS]</li>
                            <li className="text-sm text-green-200">Phone: +123 456 7890</li>
                            <li className="text-sm text-green-200">Address: 123 Green Valley, Agro City</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-green-800 mt-8 pt-8 text-center">
                    <p className="text-sm text-green-400">
                        &copy; {new Date().getFullYear()} FarmConnect. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
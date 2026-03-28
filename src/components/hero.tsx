"use client"

export default function Hero() {
    return (
        <section className="relative h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden">
            {/* Background Image - using a stock photo of a wheat field similar to the user's design */}
            <div 
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ 
                    backgroundImage: "url('https://www.shutterstock.com/image-photo/farmer-walks-through-vibrant-cornfield-260nw-2676016547.jpg')",
                    filter: "brightness(0.9)"
                }}
            ></div>
            
            {/* Overlays to match the warm/dark tone of the original image */}
            <div className="absolute inset-0 bg-black/20 z-10"></div>
            <div className="absolute inset-0 bg-linear-to-t from-green-900/40 via-transparent to-transparent z-10"></div>

            {/* Content */}
            <div className="relative z-20 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-wide drop-shadow-md uppercase">
                    Farming Products
                </h1>
                <p className="text-sm md:text-base text-gray-50 mb-8 max-w-2xl mx-auto font-medium drop-shadow-sm leading-relaxed">
                    Eco friendly products are "products that do not harm the environment whether in their production, use or disposal". In other words, these products help preserve the environment by significantly reducing the pollution they could produce.
                </p>
                <a href="/products" className="px-6 py-3 bg-white hover:bg-gray-100 text-green-900 font-bold text-sm tracking-widest uppercase transition-colors shadow-lg">
                    Explore Products
                </a>
            </div>
        </section>
    );
}

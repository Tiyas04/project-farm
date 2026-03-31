"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

type ProductFormState = {
    id: string;
    name: string;
    description: string;
    price: string;
    category: string;
    stockLevel: string;
    fssaino: string;
    unit: string;
    image: File | null;
    preview: string | null;
};

const defaultProduct = (): ProductFormState => ({
    id: Math.random().toString(36).substring(7),
    name: "",
    description: "",
    price: "",
    category: "",
    stockLevel: "",
    fssaino: "",
    unit: "mg",
    image: null,
    preview: null,
});

export default function UploadProductPage() {
    const [products, setProducts] = useState<ProductFormState[]>([defaultProduct()]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleAddProduct = () => {
        setProducts([...products, defaultProduct()]);
    };

    const handleRemoveProduct = (index: number) => {
        if (products.length === 1) return; // Prevent deleting the last one
        const newProducts = [...products];
        newProducts.splice(index, 1);
        setProducts(newProducts);
    };

    const handleChange = (index: number, e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const newProducts = [...products];
        newProducts[index] = { ...newProducts[index], [e.target.name]: e.target.value };
        setProducts(newProducts);
    };

    const handleImageChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const newProducts = [...products];
            newProducts[index] = { 
                ...newProducts[index], 
                image: file, 
                preview: URL.createObjectURL(file) 
            };
            setProducts(newProducts);
        }
    };

    const triggerFileInput = (index: number) => {
        const fileInput = document.getElementById(`file-upload-${index}`) as HTMLInputElement;
        if (fileInput) fileInput.click();
    };

    const handleRemoveImage = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newProducts = [...products];
        newProducts[index] = { ...newProducts[index], image: null, preview: null };
        setProducts(newProducts);
        
        const fileInput = document.getElementById(`file-upload-${index}`) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setNotification(null);

        // Validation
        const isMissingImages = products.some(p => !p.image);
        if (isMissingImages) {
            setNotification({ type: "error", text: "Please add an image for all products." });
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        try {
            const uploadData = new FormData();
            const isArray = products.length > 1;

            products.forEach((product, i) => {
                uploadData.append("name", product.name);
                uploadData.append("description", product.description);
                uploadData.append("price", product.price);
                uploadData.append("category", product.category);
                uploadData.append("stockLevel", product.stockLevel);
                uploadData.append("fssaino", product.fssaino);
                uploadData.append("unit", product.unit);

                if (product.image) {
                    if (isArray) {
                        uploadData.append(`images_${i}`, product.image);
                    } else {
                        uploadData.append("image", product.image);
                    }
                }
            });

            const response = await fetch("/api/product", {
                method: "POST",
                body: uploadData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setNotification({ type: "success", text: products.length > 1 ? "Products uploaded successfully!" : "Product uploaded successfully!" });
                setProducts([defaultProduct()]);
            } else {
                setNotification({ type: "error", text: data.message || "Failed to upload product(s)." });
            }
        } catch (error) {
            console.error("Upload error:", error);
            setNotification({ type: "error", text: "An error occurred while uploading. Please try again." });
        } finally {
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Global Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-8 py-8 text-white text-left flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">Upload Products</h1>
                            <p className="text-green-50 text-base">Fill out the details below to add products to Project Farm.</p>
                        </div>
                        <button 
                            type="button" 
                            onClick={handleAddProduct}
                            className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            Add Another Product
                        </button>
                    </div>
                </div>

                {/* Notification Banner */}
                {notification && (
                    <div className={`rounded-xl shadow-sm px-6 py-4 border ${notification.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                        <div className="flex items-center">
                            {notification.type === 'success' ? (
                                <svg className="w-6 h-6 mr-3 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            ) : (
                                <svg className="w-6 h-6 mr-3 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            )}
                            <p className="font-medium text-sm md:text-base">{notification.text}</p>
                        </div>
                    </div>
                )}

                {/* Form Elements wrapper */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {products.map((product, index) => (
                        <div key={product.id} className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col space-y-8 relative">
                            
                            {/* Product Header & Delete Button */}
                            <div className="flex justify-between items-center border-b pb-4">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                    <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                                        {index + 1}
                                    </span>
                                    Product Details
                                </h2>
                                {products.length > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveProduct(index)}
                                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        Delete
                                    </button>
                                )}
                            </div>

                            {/* Image Upload Area */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image *</label>
                                <div 
                                    onClick={() => triggerFileInput(index)}
                                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${product.preview ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'}`}
                                >
                                    <div className="space-y-2 text-center relative w-full flex flex-col items-center">
                                        {product.preview ? (
                                            <div className="relative group rounded-lg overflow-hidden w-full max-w-xs aspect-square border-2 border-green-100 shadow-sm">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={product.preview} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button type="button" onClick={(e) => handleRemoveImage(index, e)} className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50 focus:outline-none transition-colors transform hover:scale-105">
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-6">
                                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <div className="text-sm text-gray-600">
                                                    <span className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none">
                                                        <span>Upload a file</span>
                                                    </span>
                                                    <p className="pl-1 inline">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            id={`file-upload-${index}`}
                                            onChange={(e) => handleImageChange(index, e)} 
                                            accept="image/png, image/jpeg, image/gif, image/webp" 
                                            className="sr-only" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Two Column Layout for Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={product.name}
                                        onChange={(e) => handleChange(index, e)}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-4 py-3 border bg-gray-50 hover:bg-white transition-colors"
                                        placeholder="e.g. Organic Cow Milk"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                                    <input
                                        type="text"
                                        name="category"
                                        required
                                        value={product.category}
                                        onChange={(e) => handleChange(index, e)}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-4 py-3 border bg-gray-50 hover:bg-white transition-colors"
                                        placeholder="e.g. Dairy, Beverage (comma separated)"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                                <textarea
                                    name="description"
                                    required
                                    rows={4}
                                    value={product.description}
                                    onChange={(e) => handleChange(index, e)}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-4 py-3 border bg-gray-50 hover:bg-white transition-colors resize-none"
                                    placeholder="Describe the product details clearly..."
                                />
                            </div>

                            {/* Three Column Layout for Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">₹</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="price"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={product.price}
                                            onChange={(e) => handleChange(index, e)}
                                            className="block w-full pl-8 rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500 sm:text-sm px-4 py-3 border bg-gray-50 hover:bg-white transition-colors"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Level *</label>
                                    <input
                                        type="number"
                                        name="stockLevel"
                                        required
                                        min="0"
                                        value={product.stockLevel}
                                        onChange={(e) => handleChange(index, e)}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-4 py-3 border bg-gray-50 hover:bg-white transition-colors"
                                        placeholder="Available quantity"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Unit *</label>
                                    <select
                                        name="unit"
                                        required
                                        value={product.unit}
                                        onChange={(e) => handleChange(index, e)}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-4 py-3 border bg-gray-50 hover:bg-white transition-colors"
                                    >
                                        <option value="mg">Milligram (mg)</option>
                                        <option value="g">Gram (g)</option>
                                        <option value="kg">Kilogram (kg)</option>
                                        <option value="ml">Milliliter (ml)</option>
                                        <option value="l">Liter (l)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">FSSAI Number *</label>
                                <input
                                    type="text"
                                    name="fssaino"
                                    required
                                    value={product.fssaino}
                                    onChange={(e) => handleChange(index, e)}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-4 py-3 border bg-gray-50 hover:bg-white transition-colors"
                                    placeholder="Enter FSSAI registration number"
                                />
                            </div>
                        </div>
                    ))}

                    {/* Submit Area */}
                    <div className="pt-4 flex justify-end sticky bottom-6 z-10">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full md:w-auto px-10 py-4 border border-transparent rounded-xl shadow-xl text-lg font-bold text-white transition-all transform hover:-translate-y-1
                                ${loading ? 'bg-green-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'}`}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading {products.length > 1 ? `All ${products.length} Products` : "Product"}...
                                </span>
                            ) : (
                                <span>Upload {products.length > 1 ? `All ${products.length} Products` : "Product"}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

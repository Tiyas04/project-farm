"use client"

import React, { useState } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponse(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setResponse({ type: 'success', message: data.message });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setResponse({ type: 'error', message: data.message || 'Something went wrong.' });
      }
    } catch (error) {
      setResponse({ type: 'error', message: 'Failed to send message. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="grow">
        {/* Hero Section */}
        <div className="relative bg-green-600 py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Get in Touch
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Have questions or want to collaborate? We'd love to hear from you. Our team is here to help you grow your farm and connect with buyers.
            </p>
          </div>
        </div>

        {/* Contact Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
                
                {response && (
                  <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${response.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {response.message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none resize-none"
                      placeholder="Tell us more about your inquiry..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all active:scale-95 ${isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-green-200 cursor-pointer'}`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Info Card */}
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                {/* Info Card 1 */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-start gap-5 hover:shadow-lg transition-all transform hover:-translate-y-1">
                  <div className="bg-green-100 p-3 rounded-xl text-green-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Email Us</h4>
                    <p className="text-gray-500 mb-1">Our friendly team is here to help.</p>
                    <a href="mailto:support@farmconnect.com" className="text-green-600 font-semibold hover:underline">support@farmconnect.com</a>
                  </div>
                </div>

                {/* Info Card 2 */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-start gap-5 hover:shadow-lg transition-all transform hover:-translate-y-1">
                  <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Call Us</h4>
                    <p className="text-gray-500 mb-1">Mon-Fri from 8am to 5pm.</p>
                    <a href="tel:+1555000000" className="text-blue-600 font-semibold hover:underline">+1 (555) 000-0000</a>
                  </div>
                </div>

                {/* Info Card 3 */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-start gap-5 hover:shadow-lg transition-all transform hover:-translate-y-1">
                  <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Visit Us</h4>
                    <p className="text-gray-500 mb-1">Come say hello at our office.</p>
                    <p className="text-gray-900 font-semibold">123 Farm Way, Greenhouse City, FC 45678</p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-gray-100 rounded-2xl h-full min-h-[200px] border border-gray-200 relative overflow-hidden flex items-center justify-center">
                 <div className="absolute inset-0 bg-[radial-gradient(#ccc_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
                 <div className="relative text-center p-6">
                    <div className="w-12 h-12 bg-red-500 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg animate-bounce">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Our Headquarters</p>
                    <h5 className="text-lg font-bold text-gray-800">Greenhouse City</h5>
                 </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-24">
             <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Common Questions</h2>
                <div className="h-1.5 w-20 bg-green-600 mx-auto mt-4 rounded-full"></div>
             </div>
             
             <div className="max-w-3xl mx-auto space-y-4">
               {[
                 { q: "How do I start selling on FarmConnect?", a: "To become a seller, click on the 'Seller' link in the top menu and apply by providing your FSSAI and other government details. Once approved, you can start uploading your products!" },
                 { q: "What are the shipping charges?", a: "Shipping charges vary based on distance and product weight. You can see the final delivery cost on the checkout page before payment." },
                 { q: "Is registration free for farmers?", a: "Yes, registration is completely free for both farmers and buyers. We only charge a small platform fee on successful sales." },
                 { q: "How do I track my order?", a: "You can track your orders in your profile section under 'Order History'. We also send status updates via email." }
               ].map((faq, idx) => (
                 <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:border-green-200 transition-colors">
                    <details className="group">
                        <summary className="flex items-center justify-between p-5 cursor-pointer list-none decoration-none">
                            <h4 className="text-lg font-semibold text-gray-800 group-open:text-green-600 transition-colors">{faq.q}</h4>
                            <span className="text-gray-400 group-open:rotate-180 transition-transform">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </summary>
                        <div className="px-5 pb-5 text-gray-600 leading-relaxed">
                            {faq.a}
                        </div>
                    </details>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

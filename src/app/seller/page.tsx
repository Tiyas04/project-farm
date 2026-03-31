"use client"

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  sellerstatus?: string;
}

export default function SellerApplicationPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [fssaino, setFssaino] = useState('');
  const [fssailicense, setFssailicense] = useState<File | null>(null);
  const [kishancreditcard, setKishancreditcard] = useState<File | null>(null);
  const [govtid, setGovtid] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.status === 401) {
          router.push('/');
          return;
        }
        if (res.ok) {
          const json = await res.json();
          setUser(json.data);
        }
      } catch (error) {
        console.error("Error fetching user", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!fssaino || !fssailicense || !kishancreditcard || !govtid) {
      setMessage({ type: 'error', text: 'All fields and documents are required.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("fssaino", fssaino);
    formData.append("fssailicense", fssailicense);
    formData.append("kishancreditcard", kishancreditcard);
    formData.append("govtid", govtid);

    try {
      const response = await fetch(`/api/profile/${user._id}`, {
        method: 'PATCH',
        body: formData,
      });

      const resData = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Application submitted successfully! It is now under review.' });
        // Update local user state
        setUser(prev => prev ? { ...prev, sellerstatus: 'pending' } : null);
      } else {
        setMessage({ type: 'error', text: resData.message || 'Failed to submit application.' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (user?.sellerstatus === 'approved') {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-green-100 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You are an Approved Seller!</h2>
          <p className="text-gray-500 mb-6">You can now start uploading your products and managing your store.</p>
          <button 
            onClick={() => router.push('/seller/dashboard')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition"
          >
            Go to Seller Dashboard
          </button>
        </div>
      );
    }

    if (user?.sellerstatus === 'pending') {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 mb-4">
            <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Under Review</h2>
          <p className="text-gray-500">Your application to become a seller looks great and is currently being reviewed by our team. We will update you shortly!</p>
        </div>
      );
    }

    // Default: Show application form (handles 'rejected' or undefined/null statuses)
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-900">Apply to Become a Seller</h3>
          <p className="text-sm text-gray-500 mt-1">Submit your verification documents to start selling on Project Farm.</p>
          {user?.sellerstatus === 'rejected' && (
            <div className="mt-4 p-4 rounded-md bg-red-50 text-red-800 text-sm font-medium border border-red-100 flex items-start">
              <svg className="h-5 w-5 mr-2 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Your previous application was rejected. Please review your documents and apply again.
            </div>
          )}
        </div>
        
        <div className="p-6 md:p-8">
          {message && (
            <div className={`mb-6 p-4 rounded-md text-sm font-medium flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <span className="mr-2">
                {message.type === 'success' ? '✅' : '⚠️'}
              </span>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="fssaino" className="block text-sm font-medium text-gray-700">FSSAI Number</label>
                <input
                  type="text"
                  id="fssaino"
                  value={fssaino}
                  onChange={(e) => setFssaino(e.target.value)}
                  required
                  placeholder="Enter your 14-digit FSSAI Number"
                  className="mt-2 block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-green-500 focus:ring-green-500 border transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">FSSAI License Document (PDF/Image)</label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="fssailicense" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-2 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-1 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                      <p className="text-xs text-gray-500">{fssailicense ? fssailicense.name : 'PDF, PNG, JPG (Max 5MB)'}</p>
                    </div>
                    <input id="fssailicense" type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => setFssailicense(e.target.files?.[0] || null)} required />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kishan Credit Card (PDF/Image)</label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="kishancreditcard" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-2 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="text-xs text-gray-500">{kishancreditcard ? kishancreditcard.name : 'Click to upload your KCC document'}</p>
                    </div>
                    <input id="kishancreditcard" type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => setKishancreditcard(e.target.files?.[0] || null)} required />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Government ID (Aadhar/PAN/Voter ID) (PDF/Image)</label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="govtid" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-2 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="text-xs text-gray-500">{govtid ? govtid.name : 'Click to upload your Govt ID'}</p>
                    </div>
                    <input id="govtid" type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => setGovtid(e.target.files?.[0] || null)} required />
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className={`text-white font-medium py-3 px-8 rounded-md transition-all shadow-sm flex items-center ${isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-md'}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting Application...
                  </>
                ) : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="grow flex justify-center items-center">
          <svg className="animate-spin h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:truncate sm:text-4xl sm:tracking-tight mb-2">
            Seller Program
          </h2>
          <p className="text-gray-500">Join our community of certified farmers and sellers.</p>
        </div>

        {renderContent()}

      </main>

      <Footer />
    </div>
  );
}

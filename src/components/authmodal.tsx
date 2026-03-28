"use client";

import { useState, useEffect } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'signup'>(initialView);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneno, setPhoneno] = useState('');
  
  // App State
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Update view when initialView changes
  useEffect(() => {
    setView(initialView);
    setError('');
    // Clear form when switching views
    if (!isOpen) {
      setName('');
      setEmail('');
      setPassword('');
      setPhoneno('');
    }
  }, [initialView, isOpen, view]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        const url = view === 'login' ? '/api/login' : '/api/register';
        const payload = view === 'login' 
            ? { email, password } 
            : { name, email, password, phoneno };

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!data.success) {
            setError(data.message || 'Authentication failed');
            setIsLoading(false);
            return;
        }

        // Success! Hard reload to refresh session cookies in layout
        onClose();
        window.location.reload();
        
    } catch (err) {
        console.error(err);
        setError('A network error occurred. Please try again.');
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-opacity flex-col">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-800 focus:outline-none bg-gray-100 p-2 rounded-full transition-colors"
          aria-label="Close"
          disabled={isLoading}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="mb-8 text-3xl font-bold text-gray-900 text-center tracking-tight">
          {view === 'login' ? 'Welcome Back' : 'Create an Account'}
        </h2>

        {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center">
                <svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
            </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {view === 'signup' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                placeholder="John Doe"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
              placeholder="you@example.com"
            />
          </div>

          {view === 'signup' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                required
                value={phoneno}
                onChange={(e) => setPhoneno(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-green-600 px-4 py-3.5 text-white font-bold text-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg shadow-green-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shrink-0 mt-4"
          >
            {isLoading ? (
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                view === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          {view === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setView('signup'); setError(''); }}
                disabled={isLoading}
                className="font-bold text-green-600 hover:text-green-500 focus:outline-none"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setView('login'); setError(''); }}
                disabled={isLoading}
                className="font-bold text-green-600 hover:text-green-500 focus:outline-none"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function GatePage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if already authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify');
      const data = await response.json();
      if (data.authenticated === true) {
        // Already authenticated, redirect to chat
        router.push('/chat');
      } else {
        setCheckingAuth(false);
      }
    } catch (err) {
      setCheckingAuth(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Password verified, redirect to chat
        router.push('/chat');
      } else {
        setError(data.error || 'Incorrect password');
        setPassword('');
      }
    } catch (err) {
      setError('Failed to verify password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Show password gate
  return (
    <div className="min-h-screen bg-[#FDFBF9] flex flex-col">
      {/* Gate Image - Dynamically sized with viewport, matching /about page */}
      <div className="w-full flex-shrink-0 bg-[#FDFBF9]" style={{ height: '40vh', minHeight: '300px', maxHeight: '500px' }}>
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          <img
            src="/gate.png"
            alt="Socratic Gate"
            className="max-w-full max-h-full object-contain"
            style={{ width: 'auto', height: '100%' }}
          />
        </div>
      </div>

      {/* Password Form - Centered below image */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-serif text-gray-800 mb-2">Socratic.bot</h1>
            <p className="text-gray-600">Enter password to access the chat</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="Enter password"
                autoFocus
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full bg-black text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Access Chat'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/landing')}
              className="w-full text-gray-600 text-sm hover:text-gray-800 transition-colors"
            >
              Back
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

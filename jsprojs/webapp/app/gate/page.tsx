'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* Gate Image - Full screen background */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/gate.png"
          alt="Socratic Gate"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center center' }}
        />
      </div>

      {/* Password Form - Positioned over the password field in the image */}
      {/* The password field in the pixel art appears to be in the lower portion, centered */}
      {/* Using bottom positioning to align with the pixelated password field in the image */}
      <div className="absolute inset-0 flex items-end justify-center z-10" style={{ paddingBottom: '20%' }}>
        <div className="max-w-sm w-full bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-5 border border-gray-300 mx-6">
          <div className="text-center mb-4">
            <h1 className="text-xl font-serif text-gray-800 mb-1">Socratic.bot</h1>
            <p className="text-sm text-gray-600">Enter password to access the chat</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="Enter password"
                autoFocus
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-600 text-xs text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full bg-black text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Access Chat'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/landing')}
              className="w-full text-gray-600 text-xs hover:text-gray-800 transition-colors"
            >
              Back
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

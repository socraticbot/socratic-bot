'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();
  const [showPasswordGate, setShowPasswordGate] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBegin = () => {
    setShowPasswordGate(true);
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

  // Show password gate overlay if Begin was clicked
  if (showPasswordGate) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <div className="text-center mb-6">
            <Image
              src="/socraticlogo.png"
              alt="Socratic Bot"
              width={80}
              height={80}
              className="w-20 h-20 mx-auto mb-4"
            />
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
              onClick={() => setShowPasswordGate(false)}
              className="w-full text-gray-600 text-sm hover:text-gray-800 transition-colors"
            >
              Back
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Show original landing page
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#FDFBF9]">
      <div className="text-center space-y-8 max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/socraticlogo.png"
            alt="Socratic Bot Logo"
            width={200}
            height={200}
            className="w-auto h-auto"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-5xl font-serif text-black mb-4">
          Socratic Bot
        </h1>

        {/* Tagline */}
        <p className="text-xl text-gray-700 mb-8">
          Helping humans <strong>think</strong> better.
        </p>

        {/* Begin Button */}
        <button
          onClick={handleBegin}
          className="px-8 py-4 bg-black text-white rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors duration-200"
        >
          Begin
        </button>
      </div>
    </div>
  );
}

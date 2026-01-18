'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);

  const handleBegin = async () => {
    setIsChecking(true);
    // Check if already authenticated
    try {
      const response = await fetch('/api/auth/verify');
      const data = await response.json();
      if (data.authenticated === true) {
        // Already authenticated, go straight to chat
        router.push('/chat');
      } else {
        // Not authenticated, go to password gate
        router.push('/gate');
      }
    } catch (err) {
      // On error, go to password gate
      router.push('/gate');
    } finally {
      setIsChecking(false);
    }
  };

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
          disabled={isChecking}
          className="px-8 py-4 bg-black text-white rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isChecking ? 'Loading...' : 'Begin'}
        </button>
      </div>
    </div>
  );
}

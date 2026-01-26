'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();

  const handleBegin = () => {
    // Go directly to chat - no auth check needed
    router.push('/chat');
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
          className="px-8 py-4 bg-black text-white rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors duration-200"
        >
          Begin
        </button>
      </div>
    </div>
  );
}

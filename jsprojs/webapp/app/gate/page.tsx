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
    
    // Remove body margins/padding to ensure no white space
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.overflow = 'hidden';
    
    // Cleanup on unmount
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflow = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
      document.documentElement.style.overflow = '';
    };
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
    <div 
      className="fixed inset-0 w-screen h-screen overflow-hidden" 
      style={{ 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        margin: 0, 
        padding: 0, 
        width: '100vw', 
        height: '100vh',
        position: 'fixed',
        zIndex: 0
      }}
    >
      {/* Gate Image - Full screen, showing only bottom portion where password field is */}
      <div className="absolute inset-0" style={{ top: 0, left: 0, right: 0, bottom: 0, width: '200%', height: '200%', margin: 0, padding: 0 }}>
        <img
          src="/gate.png"
          alt="Socratic Gate"
          style={{ 
            width: '100vw',
            height: '100vh',
            minWidth: '100vw',
            minHeight: '100vh',
            objectFit: 'cover',
            objectPosition: 'center bottom', // Show bottom portion of image
            display: 'block',
            margin: 0,
            padding: 0,
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
      </div>

      {/* Password Input - Positioned directly over the password field in the image */}
      {/* The password field in the pixel art is in the lower portion, centered */}
      <div className="absolute inset-0 flex items-end justify-center z-10" style={{ paddingBottom: '10%', pointerEvents: 'none' }}>
        <form onSubmit={handlePasswordSubmit} className="max-w-sm w-full mx-6" style={{ pointerEvents: 'auto' }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && password && !isLoading) {
                handlePasswordSubmit(e as any);
              }
            }}
            className="w-full px-4 py-3 text-base border-2 border-gray-400 rounded-lg bg-white/95 backdrop-blur-sm focus:ring-2 focus:ring-black focus:border-black outline-none shadow-lg"
            placeholder="Enter password"
            autoFocus
            disabled={isLoading}
          />
          {error && (
            <div className="text-red-600 text-xs text-center mt-2 bg-white/95 px-2 py-1 rounded">{error}</div>
          )}
        </form>
      </div>
    </div>
  );
}

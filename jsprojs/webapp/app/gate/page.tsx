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
  // Navbar height is approximately 64px (py-4 = 1rem top + 1rem bottom + content height)
  const NAVBAR_HEIGHT = 64;
  // Image dimensions: 4320x2430, aspect ratio ~1.78:1
  // The input should scale proportionally with the image
  // Using a container that matches the image's rendered size
  
  return (
    <div 
      className="fixed w-screen overflow-hidden" 
      style={{ 
        top: `${NAVBAR_HEIGHT}px`, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        margin: 0, 
        padding: 0, 
        width: '100vw', 
        height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        position: 'fixed',
        zIndex: 0
      }}
    >
      {/* Container that centers the image */}
      <div 
        className="absolute"
        style={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center'
        }}
      >
        {/* Wrapper that contains both image and input - matches image size exactly */}
        <div
          style={{
            position: 'relative',
            height: '100%',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center'
          }}
        >
          {/* Gate Image - Scales proportionally */}
          <img
            src="/gate.png"
            alt="Socratic Gate"
            style={{ 
              width: 'auto',
              height: '100%',
              maxWidth: '100vw',
              objectFit: 'contain',
              objectPosition: 'center top',
              display: 'block',
              margin: 0,
              padding: 0
            }}
          />
          
          {/* Password Input - Positioned relative to image, scales proportionally with it */}
          <div 
            className="absolute"
            style={{
              // Position relative to image wrapper: bottom ~15%, left ~42% (to the left of center where Unlock button is)
              // These percentages are relative to the image's actual rendered size
              bottom: '15%',
              left: '42%',
              transform: 'translateX(-100%)',
              marginRight: '2%', // Small gap between input and Unlock button
              zIndex: 10,
              pointerEvents: 'auto'
            }}
          >
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && password && !isLoading) {
                  handlePasswordSubmit(e as any);
                }
              }}
              style={{
                // Scale proportionally with image - use percentage of image height
                // Image is 4320x2430, so input should be ~5-6% of image height
                width: 'calc(100vh * 0.08)', // ~8% of viewport height, scales with image
                height: 'calc(100vh * 0.025)', // ~2.5% of viewport height
                padding: '0 calc(100vh * 0.01)',
                fontSize: 'calc(100vh * 0.015)',
                border: '2px solid #9ca3af',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                outline: 'none'
              }}
              className="focus:ring-2 focus:ring-black focus:border-black"
              placeholder="Enter password"
              autoFocus
              disabled={isLoading}
            />
            {error && (
              <div 
                className="text-red-600 text-xs text-center mt-2 bg-white/95 px-2 py-1 rounded"
                style={{
                  fontSize: 'calc(100vh * 0.012)'
                }}
              >
                {error}
              </div>
            )}
          </form>
        </div>
        </div>
      </div>
    </div>
  );
}

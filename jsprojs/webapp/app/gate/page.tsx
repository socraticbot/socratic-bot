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
    
    // Function to update image dimensions for scaling
    const updateImageDimensions = () => {
      const img = document.querySelector('img[alt="Socratic Gate"]') as HTMLImageElement;
      if (img) {
        const rect = img.getBoundingClientRect();
        // Set CSS custom properties based on actual rendered image size
        img.style.setProperty('--image-height', `${rect.height}px`);
        img.style.setProperty('--image-width', `${rect.width}px`);
      }
    };
    
    // Update on load and resize
    const img = document.querySelector('img[alt="Socratic Gate"]') as HTMLImageElement;
    if (img) {
      if (img.complete) {
        updateImageDimensions();
      } else {
        img.addEventListener('load', updateImageDimensions);
      }
    }
    
    window.addEventListener('resize', updateImageDimensions);
    
    // Cleanup on unmount
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflow = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
      document.documentElement.style.overflow = '';
      window.removeEventListener('resize', updateImageDimensions);
      if (img) {
        img.removeEventListener('load', updateImageDimensions);
      }
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
            width: 'auto',
            display: 'inline-block'
          }}
        >
          {/* Gate Image - Scales proportionally, wrapper matches its size */}
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
              padding: 0,
              // CSS custom properties will be set by JavaScript
              '--image-height': '100%',
              '--image-width': 'auto'
            } as React.CSSProperties}
            onLoad={(e) => {
              // Update dimensions when image loads
              const img = e.currentTarget;
              const rect = img.getBoundingClientRect();
              img.style.setProperty('--image-height', `${rect.height}px`);
              img.style.setProperty('--image-width', `${rect.width}px`);
            }}
          />
          
          {/* Password Input - Positioned relative to image, scales proportionally with it */}
          {/* Since image height is 100% of container, use that for scaling */}
          <div 
            className="absolute"
            style={{
              // Position relative to image: bottom ~15%, left ~42% (to the left of center where Unlock button is)
              // These percentages are relative to the image's actual rendered size
              bottom: '47%',
              left: '50%',
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
                // Scale proportionally with actual image dimensions
                // Use CSS custom properties set from image's rendered size
                width: 'calc(var(--image-height, 100vh) * 0.2)', // 20% of image height
                height: 'calc(var(--image-height, 100vh) * 0.025)', // 2.5% of image height
                padding: '0 calc(var(--image-height, 100vh) * 0.01)',
                fontSize: 'calc(var(--image-height, 100vh) * 0.015)',
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
                  fontSize: 'calc(var(--image-height, 100vh) * 0.012)'
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

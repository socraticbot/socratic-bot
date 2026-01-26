'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export default function PasswordModal({ isOpen, onClose, onAuthenticated }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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
        setPassword('');
        onAuthenticated();
        onClose();
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#FDFBF9] rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Gate Image */}
        <div className="relative w-full h-48">
          <Image
            src="/gate.png"
            alt="Socratic Gate"
            fill
            className="object-cover object-top"
          />
        </div>

        {/* Password Input Section */}
        <div className="p-6">
          <h2 className="text-xl font-serif text-gray-800 mb-4 text-center">
            Advanced Settings
          </h2>
          <p className="text-sm text-gray-600 mb-4 text-center">
            Enter password to access multi-model selector
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && password && !isLoading) {
                  handleSubmit(e as any);
                }
              }}
              className="w-full px-4 py-3 text-base border-2 border-gray-400 rounded-lg bg-white focus:ring-2 focus:ring-black focus:border-black outline-none shadow-lg"
              placeholder="Enter password"
              autoFocus
              disabled={isLoading}
            />
            {error && (
              <div className="text-red-600 text-sm text-center mt-2">
                {error}
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-base border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!password.trim() || isLoading}
                className="flex-1 px-4 py-2 text-base bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Unlock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

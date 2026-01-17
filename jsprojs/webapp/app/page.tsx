'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [showQuestion, setShowQuestion] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    // Show question after a pause (2 seconds) - unhurried
    const timer = setTimeout(() => {
      setShowQuestion(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Slow blinking cursor - not insistent
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        {showQuestion ? (
          <div className="fade-in">
            <p className="text-2xl text-gray-600 leading-relaxed font-light tracking-tight">
              What&apos;s on your mind right now?
              <span
                className={`inline-block w-0.5 h-7 ml-1.5 bg-gray-400 align-middle transition-opacity duration-500 ${
                  cursorVisible ? 'opacity-100' : 'opacity-30'
                }`}
              />
            </p>
          </div>
        ) : (
          <div className="h-8" />
        )}
      </div>
    </div>
  );
}

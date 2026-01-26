'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import ModelSelector from '../components/ModelSelector';
import { TutorModel, getDefaultModel } from '@/lib/models';
import PasswordModal from '../components/PasswordModal';

interface Message {
  id: string;
  role: 'user' | 'tutor' | 'thought';
  content: string;
  timestamp: Date;
}

export default function Home() {
  const [showQuestion, setShowQuestion] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentThought, setCurrentThought] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<TutorModel>(getDefaultModel());
  const [expandedThoughts, setExpandedThoughts] = useState<Set<string>>(new Set());
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset conversation when model changes
  const handleModelChange = (model: TutorModel) => {
    setSelectedModel(model);
    setMessages([]);
    setShowQuestion(false);
    setInput('');
    setError(null);
    setCurrentThought(null);
    setStreamingText('');
    setExpandedThoughts(new Set());
    // Show question again after model switch
    setTimeout(() => {
      setShowQuestion(true);
    }, 500);
  };

  // Toggle thought expansion
  const toggleThought = (thoughtId: string) => {
    setExpandedThoughts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(thoughtId)) {
        newSet.delete(thoughtId);
      } else {
        newSet.add(thoughtId);
      }
      return newSet;
    });
  };

  // Check if already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify');
        const data = await response.json();
        if (data.authenticated === true) {
          setIsAdvancedMode(true);
        }
      } catch (err) {
        // Not authenticated, stay in public mode
      }
    };
    checkAuth();
  }, []);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isListening) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const userInput = input;
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsListening(true);
    setError(null);
    setCurrentThought(null);
    setStreamingText('');

    try {
      const res = await fetch('/api/chat/stream-thoughts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: userInput,
          modelId: selectedModel.id,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate response');
      }

      // Handle Server-Sent Events
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      let tutorMessageId = (Date.now() + 1).toString();
      let accumulatedText = '';
      const thoughtMessages: Message[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        // Split by double newline (SSE delimiter) and also handle single newlines
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() || '';

        for (const chunk of chunks) {
          // Handle SSE format: "data: {...}"
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'thought') {
                  // Add thought as a separate message
                  const thoughtMessage: Message = {
                    id: `thought-${Date.now()}-${Math.random()}`,
                    role: 'thought',
                    content: data.content,
                    timestamp: new Date(),
                  };
                  setMessages((prev) => {
                    // Remove any existing temporary thought messages and add the new one
                    const filtered = prev.filter(msg => msg.role !== 'thought' || !msg.id.startsWith('thought-temp'));
                    return [...filtered, thoughtMessage];
                  });
                  // Also show as current thought for real-time updates
                  setCurrentThought(data.content);
                } else if (data.type === 'text') {
                  accumulatedText += data.content;
                  setStreamingText(accumulatedText);
                  // Update or create tutor message in real-time
                  setMessages((prev) => {
                    const existingIndex = prev.findIndex(msg => msg.id === tutorMessageId);
                    if (existingIndex > -1) {
                      const updated = [...prev];
                      updated[existingIndex] = {
                        ...updated[existingIndex],
                        content: accumulatedText,
                      };
                      return updated;
                    } else {
                      return [...prev, {
                        id: tutorMessageId,
                        role: 'tutor',
                        content: accumulatedText,
                        timestamp: new Date(),
                      }];
                    }
                  });
                } else if (data.type === 'done') {
                  // Finalize the tutor message
                  if (accumulatedText) {
                    setMessages((prev) => {
                      const existingIndex = prev.findIndex(msg => msg.id === tutorMessageId);
                      if (existingIndex > -1) {
                        const updated = [...prev];
                        updated[existingIndex] = {
                          ...updated[existingIndex],
                          content: accumulatedText,
                        };
                        return updated;
                      } else {
                        return [...prev, {
                          id: tutorMessageId,
                          role: 'tutor',
                          content: accumulatedText,
                          timestamp: new Date(),
                        }];
                      }
                    });
                  }
                  // Automatically collapse all thoughts when response is complete
                  setExpandedThoughts(new Set());
                  setCurrentThought(null);
                  setStreamingText('');
                } else if (data.type === 'error') {
                  throw new Error(data.content);
                }
              } catch (parseErr) {
                console.error('Error parsing SSE data:', parseErr, 'Line:', line);
              }
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setCurrentThought(null);
      setStreamingText('');
    } finally {
      setIsListening(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleAuthenticated = () => {
    setIsAdvancedMode(true);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 overflow-x-hidden">
      {/* Branding Header */}
      <div className="w-full max-w-6xl mx-auto mb-3 sm:mb-4 fade-in">
        <div className="text-center space-y-1 sm:space-y-2">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/socraticlogo.png"
              alt="Socratic Bot Logo"
              width={120}
              height={120}
              className="w-16 h-16 sm:w-20 sm:h-20"
              priority
            />
          </div>
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-black">
            Socratic Bot
          </h1>
          {/* Tagline */}
          <p className="text-sm sm:text-base md:text-lg text-gray-700">
            Helping humans <strong>think</strong> better.
          </p>
        </div>
      </div>

      {/* Model Selector - Top of page (only visible in advanced mode) */}
      {isAdvancedMode && (
        <div className="w-full max-w-6xl mx-auto mb-4 fade-in">
          <ModelSelector 
            selectedModel={selectedModel} 
            onModelChange={handleModelChange}
          />
        </div>
      )}

      {/* Advanced Settings Button (only visible when not in advanced mode) */}
      {!isAdvancedMode && (
        <button
          onClick={() => setShowPasswordModal(true)}
          className="fixed bottom-4 right-4 sm:right-6 px-3 py-2 sm:px-4 text-xs sm:text-sm text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5 sm:gap-2 z-40"
          title="Access multi-model selector"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Advanced</span>
        </button>
      )}

      {/* Password Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onAuthenticated={handleAuthenticated}
      />

      {/* Main Content */}
      <div className="flex-1 flex w-full overflow-x-hidden">
        <div className="w-full max-w-2xl mx-auto space-y-3 sm:space-y-4 px-0 sm:px-4">
          {/* Initial Question */}
        {messages.length === 0 && showQuestion && (
          <div className="fade-in pt-2">
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed font-light tracking-tight mb-3 sm:mb-4 px-2 sm:px-0">
              What&apos;s on your mind right now?
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="space-y-3 sm:space-y-4 fade-in">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                {message.role === 'thought' ? (
                  <div className="inline-block max-w-[90%]">
                    {(() => {
                      // Extract step name (first line before newline)
                      const stepName = message.content.split('\n')[0] || 'Internal reasoning';
                      return (
                        <>
                          <button
                            onClick={() => toggleThought(message.id)}
                            className="w-full text-left p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <svg
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  expandedThoughts.has(message.id) ? 'rotate-90' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <span className="font-mono">{stepName}</span>
                            </div>
                          </button>
                          {expandedThoughts.has(message.id) && (
                            <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                              <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap font-mono">
                                {message.content}
          </p>
        </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : message.role === 'tutor' ? (
                  <div className="flex items-start gap-3 max-w-[80%]">
                    <div className="flex-shrink-0">
                      <Image
                        src={selectedModel.avatar}
                        alt={selectedModel.name}
                        width={40}
                        height={40}
                        className="w-10 h-10"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-base leading-relaxed text-gray-600">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="inline-block max-w-[80%] text-gray-700">
                    <p className="text-base leading-relaxed">{message.content}</p>
                  </div>
                )}
              </div>
            ))}
            
            {/* Streaming text (only show if not already in messages) */}
            {streamingText && !messages.some(m => m.role === 'tutor' && m.content === streamingText) && (
              <div className="text-left fade-in">
                <div className="flex items-start gap-3 max-w-[80%]">
                  <div className="flex-shrink-0">
                    <Image
                      src={selectedModel.avatar}
                      alt={selectedModel.name}
                      width={40}
                      height={40}
                      className="w-10 h-10"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-base leading-relaxed text-gray-600">{streamingText}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Current thought (for real-time updates during streaming) */}
            {currentThought && !messages.some(m => m.role === 'thought' && m.content === currentThought) && (
              <div className="text-left fade-in">
                <div className="inline-block max-w-[90%] p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap font-mono">
                    {currentThought}
                  </p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Listening Indicator */}
        {isListening && (
          <div className="flex items-center gap-2 text-gray-400 fade-in">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" />
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-sm">Listening</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg fade-in">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Input Form */}
        {(showQuestion || messages.length > 0) && (
          <form onSubmit={handleSend} className="fade-in w-full">
            <div className="flex gap-2 relative w-full">
              <div className="flex-1 relative min-w-0">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Take your time..."
                  className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 resize-none"
                  rows={2}
                  disabled={isListening}
                />
                {input.length === 0 && !isListening && (
                  <span
                    className={`absolute left-3 sm:left-4 top-3 pointer-events-none text-gray-400 transition-opacity duration-500 ${
                      cursorVisible ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    |
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isListening}
                className="px-4 sm:px-6 py-3 text-sm sm:text-base text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 whitespace-nowrap"
              >
                Send
              </button>
            </div>
          </form>
        )}

        {/* Current Model Indicator - Directly underneath chat */}
        {(showQuestion || messages.length > 0) && (
          <div className="mt-2 sm:mt-3 fade-in">
            <div className="text-xs sm:text-sm text-gray-500 text-center break-words">
              <span>Current model: </span>
              {selectedModel.referenceUrl ? (
                <a
                  href={selectedModel.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-gray-900 underline transition-colors break-all"
                >
                  {selectedModel.name}
                </a>
              ) : (
                <span className="text-gray-700 break-all">{selectedModel.name}</span>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

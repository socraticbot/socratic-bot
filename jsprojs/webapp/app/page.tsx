'use client';

import { useState, useEffect, useRef } from 'react';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        body: JSON.stringify({ prompt: userInput }),
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'thought') {
                setCurrentThought(data.content);
              } else if (data.type === 'text') {
                accumulatedText += data.content;
                setStreamingText(accumulatedText);
              } else if (data.type === 'done') {
                // Finalize the tutor message
                const tutorMessage: Message = {
                  id: tutorMessageId,
                  role: 'tutor',
                  content: accumulatedText,
                  timestamp: new Date(),
                };
                setMessages((prev) => [...prev, tutorMessage]);
                setCurrentThought(null);
                setStreamingText('');
              } else if (data.type === 'error') {
                throw new Error(data.content);
              }
            } catch (parseErr) {
              console.error('Error parsing SSE data:', parseErr);
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

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-6">
        {/* Initial Question */}
        {messages.length === 0 && showQuestion && (
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
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="space-y-6 fade-in">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block max-w-[80%] ${
                    message.role === 'user'
                      ? 'text-gray-700'
                      : 'text-gray-600'
                  }`}
                >
                  <p className="text-base leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            
            {/* Streaming text */}
            {streamingText && (
              <div className="text-left fade-in">
                <div className="inline-block max-w-[80%] text-gray-600">
                  <p className="text-base leading-relaxed">{streamingText}</p>
                </div>
              </div>
            )}
            
            {/* Internal thought display */}
            {currentThought && (
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
          <form onSubmit={handleSend} className="fade-in">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Take your time..."
                className="flex-1 px-4 py-3 text-base text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 resize-none"
                rows={2}
                disabled={isListening}
              />
              <button
                type="submit"
                disabled={!input.trim() || isListening}
                className="px-6 py-3 text-base text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

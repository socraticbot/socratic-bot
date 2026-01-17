'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'tutor';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onSendMessage?: (message: string) => void;
}

export default function ChatInterface({ onSendMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, reflection]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsListening(true);
    onSendMessage?.(input);

    // Simulate tutor response after a patient pause
    setTimeout(() => {
      setIsListening(false);
      const tutorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'tutor',
        content: "Let's slow that down. What makes that part feel solid?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, tutorMessage]);

      // Show reflection after a few messages
      if (messages.length >= 2) {
        setTimeout(() => {
          setReflection("Here's how I'm understanding you so far...");
        }, 2000);
      }
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 p-4">
        {messages.length === 0 && (
          <div className="fade-in">
            <p className="text-lg text-gray-600 leading-relaxed">
              What&apos;s on your mind right now?
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`fade-in ${
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

        {/* Reflection Layer */}
        {reflection && (
          <div className="fade-in mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">{reflection}</p>
            <p className="text-sm text-gray-400 italic">
              You are invited to correct this understanding.
            </p>
          </div>
        )}

        {/* Listening Indicator */}
        {isListening && (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" />
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-sm">Listening</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Take your time..."
            className="flex-1 px-4 py-3 text-base text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 resize-none"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isListening}
            className="px-6 py-3 text-base text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

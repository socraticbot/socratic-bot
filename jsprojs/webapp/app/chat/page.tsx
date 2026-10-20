'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ModelSelector from '../components/ModelSelector';
import { TutorModel, getDefaultModel } from '@/lib/models';
import { getBiasBySlug } from '@/lib/biases/data';
import { openingLine } from '@/lib/tutor/prompt';
import { resolveLocale } from '@/lib/i18n/locales';
import { t } from '@/lib/i18n/ui';
import PasswordModal from '../components/PasswordModal';

interface Message {
  id: string;
  role: 'user' | 'tutor';
  content: string;
}

let nextId = 0;
const newId = () => `m${Date.now()}-${nextId++}`;

export default function ChatPage() {
  return (
    <Suspense>
      <Chat />
    </Suspense>
  );
}

function Chat() {
  const searchParams = useSearchParams();
  const bias = getBiasBySlug(searchParams.get('bias') ?? '');
  const locale = resolveLocale(searchParams.get('lang'));
  const opener = bias ? openingLine(bias, locale) : null;
  const backHref = locale === 'en' ? '/farcaster' : `/farcaster?lang=${locale}`;

  const [showQuestion, setShowQuestion] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<TutorModel>(getDefaultModel());
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
    // Show question again after model switch
    setTimeout(() => {
      setShowQuestion(true);
    }, 500);
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
      } catch {
        // Not authenticated, stay in public mode
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    // Show question after a pause - unhurried, shorter when arriving from today's bias
    const timer = setTimeout(() => {
      setShowQuestion(true);
    }, opener ? 600 : 2000);

    return () => clearTimeout(timer);
  }, [opener]);

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

    const userMessage: Message = { id: newId(), role: 'user', content: input.trim() };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput('');
    setIsListening(true);
    setError(null);

    const tutorId = newId();
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map((m) => ({
            role: m.role === 'tutor' ? 'assistant' : 'user',
            content: m.content,
          })),
          modelId: selectedModel.id,
          biasSlug: bias?.slug,
          locale,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.reply !== 'string') {
        const code = data.code ? ` (${data.code})` : '';
        throw new Error(`${data.error || 'Failed to generate response'}${code}`);
      }
      setMessages([...history, { id: tutorId, role: 'tutor', content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
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

  const tutorBubble = (content: string, key?: string) => (
    <div key={key} className="text-left">
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
          <p className="text-base leading-relaxed text-gray-600 whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </div>
  );

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
            {locale === 'en' ? (
              <>
                Helping humans <strong>think</strong> better.
              </>
            ) : (
              t(locale, 'tagline')
            )}
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
        {showQuestion && !opener && messages.length === 0 && (
          <div className="fade-in pt-2">
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed font-light tracking-tight mb-3 sm:mb-4 px-2 sm:px-0">
              {t(locale, 'chatPrompt')}
            </p>
          </div>
        )}

        {/* Today's bias opener */}
        {showQuestion && opener && (
          <div className="fade-in pt-2 space-y-1">
            <Link href={backHref} className="text-xs text-gray-400 hover:text-gray-600 underline">
              {t(locale, 'chatBack')}
            </Link>
            {tutorBubble(opener)}
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="space-y-3 sm:space-y-4 fade-in" aria-live="polite">
            {messages.map((message) =>
              message.role === 'tutor' ? (
                tutorBubble(message.content, message.id)
              ) : (
                <div key={message.id} className="text-right">
                  <div className="inline-block max-w-[80%] text-gray-700">
                    <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              )
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
            <span className="text-sm">{t(locale, 'chatListening')}</span>
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
                  placeholder={t(locale, 'chatPlaceholder')}
                  aria-label={t(locale, 'chatReplyLabel')}
                  maxLength={4000}
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
                {t(locale, 'chatSend')}
              </button>
            </div>
          </form>
        )}

        {/* Current Model Indicator - Directly underneath chat */}
        {(showQuestion || messages.length > 0) && (
          <div className="mt-2 sm:mt-3 fade-in">
            <div className="text-xs sm:text-sm text-gray-500 text-center break-words">
              <span>{t(locale, 'chatModel')} </span>
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

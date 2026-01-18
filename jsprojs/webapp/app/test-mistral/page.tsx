'use client';

import { useState } from 'react';

export default function TestMistral() {
  const [prompt, setPrompt] = useState('What is critical thinking?');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ promptTokens?: number; completionTokens?: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    setUsage(null);

    try {
      const res = await fetch('/api/chat/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate response');
      }

      const data = await res.json();
      setResponse(data.text);
      setUsage(data.usage || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-light text-gray-700 mb-2">
            Test Mistral Integration
          </h1>
          <p className="text-sm text-gray-500">
            Testing Vercel AI Gateway with Mistral Large
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm text-gray-600 mb-2">
              Prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-4 py-3 text-base text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 resize-none"
              rows={4}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="px-6 py-3 text-base text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate Response'}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {response && (
          <div className="space-y-2 fade-in">
            <h2 className="text-lg font-light text-gray-700">Response</h2>
            <div className="p-4 bg-white/50 rounded-lg border border-gray-200">
              <p className="text-base text-gray-600 leading-relaxed whitespace-pre-wrap">
                {response}
              </p>
            </div>
            {usage && (
              <div className="text-xs text-gray-400">
                Tokens: {usage.promptTokens || 0} prompt + {usage.completionTokens || 0} completion
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

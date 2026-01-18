'use client';

import { useState, useEffect } from 'react';

interface CreditsData {
  balance: string;
  total_used: string;
}

interface GenerationData {
  id: string;
  total_cost: number;
  usage: number;
  created_at: string;
  model: string;
  is_byok: boolean;
  provider_name: string;
  streamed: boolean;
  latency: number;
  generation_time: number;
  tokens_prompt: number;
  tokens_completion: number;
  native_tokens_prompt: number;
  native_tokens_completion: number;
  native_tokens_reasoning: number;
  native_tokens_cached: number;
}

export default function AIDataPage() {
  const [credits, setCredits] = useState<CreditsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastGenerationId, setLastGenerationId] = useState<string>('');
  const [generation, setGeneration] = useState<GenerationData | null>(null);
  const [generationLoading, setGenerationLoading] = useState(false);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/aidata/credits');
      if (!res.ok) {
        throw new Error('Failed to fetch credits');
      }
      const data = await res.json();
      setCredits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchGeneration = async () => {
    if (!lastGenerationId.trim()) {
      setError('Please enter a generation ID');
      return;
    }

    try {
      setGenerationLoading(true);
      setError(null);
      const res = await fetch(`/api/aidata/generation?id=${encodeURIComponent(lastGenerationId)}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch generation');
      }
      const data = await res.json();
      setGeneration(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setGeneration(null);
    } finally {
      setGenerationLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="fade-in">
          <h1 className="text-3xl font-light text-gray-700 mb-2">AI Gateway Usage & Billing</h1>
          <p className="text-sm text-gray-500">Monitor your credit balance and generation costs</p>
        </div>

        {/* Credits Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-light text-gray-700">Credit Balance</h2>
            <button
              onClick={fetchCredits}
              disabled={loading}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {credits && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Balance</div>
                <div className="text-2xl font-light text-gray-700">${credits.balance}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Total Used</div>
                <div className="text-2xl font-light text-gray-700">${credits.total_used}</div>
              </div>
            </div>
          )}
        </div>

        {/* Generation Lookup Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 fade-in">
          <h2 className="text-xl font-light text-gray-700 mb-4">Generation Lookup</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={lastGenerationId}
              onChange={(e) => setLastGenerationId(e.target.value)}
              placeholder="Enter generation ID (gen_...)"
              className="flex-1 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
            />
            <button
              onClick={fetchGeneration}
              disabled={generationLoading || !lastGenerationId.trim()}
              className="px-6 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generationLoading ? 'Loading...' : 'Lookup'}
            </button>
          </div>

          {generation && (
            <div className="mt-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Generation ID</div>
                  <div className="font-mono text-xs text-gray-700">{generation.id}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Model</div>
                  <div className="text-gray-700">{generation.model}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Provider</div>
                  <div className="text-gray-700">{generation.provider_name}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Total Cost</div>
                  <div className="text-gray-700">${generation.total_cost.toFixed(6)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Created At</div>
                  <div className="text-gray-700">{new Date(generation.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Streamed</div>
                  <div className="text-gray-700">{generation.streamed ? 'Yes' : 'No'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Latency</div>
                  <div className="text-gray-700">{generation.latency}ms</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Generation Time</div>
                  <div className="text-gray-700">{generation.generation_time}ms</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Prompt Tokens</div>
                  <div className="text-gray-700">{generation.tokens_prompt.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Completion Tokens</div>
                  <div className="text-gray-700">{generation.tokens_completion.toLocaleString()}</div>
                </div>
                {generation.native_tokens_reasoning > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Reasoning Tokens</div>
                    <div className="text-gray-700">{generation.native_tokens_reasoning.toLocaleString()}</div>
                  </div>
                )}
                {generation.native_tokens_cached > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Cached Tokens</div>
                    <div className="text-gray-700">{generation.native_tokens_cached.toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 fade-in">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Generation IDs are included in chat completion responses. 
            You can find them in the response metadata or by checking the network tab.
          </p>
        </div>
      </div>
    </div>
  );
}

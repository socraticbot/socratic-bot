'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bias } from '@/lib/biases/data';
import { BIAS_URL, biasUrlForDay, shareText } from '@/lib/biases/share';
import { composeCast, composeIntentUrl, isInMiniApp } from '@/lib/miniapp';

interface BiasCardProps {
  bias: Bias;
  dayNumber: number;
  isToday: boolean;
  picked: string | null;
  onPick: (option: string) => void;
  onShowBoard: () => void;
}

export default function BiasCard({ bias, dayNumber, isToday, picked, onPick, onShowBoard }: BiasCardProps) {
  const [copied, setCopied] = useState(false);
  const isCorrect = picked === bias.name;
  const text = shareText(dayNumber);
  const shareUrl = biasUrlForDay(dayNumber);

  const handleShareFarcaster = async () => {
    if (await isInMiniApp()) {
      await composeCast(text, shareUrl);
      return;
    }
    window.open(composeIntentUrl(text, shareUrl), '_blank', 'noopener,noreferrer');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${text} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable: leave the button as is.
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 fade-in">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-widest text-gray-400">
          Bias of the day #{dayNumber + 1}
          {bias.reviewOf && ' · Review'}
        </p>
        <h1 className="text-2xl sm:text-3xl font-serif text-black">Can you spot it?</h1>
      </div>

      {bias.reviewOf && (
        <p className="text-sm text-gray-500 text-center">A bias from earlier, in a new situation.</p>
      )}

      <p className="text-base sm:text-lg leading-relaxed text-gray-700">{bias.scenario}</p>

      <fieldset className="space-y-2">
        <legend className="text-sm text-gray-500 mb-2">Which bias is this?</legend>
        {bias.options.map((option) => {
          const chosen = picked === option;
          const showCorrect = picked !== null && option === bias.name;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onPick(option)}
              disabled={picked !== null}
              aria-pressed={chosen}
              className={`w-full px-4 py-3 text-left text-gray-700 border rounded-lg transition-colors duration-200 disabled:cursor-default ${
                showCorrect
                  ? 'border-green-500 bg-green-50'
                  : chosen
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option}
            </button>
          );
        })}
      </fieldset>

      <div aria-live="polite">
        {picked !== null && (
          <div className="space-y-4 fade-in">
            <p className="text-base font-medium text-gray-800">
              {isCorrect ? 'Yes, you spotted it.' : `Not quite. This one is ${bias.name}.`}
            </p>
            <div className="space-y-2 text-gray-700 leading-relaxed">
              <p>
                <strong>{bias.name}:</strong> {bias.definition}
              </p>
              <p>{bias.explanation}</p>
              <p className="text-gray-600">
                <strong>Try this:</strong> {bias.counterMove}
              </p>
            </div>

            {!isToday && (
              <p className="text-sm text-gray-500">
                This card is from an earlier day.{' '}
                <Link href={BIAS_URL} className="underline hover:text-gray-700">
                  See today&apos;s bias
                </Link>
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Link
                href={`/chat?bias=${bias.slug}`}
                className="flex-1 px-4 py-3 text-center bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                Talk it through
              </Link>
              <button
                type="button"
                onClick={handleShareFarcaster}
                className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Share on Farcaster
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>

            <button
              type="button"
              onClick={onShowBoard}
              className="w-full text-sm text-gray-500 underline hover:text-gray-700"
            >
              See leaderboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

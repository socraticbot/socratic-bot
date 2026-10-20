'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bias } from '@/lib/biases/data';
import { BIAS_URL, biasUrlForDay, shareText } from '@/lib/biases/share';
import { Locale } from '@/lib/i18n/locales';
import { t } from '@/lib/i18n/ui';
import { composeCast, composeIntentUrl, isInMiniApp } from '@/lib/miniapp';

interface BiasCardProps {
  /** Card text in the viewer's language. */
  bias: Bias;
  /** English option names, index-aligned with `bias.options`; answers are stored by these. */
  optionKeys: string[];
  /** English name of the correct answer. */
  answerKey: string;
  locale: Locale;
  dayNumber: number;
  isToday: boolean;
  picked: string | null;
  onPick: (optionKey: string) => void;
  onShowBoard: () => void;
}

export default function BiasCard({
  bias,
  optionKeys,
  answerKey,
  locale,
  dayNumber,
  isToday,
  picked,
  onPick,
  onShowBoard,
}: BiasCardProps) {
  const [copied, setCopied] = useState(false);
  const isCorrect = picked === answerKey;
  const text = shareText(dayNumber, locale);
  const shareUrl = biasUrlForDay(dayNumber, locale);
  const langQuery = locale === 'en' ? '' : `lang=${locale}`;
  // Chinese uses a full-width colon with no space after it.
  const colon = locale === 'zh' ? '：' : ': ';

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
          {t(locale, 'cardLabel', { n: dayNumber + 1 })}
          {bias.reviewOf && ` · ${t(locale, 'review')}`}
        </p>
        <h1 className="text-2xl sm:text-3xl font-serif text-black">{t(locale, 'heading')}</h1>
      </div>

      {bias.reviewOf && <p className="text-sm text-gray-500 text-center">{t(locale, 'reviewNote')}</p>}

      <p className="text-base sm:text-lg leading-relaxed text-gray-700">{bias.scenario}</p>

      <fieldset className="space-y-2">
        <legend className="text-sm text-gray-500 mb-2">{t(locale, 'question')}</legend>
        {bias.options.map((option, i) => {
          const key = optionKeys[i];
          const chosen = picked === key;
          const showCorrect = picked !== null && key === answerKey;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onPick(key)}
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
              {isCorrect ? t(locale, 'correct') : t(locale, 'incorrect', { name: bias.name })}
            </p>
            <div className="space-y-2 text-gray-700 leading-relaxed">
              <p>
                <strong>
                  {bias.name}
                  {colon.trim()}
                </strong>
                {locale === 'zh' ? '' : ' '}
                {bias.definition}
              </p>
              <p>{bias.explanation}</p>
              <p className="text-gray-600">
                <strong>{t(locale, 'tryThis')}</strong>
                {locale === 'zh' ? '' : ' '}
                {bias.counterMove}
              </p>
            </div>

            {!isToday && (
              <p className="text-sm text-gray-500">
                {t(locale, 'pastDay')}{' '}
                <Link href={langQuery ? `${BIAS_URL}?${langQuery}` : BIAS_URL} className="underline hover:text-gray-700">
                  {t(locale, 'seeToday')}
                </Link>
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Link
                href={`/chat?bias=${bias.slug}${langQuery ? `&${langQuery}` : ''}`}
                className="flex-1 px-4 py-3 text-center bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                {t(locale, 'talk')}
              </Link>
              <button
                type="button"
                onClick={handleShareFarcaster}
                className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                {t(locale, 'shareFarcaster')}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                {copied ? t(locale, 'copied') : t(locale, 'copyLink')}
              </button>
            </div>

            <button
              type="button"
              onClick={onShowBoard}
              className="w-full text-sm text-gray-500 underline hover:text-gray-700"
            >
              {t(locale, 'seeBoard')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

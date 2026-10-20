'use client';

import { useEffect, useRef, useState } from 'react';
import { Bias } from '@/lib/biases/data';
import { loadAnswer, saveAnswer } from '@/lib/biases/answers';
import { localizeBias } from '@/lib/biases/localized';
import { BETA_LOCALES, LOCALE_LABELS, Locale, pickerLocales } from '@/lib/i18n/locales';
import { t } from '@/lib/i18n/ui';
import { authedFetch, isInMiniApp } from '@/lib/miniapp';
import { PlayerState } from '@/lib/streaks/streak';
import BiasCard from './BiasCard';
import Leaderboard from './Leaderboard';

type Tab = 'card' | 'board';

interface FarcasterAppProps {
  /** The card in English: its option names are the keys answers are stored by. */
  bias: Bias;
  locale: Locale;
  dayNumber: number;
  isToday: boolean;
}

/**
 * Two views behind a toggle: today's card and the leaderboard. Someone who has
 * already played today lands on the leaderboard, and the card shows their result.
 */
export default function FarcasterApp({ bias, locale, dayNumber, isToday }: FarcasterAppProps) {
  const localized = localizeBias(bias, locale);
  const [tab, setTab] = useState<Tab>('card');
  const [picked, setPicked] = useState<string | null>(null);
  const [inMiniApp, setInMiniApp] = useState(false);
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [ready, setReady] = useState(false);
  const interacted = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const isOption = (a: unknown): a is string => typeof a === 'string' && bias.options.includes(a);
    const stored = loadAnswer(dayNumber);
    const local = isOption(stored) ? stored : null;
    if (local) {
      setPicked(local);
      if (isToday) setTab('board');
    }
    setReady(true);

    (async () => {
      const inApp = await isInMiniApp();
      if (cancelled || !inApp) return;
      setInMiniApp(true);
      const res = await authedFetch('/api/me');
      if (!res.ok || cancelled) return;
      const { player: me, todayAnswer } = await res.json();
      setPlayer(me);
      // Played on another device: show that result, unless the user has already acted here.
      if (isToday && isOption(todayAnswer) && !local && !interacted.current) {
        setPicked(todayAnswer);
        saveAnswer(dayNumber, todayAnswer);
        setTab('board');
      }
    })().catch(() => {
      // Streaks unavailable: the card still works.
    });
    return () => {
      cancelled = true;
    };
  }, [bias, dayNumber, isToday]);

  const handlePick = async (option: string) => {
    interacted.current = true;
    setPicked(option);
    saveAnswer(dayNumber, option);
    if (!isToday || !inMiniApp) return;
    try {
      const res = await authedFetch('/api/rep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day: dayNumber, answer: option }),
      });
      if (res.ok) setPlayer((await res.json()).player);
    } catch {
      // Streak not recorded; the card result still shows.
    }
  };

  const tabClass = (t: Tab) =>
    `flex-1 px-4 py-2 text-sm rounded-md transition-colors duration-200 ${
      tab === t ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-800'
    }`;

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {pickerLocales(locale).length > 1 && (
        <nav aria-label={t(locale, 'language')} className="flex flex-wrap justify-end gap-x-3 gap-y-1 text-sm">
          {pickerLocales(locale).map((l) => (
            <a
              key={l}
              href={`?day=${dayNumber}${l === 'en' ? '' : `&lang=${l}`}`}
              aria-current={l === locale ? 'true' : undefined}
              className={l === locale ? 'text-black font-medium' : 'text-gray-500 hover:text-gray-800'}
            >
              {LOCALE_LABELS[l]}
              {BETA_LOCALES.includes(l) && <sup className="ml-0.5 text-[10px] text-gray-400">Beta</sup>}
            </a>
          ))}
        </nav>
      )}

      <div role="tablist" aria-label="Views" className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'card'}
          onClick={() => setTab('card')}
          className={tabClass('card')}
        >
          {t(locale, 'tabCard')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'board'}
          onClick={() => setTab('board')}
          className={tabClass('board')}
        >
          {t(locale, 'tabBoard')}
        </button>
      </div>

      {!ready ? null : tab === 'card' ? (
        <BiasCard
          bias={localized}
          optionKeys={bias.options}
          answerKey={bias.name}
          locale={locale}
          dayNumber={dayNumber}
          isToday={isToday}
          picked={picked}
          onPick={handlePick}
          onShowBoard={() => setTab('board')}
        />
      ) : (
        <Leaderboard
          locale={locale}
          inMiniApp={inMiniApp}
          player={player}
          playedToday={isToday ? picked !== null : true}
          onPlayerChange={setPlayer}
          onPlay={() => setTab('card')}
        />
      )}
    </div>
  );
}

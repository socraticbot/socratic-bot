'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { authedFetch } from '@/lib/miniapp';
import { Locale } from '@/lib/i18n/locales';
import { dayCount, t } from '@/lib/i18n/ui';
import { PlayerState } from '@/lib/streaks/streak';

interface LeaderboardProps {
  locale: Locale;
  inMiniApp: boolean;
  player: PlayerState | null;
  playedToday: boolean;
  onPlayerChange: (player: PlayerState) => void;
  onPlay: () => void;
}

interface BoardEntry {
  fid: number;
  username: string;
  pfpUrl: string | null;
  streak: number;
}


/** Your streak, the opt-in toggle, and the top live streaks. Copy celebrates showing up. */
export default function Leaderboard({ locale, inMiniApp, player, playedToday, onPlayerChange, onPlay }: LeaderboardProps) {
  const days = (n: number) => dayCount(locale, n);
  const [board, setBoard] = useState<BoardEntry[] | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadBoard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard', { cache: 'no-store' });
      if (!res.ok) return setUnavailable(true);
      setBoard((await res.json()).entries);
    } catch {
      setUnavailable(true);
    }
  }, []);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const toggleOptIn = async () => {
    if (!player) return;
    setSaving(true);
    try {
      const res = await authedFetch('/api/leaderboard/opt-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optIn: !player.optIn }),
      });
      if (res.ok) {
        onPlayerChange((await res.json()).player);
        await loadBoard();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 fade-in">
      {inMiniApp && player && player.plays > 0 && (
        <div className="space-y-2">
          <p className="text-lg text-gray-800">
            <strong>{t(locale, 'yourStreak')}</strong> {t(locale, 'inARow', { days: days(player.streak) })}
          </p>
          <p className="text-sm text-gray-500">
            {t(locale, 'bestSpotted', { best: days(player.best), spotted: player.spotted, plays: player.plays })}
          </p>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={player.optIn}
              onChange={toggleOptIn}
              disabled={saving}
              className="h-4 w-4"
            />
            {t(locale, 'showMe')}
          </label>
        </div>
      )}

      {!playedToday && (
        <button
          type="button"
          onClick={onPlay}
          className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
        >
          {t(locale, 'playToday')}
        </button>
      )}
      {!inMiniApp && (
        <p className="text-sm text-gray-500">{t(locale, 'openInFarcaster')}</p>
      )}

      <section className="space-y-3" aria-label={t(locale, 'topStreaks')}>
        <h2 className="text-sm uppercase tracking-widest text-gray-400">{t(locale, 'topStreaks')}</h2>
        {unavailable ? (
          <p className="text-sm text-gray-500">{t(locale, 'boardUnavailable')}</p>
        ) : board === null ? (
          <p className="text-sm text-gray-400">{t(locale, 'loading')}</p>
        ) : board.length === 0 ? (
          <p className="text-sm text-gray-500">{t(locale, 'boardEmpty')}</p>
        ) : (
          <ol className="space-y-2">
            {board.map((entry, i) => (
              <li key={entry.fid} className="flex items-center gap-3 text-gray-700">
                <span className="w-5 text-right text-sm text-gray-400">{i + 1}</span>
                {entry.pfpUrl ? (
                  <Image
                    src={entry.pfpUrl}
                    alt=""
                    width={28}
                    height={28}
                    unoptimized
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-gray-200" />
                )}
                <span className="flex-1 truncate">@{entry.username}</span>
                <span className="text-sm text-gray-500">{days(entry.streak)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

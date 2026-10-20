'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { authedFetch, isInMiniApp } from '@/lib/miniapp';
import { PlayerState } from '@/lib/streaks/streak';

interface StreakPanelProps {
  day: number;
  answer: string;
  isToday: boolean;
}

interface BoardEntry {
  fid: number;
  username: string;
  pfpUrl: string | null;
  streak: number;
}

const days = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`;

/**
 * Streak and leaderboard, shown after answering. Hidden entirely when the
 * server has no storage configured. Copy celebrates showing up and never
 * shames a missed day.
 */
export default function StreakPanel({ day, answer, isToday }: StreakPanelProps) {
  const [available, setAvailable] = useState(true);
  const [inMiniApp, setInMiniApp] = useState(false);
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [board, setBoard] = useState<BoardEntry[] | null>(null);
  const [saving, setSaving] = useState(false);

  const loadBoard = async () => {
    const res = await fetch('/api/leaderboard');
    if (res.status === 503) return setAvailable(false);
    if (res.ok) setBoard((await res.json()).entries);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const inApp = await isInMiniApp();
      if (cancelled) return;
      setInMiniApp(inApp);
      if (inApp) {
        const res = isToday
          ? await authedFetch('/api/rep', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ day, answer }),
            })
          : await authedFetch('/api/me');
        if (res.status === 503) return setAvailable(false);
        if (res.ok && !cancelled) setPlayer((await res.json()).player);
      }
      await loadBoard();
    })().catch(() => setAvailable(false));
    return () => {
      cancelled = true;
    };
  }, [day, answer, isToday]);

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
        setPlayer((await res.json()).player);
        await loadBoard();
      }
    } finally {
      setSaving(false);
    }
  };

  if (!available) return null;

  return (
    <section className="space-y-4 pt-4 border-t border-gray-200" aria-label="Streaks">
      {inMiniApp && player && (
        <div className="space-y-2">
          <p className="text-base text-gray-800">
            <strong>Your streak:</strong> {days(player.streak)} in a row
          </p>
          <p className="text-sm text-gray-500">
            Best {days(player.best)} · Spotted {player.spotted} of {player.plays}
          </p>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={player.optIn}
              onChange={toggleOptIn}
              disabled={saving}
              className="h-4 w-4"
            />
            Show me on the leaderboard
          </label>
        </div>
      )}
      {!inMiniApp && (
        <p className="text-sm text-gray-500">Open Socratic Bot in Farcaster to keep a streak.</p>
      )}

      <div className="space-y-2">
        <h2 className="text-sm uppercase tracking-widest text-gray-400">Top streaks</h2>
        {board === null ? null : board.length === 0 ? (
          <p className="text-sm text-gray-500">No one on the board yet. Opt in to be the first.</p>
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
      </div>
    </section>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { authedFetch } from '@/lib/miniapp';
import { PlayerState } from '@/lib/streaks/streak';

interface LeaderboardProps {
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

const days = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`;

/** Your streak, the opt-in toggle, and the top live streaks. Copy celebrates showing up. */
export default function Leaderboard({ inMiniApp, player, playedToday, onPlayerChange, onPlay }: LeaderboardProps) {
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

      {!playedToday && (
        <button
          type="button"
          onClick={onPlay}
          className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
        >
          Play today's card
        </button>
      )}
      {!inMiniApp && (
        <p className="text-sm text-gray-500">Open Socratic Bot in Farcaster to keep a streak.</p>
      )}

      <section className="space-y-3" aria-label="Top streaks">
        <h2 className="text-sm uppercase tracking-widest text-gray-400">Top streaks</h2>
        {unavailable ? (
          <p className="text-sm text-gray-500">The leaderboard isn&apos;t available right now.</p>
        ) : board === null ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : board.length === 0 ? (
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
      </section>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { authedFetch } from '@/lib/miniapp';
import { Shift } from '@/lib/steelman/request';
import { Side, Topic, claimFor } from '@/lib/steelman/topics';
import { ScoreRow } from './FeedbackPanel';

interface GalleryEntry {
  fid: number;
  username: string | null;
  pfpUrl: string | null;
  text: string;
  scores: { charity: number; strength: number; depth: number };
  votes: number;
  voted: boolean;
  mine: boolean;
}

type Load =
  | { state: 'loading' }
  | { state: 'locked' }
  | { state: 'unavailable' }
  | { state: 'ready'; entries: GalleryEntry[]; shifts: Record<Shift, number> };

interface GalleryProps {
  topic: Topic;
  week: number;
  isThisWeek: boolean;
  /** The side the viewer argued, shown first. */
  side: Side | null;
  inMiniApp: boolean;
  /** Whether the viewer has a stored entry this week (unlocks this week's gallery and voting). */
  submitted: boolean;
  onWrite: () => void;
}

/** Signed in with Quick Auth inside a Mini App; a plain request on the web. */
function send(inMiniApp: boolean, input: string, init?: RequestInit): Promise<Response> {
  return inMiniApp ? authedFetch(input, init) : fetch(input, init);
}

/** Other writers' steel-mans of the same topic, side by side, best first. */
export default function Gallery({ topic, week, isThisWeek, side, inMiniApp, submitted, onWrite }: GalleryProps) {
  const [viewSide, setViewSide] = useState<Side>(side ?? 'for');
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [reported, setReported] = useState<Set<number>>(new Set());

  const loadEntries = useCallback(async () => {
    if (isThisWeek && !submitted) return setLoad({ state: 'locked' });
    setLoad({ state: 'loading' });
    try {
      const res = await send(inMiniApp, `/api/steel-man/entries?week=${week}&side=${viewSide}`, { cache: 'no-store' });
      if (res.status === 403) return setLoad({ state: 'locked' });
      if (!res.ok) return setLoad({ state: 'unavailable' });
      const { entries, shifts } = await res.json();
      setLoad({ state: 'ready', entries, shifts });
    } catch {
      setLoad({ state: 'unavailable' });
    }
  }, [inMiniApp, isThisWeek, submitted, viewSide, week]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const vote = async (author: number) => {
    if (load.state !== 'ready') return;
    const res = await send(inMiniApp, '/api/steel-man/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week, author }),
    }).catch(() => null);
    if (!res?.ok) return;
    const { votes } = await res.json();
    setLoad({
      ...load,
      entries: load.entries.map((e) => (e.fid === author ? { ...e, votes, voted: true } : e)),
    });
  };

  const report = async (author: number) => {
    const res = await send(inMiniApp, '/api/steel-man/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week, author }),
    }).catch(() => null);
    if (res?.ok) setReported(new Set(reported).add(author));
  };

  const sideClass = (s: Side) =>
    `flex-1 px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
      viewSide === s ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-800'
    }`;

  // Voting needs a signed-in writer with their own entry for the week.
  const canVote = inMiniApp && submitted;

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 fade-in">
      <div role="tablist" aria-label="Side" className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        {(['for', 'against'] as Side[]).map((s) => (
          <button key={s} type="button" role="tab" aria-selected={viewSide === s} onClick={() => setViewSide(s)} className={sideClass(s)}>
            {s === 'for' ? 'Arguing for' : 'Arguing against'}
          </button>
        ))}
      </div>
      <p className="text-gray-600 leading-relaxed">“{claimFor(topic, viewSide)}”</p>

      {load.state === 'loading' && <p className="text-sm text-gray-400">Loading…</p>}
      {load.state === 'unavailable' && <p className="text-sm text-gray-500">The arena isn&apos;t available right now.</p>}
      {load.state === 'locked' && (
        <div className="space-y-3">
          <p className="text-gray-700">
            Write and submit your own steel-man first. Then you&apos;ll see how others argued it, so nobody copies
            before they&apos;ve tried.
          </p>
          {!inMiniApp && <p className="text-sm text-gray-500">Submitting needs Farcaster: open Socratic Bot there.</p>}
          <button
            type="button"
            onClick={onWrite}
            className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            Write yours
          </button>
        </div>
      )}

      {load.state === 'ready' && (
        <>
          <ShiftSummary shifts={load.shifts} />
          {load.entries.length === 0 ? (
            <p className="text-sm text-gray-500">No one has argued this side yet.</p>
          ) : (
            <ol className="space-y-4">
              {load.entries.map((entry, i) => (
                <li key={entry.fid} className="p-4 bg-white border border-gray-200 rounded-lg space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <span className="w-5 text-right text-sm text-gray-400">{i + 1}</span>
                    {entry.pfpUrl ? (
                      <Image src={entry.pfpUrl} alt="" width={28} height={28} unoptimized className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-gray-200" />
                    )}
                    <span className="flex-1 truncate">
                      {entry.username ? `@${entry.username}` : 'You'}
                      {entry.mine && entry.username && <span className="text-sm text-gray-400"> (you)</span>}
                    </span>
                  </div>
                  <ScoreRow feedback={entry.scores} />
                  <EntryText text={entry.text} />
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <button
                      type="button"
                      onClick={() => vote(entry.fid)}
                      disabled={!canVote || entry.mine || entry.voted}
                      aria-pressed={entry.voted}
                      className={`px-3 py-1.5 border rounded-lg transition-colors duration-200 disabled:cursor-default ${
                        entry.voted ? 'border-green-500 bg-green-50 text-gray-800' : 'border-gray-300 text-gray-700 enabled:hover:bg-gray-50'
                      }`}
                    >
                      A proponent would sign this · {entry.votes}
                    </button>
                    {inMiniApp && !entry.mine && (
                      <button
                        type="button"
                        onClick={() => report(entry.fid)}
                        disabled={reported.has(entry.fid)}
                        className="text-gray-400 underline hover:text-gray-600 disabled:no-underline"
                      >
                        {reported.has(entry.fid) ? 'Reported' : 'Report'}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
}

/** Long entries start collapsed. */
function EntryText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 480;
  return (
    <div className="space-y-1">
      <p className={`whitespace-pre-wrap text-gray-700 leading-relaxed ${long && !open ? 'line-clamp-6' : ''}`}>{text}</p>
      {long && (
        <button type="button" onClick={() => setOpen(!open)} className="text-sm text-gray-500 underline hover:text-gray-700">
          {open ? 'Show less' : 'Read all'}
        </button>
      )}
    </div>
  );
}

/** "Did writing it move your view?" across everyone who submitted this week. */
function ShiftSummary({ shifts }: { shifts: Record<Shift, number> }) {
  const total = shifts.none + shifts.little + shifts.lot;
  if (total === 0) return null;
  const moved = shifts.little + shifts.lot;
  return (
    <p className="text-sm text-gray-500">
      {moved} of {total} {total === 1 ? 'writer' : 'writers'} this week said steel-manning moved their own view
      {shifts.lot > 0 ? ` (${shifts.lot} a lot)` : ''}.
    </p>
  );
}

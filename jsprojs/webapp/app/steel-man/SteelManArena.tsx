'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { authedFetch, composeCast, composeIntentUrl, isInMiniApp } from '@/lib/miniapp';
import { Draft, EMPTY_DRAFT, loadDraft, saveDraft } from '@/lib/steelman/draft';
import { SHIFTS, Shift } from '@/lib/steelman/request';
import { Feedback, MAX_ENTRY_CHARS, MIN_ENTRY_CHARS, fitMessage } from '@/lib/steelman/review';
import { ARENA_URL, arenaShareText, arenaUrlForWeek } from '@/lib/steelman/share';
import { Side, Topic, claimFor } from '@/lib/steelman/topics';
import { Stance, WEEK_START, sideToArgue } from '@/lib/steelman/weekly';
import FeedbackPanel from './FeedbackPanel';
import Gallery from './Gallery';

type Tab = 'write' | 'arena';

/** Draft reviews per week before submitting. Each one costs a model call. */
const MAX_DRAFT_ROUNDS = 3;

const STANCES: { stance: Stance; label: string }[] = [
  { stance: 'agree', label: 'I mostly agree' },
  { stance: 'disagree', label: 'I mostly disagree' },
  { stance: 'unsure', label: "I'm not sure" },
];

const SHIFT_LABELS: Record<Shift, string> = { none: 'Not at all', little: 'A little', lot: 'A lot' };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "26 Oct": the Monday a week starts, in UTC so server and client agree. */
function weekStartLabel(week: number): string {
  const d = new Date(WEEK_START + week * 7 * 24 * 60 * 60 * 1000);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

interface SteelManArenaProps {
  topic: Topic;
  week: number;
  isThisWeek: boolean;
}

/**
 * Pick where you stand, write the best case for the side you don't hold, get
 * feedback, revise, submit, then see how others argued it. Someone who has
 * already submitted this week sees their result and can open the arena.
 */
export default function SteelManArena({ topic, week, isThisWeek }: SteelManArenaProps) {
  const [tab, setTab] = useState<Tab>('write');
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [ready, setReady] = useState(false);
  const [inMiniApp, setInMiniApp] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [shift, setShift] = useState<Shift | null>(null);
  const [busy, setBusy] = useState<'review' | 'submit' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [crisis, setCrisis] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const interacted = useRef(false);

  const update = (next: Partial<Draft>) => {
    interacted.current = true;
    setDraft((prev) => {
      const merged = { ...prev, ...next };
      saveDraft(week, merged);
      return merged;
    });
  };

  useEffect(() => {
    let cancelled = false;
    const local = loadDraft(week);
    setDraft(local);
    setReady(true);

    (async () => {
      const inApp = await isInMiniApp();
      if (cancelled || !inApp) return;
      setInMiniApp(true);
      const res = await authedFetch(`/api/steel-man/me?week=${week}`);
      if (!res.ok || cancelled) return;
      const { entry } = await res.json();
      if (!entry) return;
      setSubmitted(true);
      // Submitted on another device: show that entry, unless the user has already started here.
      if (!interacted.current) {
        const restored: Draft = { ...local, stance: entry.stance, side: entry.side, text: entry.text, final: entry.feedback };
        setDraft(restored);
        saveDraft(week, restored);
        if (isThisWeek) setTab('arena');
      }
    })().catch(() => {
      // Submissions unavailable: writing and feedback still work.
    });
    return () => {
      cancelled = true;
    };
  }, [week, isThisWeek]);

  const { stance, side, text, rounds, final } = draft;
  const length = text.trim().length;
  const longEnough = length >= MIN_ENTRY_CHARS;
  // Submitting needs Farcaster sign-in and this week's topic; anything else is practice.
  const canSubmit = inMiniApp && isThisWeek;

  const chooseStance = (s: Stance) => update({ stance: s, side: sideToArgue(s) });

  /** POST to a review endpoint; returns the parsed body, or null after showing an error. */
  const post = async (path: string, body: object, signed: boolean) => {
    setError(null);
    setCrisis(null);
    const init = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
    const res = await (signed ? authedFetch(path, init) : fetch(path, init)).catch(() => null);
    if (!res) {
      setError('Could not reach the reviewer. Check your connection and try again.');
      return null;
    }
    const data = await res.json().catch(() => ({}));
    if (data.safety === 'crisis') {
      setCrisis(data.reply);
      return null;
    }
    return { status: res.status, ok: res.ok, data };
  };

  const requestFeedback = async () => {
    if (!side || !longEnough || busy) return;
    setBusy('review');
    try {
      const result = await post('/api/steel-man/review', { week, side, text }, false);
      if (!result) return;
      if (!result.ok) return setError(result.data.error ?? 'Something went wrong. Please try again.');
      update({ rounds: [...rounds, result.data.feedback as Feedback] });
    } finally {
      setBusy(null);
    }
  };

  /** Final review without storing anything, for the web and past weeks. */
  const finishPractice = async () => {
    const result = await post('/api/steel-man/review', { week, side, text }, false);
    if (!result) return;
    if (!result.ok) return setError(result.data.error ?? 'Something went wrong. Please try again.');
    const feedback = result.data.feedback as Feedback;
    const problem = fitMessage(feedback.fit);
    if (problem) {
      setError(problem);
      update({ rounds: [...rounds, feedback] });
      return;
    }
    update({ final: feedback });
  };

  const submit = async () => {
    if (!side || !stance || !shift || !longEnough || busy) return;
    setBusy('submit');
    try {
      if (!canSubmit) return await finishPractice();
      const result = await post('/api/steel-man/submit', { week, side, text, stance, shift }, true);
      if (!result) return;
      // Storage isn't set up yet: still give the final review.
      if (result.status === 503) return await finishPractice();
      if (result.status === 422) {
        setError(result.data.error);
        if (result.data.feedback) update({ rounds: [...rounds, result.data.feedback as Feedback] });
        return;
      }
      if (!result.ok) return setError(result.data.error ?? 'Something went wrong. Please try again.');
      const { entry } = result.data;
      setSubmitted(true);
      update({ text: entry.text, side: entry.side, stance: entry.stance, final: entry.feedback });
    } finally {
      setBusy(null);
    }
  };

  const share = async () => {
    const shareText = arenaShareText(week);
    const url = arenaUrlForWeek(week);
    if (await isInMiniApp()) return composeCast(shareText, url);
    window.open(composeIntentUrl(shareText, url), '_blank', 'noopener,noreferrer');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${arenaShareText(week)} ${arenaUrlForWeek(week)}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable: leave the button as is.
    }
  };

  const tabClass = (t: Tab) =>
    `flex-1 px-4 py-2 text-sm rounded-md transition-colors duration-200 ${
      tab === t ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-800'
    }`;

  const primary =
    'w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-default';
  const secondary =
    'w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:text-gray-400 disabled:cursor-default';

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div role="tablist" aria-label="Views" className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        <button type="button" role="tab" aria-selected={tab === 'write'} onClick={() => setTab('write')} className={tabClass('write')}>
          Your steel-man
        </button>
        <button type="button" role="tab" aria-selected={tab === 'arena'} onClick={() => setTab('arena')} className={tabClass('arena')}>
          The arena
        </button>
      </div>

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-gray-400 text-center">
          Steel-Man Arena #{week + 1} · Week of {weekStartLabel(week)}
        </p>
        <h1 className="text-2xl sm:text-3xl font-serif text-black text-center">“{topic.claim}”</h1>
        <p className="text-gray-600 leading-relaxed">{topic.context}</p>
        {!isThisWeek && (
          <p className="text-sm text-gray-500">
            This topic is from an earlier week, so it&apos;s for practice.{' '}
            <Link href={ARENA_URL} className="underline hover:text-gray-700">
              See this week&apos;s topic
            </Link>
          </p>
        )}
      </header>

      {!ready ? null : tab === 'arena' ? (
        <Gallery
          topic={topic}
          week={week}
          isThisWeek={isThisWeek}
          side={side}
          inMiniApp={inMiniApp}
          submitted={submitted}
          onWrite={() => setTab('write')}
        />
      ) : final ? (
        <div className="space-y-5 fade-in">
          <p className="text-base font-medium text-gray-800">
            {submitted ? 'Submitted. Here is the final review.' : 'Finished. Here is the final review.'}
          </p>
          <FeedbackPanel feedback={final} title="Final review" />
          <details className="text-gray-700">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Your steel-man: the case that “{side && claimFor(topic, side)}”
            </summary>
            <p className="mt-3 whitespace-pre-wrap leading-relaxed">{text}</p>
          </details>
          {!submitted && (
            <p className="text-sm text-gray-500">
              {inMiniApp
                ? "Past topics are practice, so this one wasn't submitted."
                : 'Open Socratic Bot in Farcaster to submit your steel-man and see how others argued.'}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <button type="button" onClick={() => setTab('arena')} className={`${primary} flex-1`}>
              See how others argued
            </button>
            <button type="button" onClick={share} className={`${secondary} flex-1`}>
              Share on Farcaster
            </button>
            <button type="button" onClick={copy} className={`${secondary} flex-1`}>
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
          <Link href="/chat" className="block text-center text-sm text-gray-500 underline hover:text-gray-700">
            Talk it through with Socratic Bot
          </Link>
        </div>
      ) : !side ? (
        <fieldset className="space-y-2 fade-in">
          <legend className="text-sm text-gray-500 mb-2">
            {stance === 'unsure' ? 'Which side do you find harder to believe? Argue that one.' : 'Where do you stand on this claim?'}
          </legend>
          {stance === 'unsure'
            ? (['for', 'against'] as Side[]).map((s) => (
                <button key={s} type="button" onClick={() => update({ side: s })} className={`${secondary} text-left`}>
                  Argue that “{claimFor(topic, s)}”
                </button>
              ))
            : STANCES.map(({ stance: s, label }) => (
                <button key={s} type="button" onClick={() => chooseStance(s)} className={`${secondary} text-left`}>
                  {label}
                </button>
              ))}
          {stance === 'unsure' && (
            <button type="button" onClick={() => update({ stance: null })} className="text-sm text-gray-500 underline hover:text-gray-700">
              Back
            </button>
          )}
        </fieldset>
      ) : (
        <div className="space-y-5 fade-in">
          <div className="space-y-2 p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">Your task: write the strongest case that</p>
            <p className="text-lg font-serif text-black">“{claimFor(topic, side)}”</p>
            <p className="text-sm text-gray-500">
              Write it so someone who believes this would read it and say, “Yes, that&apos;s exactly why.”{' '}
              <button type="button" onClick={() => update({ stance: null, side: null })} className="underline hover:text-gray-700">
                Change side
              </button>
            </p>
          </div>

          <details className="text-sm text-gray-600">
            <summary className="cursor-pointer text-gray-500 hover:text-gray-700">How to write a strong steel-man</summary>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li>Start from what proponents value, not from what you value.</li>
              <li>Use the best evidence they rely on, not the weakest version you&apos;ve heard.</li>
              <li>Answer the objection you&apos;d raise, the way they would answer it.</li>
              <li>No sarcasm or hedging. Write as if you believed it.</li>
            </ul>
          </details>

          <div className="space-y-1">
            <label htmlFor="steelman" className="sr-only">
              Your steel-man
            </label>
            <textarea
              id="steelman"
              value={text}
              onChange={(e) => update({ text: e.target.value })}
              maxLength={MAX_ENTRY_CHARS}
              rows={10}
              placeholder="Proponents of this view believe…"
              className="w-full p-4 text-gray-800 leading-relaxed bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
            />
            <p className="text-xs text-gray-400 text-right">
              {length} / {MAX_ENTRY_CHARS}
              {!longEnough && ` · at least ${MIN_ENTRY_CHARS}`}
            </p>
          </div>

          <button
            type="button"
            onClick={requestFeedback}
            disabled={!longEnough || busy !== null || rounds.length >= MAX_DRAFT_ROUNDS}
            className={secondary}
          >
            {busy === 'review'
              ? 'Reading your draft…'
              : rounds.length >= MAX_DRAFT_ROUNDS
                ? 'No draft feedback left this week'
                : `Get feedback on this draft (${MAX_DRAFT_ROUNDS - rounds.length} left)`}
          </button>

          <div aria-live="polite" className="space-y-4">
            {crisis && <p className="p-4 text-gray-800 bg-white border border-gray-200 rounded-lg">{crisis}</p>}
            {error && <p className="text-sm text-red-700">{error}</p>}
            {rounds.length > 0 && (
              <FeedbackPanel feedback={rounds[rounds.length - 1]} title={`Feedback on draft ${rounds.length}`} />
            )}
          </div>
          {rounds.length > 1 && (
            <details className="text-sm text-gray-500">
              <summary className="cursor-pointer hover:text-gray-700">Earlier feedback</summary>
              <div className="mt-3 space-y-3">
                {rounds.slice(0, -1).map((f, i) => (
                  <FeedbackPanel key={i} feedback={f} title={`Feedback on draft ${i + 1}`} />
                ))}
              </div>
            </details>
          )}

          <fieldset className="space-y-2 pt-2 border-t border-gray-200">
            <legend className="pt-4 text-sm text-gray-500">Has writing this moved your own view?</legend>
            <div className="flex gap-2">
              {SHIFTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setShift(s)}
                  aria-pressed={shift === s}
                  className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-colors duration-200 ${
                    shift === s ? 'border-gray-800 bg-gray-100 text-black' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {SHIFT_LABELS[s]}
                </button>
              ))}
            </div>
          </fieldset>

          <button type="button" onClick={submit} disabled={!longEnough || !shift || busy !== null} className={primary}>
            {busy === 'submit' ? 'Reviewing…' : canSubmit ? 'Submit your steel-man' : 'Finish and get the final review'}
          </button>
          <p className="text-xs text-gray-400 text-center">
            {canSubmit
              ? 'One submission per week. Others see it, with your username, after they submit theirs.'
              : isThisWeek
                ? 'Open Socratic Bot in Farcaster to submit and see how others argued.'
                : 'Past topics are for practice, so nothing is submitted.'}
          </p>
        </div>
      )}

      <details className="pt-4 text-sm text-gray-500 border-t border-gray-200">
        <summary className="cursor-pointer hover:text-gray-700">Why steel-man?</summary>
        <div className="mt-3 space-y-2 leading-relaxed">
          <p>
            Arguing the strongest version of a view you reject trains actively open-minded thinking: weighing reasons on
            their merits rather than by which side they serve. People who score higher on it are better at judging an
            argument&apos;s quality independently of whether they agree with it (Stanovich &amp; West, 1997; Baron, 2019).
          </p>
          <p>
            &ldquo;Consider the opposite&rdquo; is one of the most reliable debiasing strategies known: deliberately
            building the case for the other side reduces biased assimilation of evidence (Lord, Lepper &amp; Preston,
            1984; Larrick, 2004).
          </p>
          <p>
            The test of a steel-man is whether a proponent would accept it as their own, Caplan&apos;s &ldquo;ideological
            Turing test&rdquo;. Feedback on your own writing is what makes practice stick.
          </p>
        </div>
      </details>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { composeCast, composeIntentUrl, isInMiniApp } from '@/lib/miniapp';
import { ARENA_URL, arenaShareText, arenaUrlForWeek, steelmanCastText } from '@/lib/steelman/share';
import { Side, Topic, claimFor } from '@/lib/steelman/topics';
import { Stance, WEEK_START, sideToArgue } from '@/lib/steelman/weekly';

const STANCES: { stance: Stance; label: string }[] = [
  { stance: 'agree', label: 'I mostly agree' },
  { stance: 'disagree', label: 'I mostly disagree' },
  { stance: 'unsure', label: "I'm not sure" },
];

/** Read before posting, in place of feedback: the questions a proponent would ask of your steel-man. */
const CHECKS = [
  'Would someone who believes this read it and say, “Yes, that’s exactly why”?',
  'Does it start from what they value?',
  'Does it use the strongest evidence they rely on?',
  'Does it answer the objection you’d raise, the way they would?',
  'No sarcasm or hedging: is it written as if you believed it?',
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "26 Oct": the Monday a week starts, in UTC so server and client agree. */
function weekStartLabel(week: number): string {
  const d = new Date(WEEK_START + week * 7 * 24 * 60 * 60 * 1000);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/** Open the Farcaster composer: the host's inside a Mini App, the compose intent on the web. */
async function compose(text: string, url: string) {
  if (await isInMiniApp()) return composeCast(text, url);
  window.open(composeIntentUrl(text, url), '_blank', 'noopener,noreferrer');
}

interface SteelManArenaProps {
  topic: Topic;
  week: number;
  isThisWeek: boolean;
}

/**
 * Say where you stand, then write the strongest case for the side you don't
 * hold, as a cast. The cast embeds this page, so everyone who reads it can
 * write their own.
 */
export default function SteelManArena({ topic, week, isThisWeek }: SteelManArenaProps) {
  const [stance, setStance] = useState<Stance | null>(null);
  const [side, setSide] = useState<Side | null>(null);
  const [copied, setCopied] = useState(false);

  const chooseStance = (s: Stance) => {
    setStance(s);
    setSide(sideToArgue(s));
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

  const primary = 'w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200';
  const secondary =
    'w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200';

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-gray-400 text-center">
          Steel-Man Arena #{week + 1} · Week of {weekStartLabel(week)}
        </p>
        <h1 className="text-2xl sm:text-3xl font-serif text-black text-center">“{topic.claim}”</h1>
        <p className="text-gray-600 leading-relaxed">{topic.context}</p>
        {!isThisWeek && (
          <p className="text-sm text-gray-500">
            This topic is from an earlier week.{' '}
            <Link href={ARENA_URL} className="underline hover:text-gray-700">
              See this week&apos;s topic
            </Link>
          </p>
        )}
      </header>

      {!side ? (
        <fieldset className="space-y-2 fade-in">
          <legend className="text-sm text-gray-500 mb-2">
            {stance === 'unsure' ? 'Which side do you find harder to believe? Argue that one.' : 'Where do you stand on this claim?'}
          </legend>
          {stance === 'unsure'
            ? (['for', 'against'] as Side[]).map((s) => (
                <button key={s} type="button" onClick={() => setSide(s)} className={`${secondary} text-left`}>
                  Argue that “{claimFor(topic, s)}”
                </button>
              ))
            : STANCES.map(({ stance: s, label }) => (
                <button key={s} type="button" onClick={() => chooseStance(s)} className={`${secondary} text-left`}>
                  {label}
                </button>
              ))}
          {stance === 'unsure' && (
            <button type="button" onClick={() => setStance(null)} className="text-sm text-gray-500 underline hover:text-gray-700">
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
              Write it the way a thoughtful believer would.{' '}
              <button
                type="button"
                onClick={() => {
                  setStance(null);
                  setSide(null);
                }}
                className="underline hover:text-gray-700"
              >
                Change side
              </button>
            </p>
          </div>

          <section className="space-y-2" aria-label="Before you post">
            <h2 className="text-sm uppercase tracking-widest text-gray-400">Before you post, check</h2>
            <ul className="space-y-2 text-gray-700 leading-relaxed list-disc pl-5">
              {CHECKS.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ul>
          </section>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => compose(steelmanCastText(week, claimFor(topic, side)), arenaUrlForWeek(week))}
              className={primary}
            >
              Post your steel-man on Farcaster
            </button>
            <p className="text-xs text-gray-400 text-center">
              Your cast links back here, so anyone who reads it can write their own.
            </p>
          </div>
          <button type="button" onClick={copy} className={secondary}>
            {copied ? 'Copied' : 'Copy link to this week’s topic'}
          </button>
        </div>
      )}

      <details className="pt-4 text-sm text-gray-500 border-t border-gray-200">
        <summary className="cursor-pointer hover:text-gray-700">Why steel-man?</summary>
        <div className="mt-3 space-y-2 leading-relaxed">
          <p>
            Arguing the strongest version of a view you reject trains actively open-minded thinking, the habit of
            weighing each reason on its merits. People who score higher on it are better at judging an
            argument&apos;s quality independently of whether they agree with it (Stanovich &amp; West, 1997; Baron, 2019).
          </p>
          <p>
            &ldquo;Consider the opposite&rdquo; is one of the most reliable debiasing strategies known: deliberately
            building the case for the other side reduces biased assimilation of evidence (Lord, Lepper &amp; Preston,
            1984; Larrick, 2004).
          </p>
          <p>
            The test of a steel-man is whether a proponent would accept it as their own, Caplan&apos;s &ldquo;ideological
            Turing test&rdquo;.
          </p>
        </div>
      </details>
    </div>
  );
}

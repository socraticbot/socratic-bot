import { Feedback, fitMessage } from '@/lib/steelman/review';

const SCORES: { key: 'charity' | 'strength' | 'depth'; label: string; hint: string }[] = [
  { key: 'charity', label: 'Charity', hint: 'Would a proponent sign it?' },
  { key: 'strength', label: 'Strength', hint: 'Their best reasons, not the easiest ones' },
  { key: 'depth', label: 'Depth', hint: 'The values and objections underneath' },
];

/** A 1-to-5 score as five dots, with the number for screen readers. */
function Dots({ value }: { value: number }) {
  return (
    <span className="flex gap-1" role="img" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`w-2.5 h-2.5 rounded-full ${n <= value ? 'bg-gray-800' : 'bg-gray-200'}`} />
      ))}
    </span>
  );
}

export function ScoreRow({ feedback }: { feedback: Pick<Feedback, 'charity' | 'strength' | 'depth'> }) {
  return (
    <dl className="grid grid-cols-3 gap-3">
      {SCORES.map(({ key, label }) => (
        <div key={key} className="space-y-1">
          <dt className="text-xs uppercase tracking-widest text-gray-400">{label}</dt>
          <dd>
            <Dots value={feedback[key]} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

interface FeedbackPanelProps {
  feedback: Feedback;
  /** Heading above the panel, e.g. "Feedback on draft 2". */
  title: string;
}

/** The reviewer's read on one draft: scores, then what a proponent would say. */
export default function FeedbackPanel({ feedback, title }: FeedbackPanelProps) {
  const problem = fitMessage(feedback.fit);
  return (
    <section className="space-y-4 p-4 sm:p-5 bg-white border border-gray-200 rounded-lg fade-in" aria-label={title}>
      <h2 className="text-sm uppercase tracking-widest text-gray-400">{title}</h2>
      {problem ? (
        <p className="text-gray-800">{problem}</p>
      ) : (
        <>
          <ScoreRow feedback={feedback} />
          <details className="text-sm text-gray-500">
            <summary className="cursor-pointer hover:text-gray-700">What the scores mean</summary>
            <ul className="mt-2 space-y-1">
              {SCORES.map(({ key, label, hint }) => (
                <li key={key}>
                  <strong className="font-medium text-gray-600">{label}:</strong> {hint}. Most honest first drafts score 2
                  or 3.
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
      <div className="space-y-3 text-gray-700 leading-relaxed">
        <p>
          <strong className="font-medium text-gray-900">What you got right:</strong> {feedback.gotRight}
        </p>
        {feedback.strawman && (
          <p>
            <strong className="font-medium text-gray-900">Where a proponent would wince:</strong> {feedback.strawman}
          </p>
        )}
        <p>
          <strong className="font-medium text-gray-900">The strongest case you missed:</strong> {feedback.missed}
        </p>
        <p className="text-gray-600">
          <strong className="font-medium text-gray-900">Ask yourself:</strong> {feedback.question}
        </p>
      </div>
    </section>
  );
}

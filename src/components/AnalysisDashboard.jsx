import React from 'react';

/**
 * AnalysisDashboard
 *
 * Displays the AI's scoring and fallacy detection after a debate ends.
 *
 * Props:
 *   analysis: {
 *     logicScore: number,
 *     evidenceScore: number,
 *     persuasionScore: number,
 *     summary: string,
 *     fallacies: [{ name: string, explanation: string }],
 *     feedback: string,
 *   }
 */
export default function AnalysisDashboard({ analysis }) {
  if (!analysis) return null;

  const { logicScore, evidenceScore, persuasionScore, summary, fallacies, feedback } = analysis;

  return (
    <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-xl">
      <h2 className="mb-4 text-2xl font-semibold text-indigo-300">Debate Analysis</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-800 p-4 text-center">
          <p className="text-sm font-medium text-slate-400">Logic</p>
          <p className="mt-1 text-xl font-bold text-indigo-400">{logicScore}/10</p>
        </div>
        <div className="rounded-xl bg-slate-800 p-4 text-center">
          <p className="text-sm font-medium text-slate-400">Evidence</p>
          <p className="mt-1 text-xl font-bold text-indigo-400">{evidenceScore}/10</p>
        </div>
        <div className="rounded-xl bg-slate-800 p-4 text-center">
          <p className="text-sm font-medium text-slate-400">Persuasion</p>
          <p className="mt-1 text-xl font-bold text-indigo-400">{persuasionScore}/10</p>
        </div>
      </div>

      <section className="mt-6">
        <h3 className="text-lg font-medium text-slate-300">Summary</h3>
        <p className="mt-2 text-sm text-slate-200">{summary}</p>
      </section>

      {fallacies && fallacies.length > 0 && (
        <section className="mt-6">
          <h3 className="text-lg font-medium text-slate-300">Detected Fallacies</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200">
            {fallacies.map((f, i) => (
              <li key={i}>
                <strong>{f.name}:</strong> {f.explanation}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6">
        <h3 className="text-lg font-medium text-slate-300">Personalized Feedback</h3>
        <p className="mt-2 text-sm text-slate-200">{feedback}</p>
      </section>
    </div>
  );
}

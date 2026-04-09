import { useState } from 'react';
import { distillPersona } from './api';
import type { Persona } from './types';

interface Props {
  onCreated: (persona: Persona) => void;
  onBack: () => void;
}

const SAMPLE_PROMPTS = [
  'Paste essays, tweets, interviews, or any text written by the person...',
  'Try: a blog post, a series of tweets, a transcript, or a book excerpt',
];

export function PersonaCreate({ onCreated, onBack }: Props) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState<'idle' | 'analyzing' | 'building'>('idle');

  async function handleDistill() {
    if (text.trim().length < 100) {
      setError('Paste at least a paragraph of text to distill from.');
      return;
    }
    setError('');
    setLoading(true);
    setStage('analyzing');

    setTimeout(() => setStage('building'), 3000);

    try {
      const persona = await distillPersona(text, name);
      onCreated(persona);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Distillation failed');
    } finally {
      setLoading(false);
      setStage('idle');
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={onBack}
        className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors"
      >
        ← Back to library
      </button>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Distill a Persona</h2>
        <p className="text-slate-400">
          Paste text from any person — essays, tweets, interviews, transcripts.
          Claude will extract their thinking style, mental models, and communication patterns.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Person's name <span className="text-slate-500">(optional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Naval Ravikant"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Text to distill from{' '}
            <span className="text-slate-500">
              — more = better ({text.length.toLocaleString()} chars)
            </span>
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={SAMPLE_PROMPTS[0]}
            rows={12}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none font-mono text-sm leading-relaxed"
          />
          <div className="text-xs text-slate-500 mt-1">
            Aim for 500–5000 words. Multiple sources work great — paste and combine.
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleDistill}
          disabled={loading || text.trim().length < 100}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <span className="animate-spin text-lg">⟳</span>
              {stage === 'analyzing' ? 'Analyzing thinking patterns…' : 'Building persona…'}
            </>
          ) : (
            '✦ Distill Persona'
          )}
        </button>

        {loading && (
          <div className="text-center text-slate-500 text-sm">
            This takes ~10 seconds. Claude is extracting mental models, beliefs, and communication style.
          </div>
        )}
      </div>
    </div>
  );
}

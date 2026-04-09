import { useState } from 'react'
import type { Persona } from '../types'

interface Props {
  onPersonaCreated: (persona: Persona) => void
  onCancel: () => void
}

const EMOJI_OPTIONS = ['🧬', '💡', '🔭', '⚡', '🎯', '🧠', '🏛️', '🔮', '📐', '🌀']

export function CreatePersona({ onPersonaCreated, onCancel }: Props) {
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [emoji, setEmoji] = useState('🧬')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stage, setStage] = useState<'extracting' | 'building' | null>(null)

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (text.trim().length < 100) {
      setError('Paste at least a paragraph (100+ characters) for a meaningful distillation.')
      return
    }
    setError('')
    setLoading(true)
    setStage('extracting')

    try {
      setTimeout(() => setStage('building'), 3000)

      const res = await fetch('./api/distill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, name: name.trim() || 'Unknown Thinker' }),
      })

      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Distillation failed')

      const persona: Persona = {
        ...data.persona,
        id: `custom-${Date.now()}`,
        avatar: emoji,
        name: name.trim() || data.persona.name || 'Unknown Thinker',
        isCustom: true,
        createdAt: Date.now(),
      }
      onPersonaCreated(persona)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStage(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-1">Distill a New Persona</h2>
      <p className="text-slate-400 text-sm mb-8">
        Paste essays, tweets, transcripts, book excerpts — anything that captures how someone thinks.
        The more text, the richer the distillation.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name + emoji */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-slate-300 text-sm font-medium mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Naval Ravikant"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">Avatar</label>
            <div className="flex gap-1.5 flex-wrap w-48">
              {EMOJI_OPTIONS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-9 h-9 rounded-lg text-xl transition-colors ${
                    emoji === e
                      ? 'bg-indigo-600/40 border border-indigo-500'
                      : 'bg-slate-800 border border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Text area */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-slate-300 text-sm font-medium">
              Text to Distill
            </label>
            <span className={`text-xs ${wordCount < 50 ? 'text-slate-500' : wordCount < 200 ? 'text-yellow-500' : 'text-emerald-400'}`}>
              {wordCount} words {wordCount < 50 ? '(needs more)' : wordCount < 200 ? '(decent)' : '(great)'}
            </span>
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste essays, tweets, transcripts, quotes, book excerpts…

The more text you provide, the richer and more accurate the persona distillation."
            rows={12}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none font-mono text-sm leading-relaxed"
          />
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="bg-indigo-900/20 border border-indigo-700/50 rounded-lg px-4 py-4 text-center">
            <div className="text-indigo-300 font-medium mb-1">
              {stage === 'extracting' ? '🔍 Extracting cognitive fingerprint…' : '🧬 Building persona distillation…'}
            </div>
            <div className="text-slate-400 text-sm">
              Claude is analyzing thinking patterns, mental models, and communication style
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || text.length < 50}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/50 disabled:text-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Distilling…' : '🧬 Distill Persona'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

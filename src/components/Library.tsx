import type { Persona } from '../types'
import type { Preset } from '../presets'

interface Props {
  presets: Preset[]
  personas: Persona[]
  loadingPreset: string | null
  onDistillPreset: (preset: Preset) => void
  onChatWithPersona: (persona: Persona) => void
  onDeletePersona: (id: string) => void
  onCreateNew: () => void
}

export function Library({ presets, personas, loadingPreset, onDistillPreset, onChatWithPersona, onDeletePersona, onCreateNew }: Props) {
  const distilledIds = new Set(personas.map(p => p.id))

  return (
    <div>
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Persona Distill Playground</h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Paste text from any thinker — Claude extracts their cognitive fingerprint and lets you chat with it.
          Stress-test ideas against different mental frameworks.
        </p>
      </div>

      {/* Presets */}
      <section className="mb-10">
        <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider mb-4">
          Featured Thinkers — click to distill &amp; chat
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map(preset => {
            const isDistilled = distilledIds.has(preset.id)
            const isLoading = loadingPreset === preset.id
            const persona = personas.find(p => p.id === preset.id)

            return (
              <button
                key={preset.id}
                onClick={() => isDistilled && persona ? onChatWithPersona(persona) : onDistillPreset(preset)}
                disabled={isLoading}
                className="text-left p-5 rounded-xl border border-slate-700 bg-slate-900/50 hover:border-indigo-500 hover:bg-slate-800/70 transition-all group disabled:opacity-60 disabled:cursor-wait"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{preset.emoji}</span>
                  {isDistilled && (
                    <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                      Distilled
                    </span>
                  )}
                  {isLoading && (
                    <span className="text-xs text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full animate-pulse">
                      Distilling…
                    </span>
                  )}
                </div>
                <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  {preset.name}
                </div>
                <div className="text-slate-400 text-sm mt-0.5">{preset.role}</div>
                <div className="text-slate-500 text-xs mt-2 line-clamp-2">{preset.source}</div>
                {isDistilled && persona && (
                  <div className="mt-3 text-indigo-400 text-xs">
                    "{persona.tagline}"
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* Custom personas */}
      {personas.filter(p => p.isCustom).length > 0 && (
        <section className="mb-10">
          <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider mb-4">
            Your Custom Personas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {personas.filter(p => p.isCustom).map(persona => (
              <div key={persona.id} className="relative group">
                <button
                  onClick={() => onChatWithPersona(persona)}
                  className="w-full text-left p-5 rounded-xl border border-slate-700 bg-slate-900/50 hover:border-indigo-500 hover:bg-slate-800/70 transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{persona.avatar || '🧬'}</span>
                    <div>
                      <div className="font-semibold text-white">{persona.name}</div>
                      <div className="text-slate-500 text-xs mt-0.5">
                        {new Date(persona.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-400 text-sm line-clamp-2">{persona.tagline}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {persona.mentalModels.slice(0, 2).map(m => (
                      <span key={m.name} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                        {m.name}
                      </span>
                    ))}
                  </div>
                </button>
                <button
                  onClick={() => onDeletePersona(persona.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-red-400 text-xs px-2 py-1"
                  title="Delete persona"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA if empty */}
      {personas.length === 0 && (
        <div className="border border-dashed border-slate-700 rounded-xl p-10 text-center">
          <div className="text-4xl mb-3">🧬</div>
          <div className="text-slate-300 font-medium mb-1">No custom personas yet</div>
          <div className="text-slate-500 text-sm mb-4">
            Click a featured thinker above to distill them, or paste your own text
          </div>
          <button
            onClick={onCreateNew}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm transition-colors"
          >
            + New Persona
          </button>
        </div>
      )}
    </div>
  )
}

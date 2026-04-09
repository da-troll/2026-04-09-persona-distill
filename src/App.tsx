import { useState, useEffect } from 'react'
import './index.css'
import type { Persona, View } from './types'
import { PRESETS } from './presets'
import { Library } from './components/Library'
import { CreatePersona } from './components/CreatePersona'
import { Chat } from './components/Chat'

const STORAGE_KEY = 'persona-distill-personas'

function loadPersonas(): Persona[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Persona[]
  } catch { return [] }
}

function savePersonas(personas: Persona[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(personas))
}

export default function App() {
  const [view, setView] = useState<View>({ type: 'library' })
  const [customPersonas, setCustomPersonas] = useState<Persona[]>(loadPersonas)
  const [prebuiltPersonas, setPrebuiltPersonas] = useState<Persona[]>([])
  const [loadingPreset, setLoadingPreset] = useState<string | null>(null)

  // Prebuilt personas are cached in localStorage too
  useEffect(() => {
    const cached = localStorage.getItem('persona-distill-prebuilt')
    if (cached) {
      try { setPrebuiltPersonas(JSON.parse(cached)) } catch {}
    }
  }, [])

  const allPersonas = [...prebuiltPersonas, ...customPersonas]

  function addPersona(p: Persona) {
    if (p.isCustom) {
      const next = [...customPersonas, p]
      setCustomPersonas(next)
      savePersonas(next)
    } else {
      const next = [...prebuiltPersonas, p]
      setPrebuiltPersonas(next)
      localStorage.setItem('persona-distill-prebuilt', JSON.stringify(next))
    }
  }

  function deletePersona(id: string) {
    const nextCustom = customPersonas.filter(p => p.id !== id)
    setCustomPersonas(nextCustom)
    savePersonas(nextCustom)
    const nextBuilt = prebuiltPersonas.filter(p => p.id !== id)
    setPrebuiltPersonas(nextBuilt)
    localStorage.setItem('persona-distill-prebuilt', JSON.stringify(nextBuilt))
    if (view.type === 'chat' && view.persona.id === id) {
      setView({ type: 'library' })
    }
  }

  async function distillPreset(preset: typeof PRESETS[0]) {
    if (allPersonas.find(p => p.id === preset.id)) {
      setView({ type: 'chat', persona: allPersonas.find(p => p.id === preset.id)! })
      return
    }
    setLoadingPreset(preset.id)
    try {
      const res = await fetch('./api/distill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: preset.excerpt, name: preset.name }),
      })
      const data = await res.json()
      if (data.persona) {
        const persona: Persona = {
          ...data.persona,
          id: preset.id,
          avatar: preset.emoji,
          isCustom: false,
          createdAt: Date.now(),
        }
        addPersona(persona)
        setView({ type: 'chat', persona })
      }
    } finally {
      setLoadingPreset(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => setView({ type: 'library' })}
          className="flex items-center gap-2 text-indigo-400 font-semibold text-lg hover:text-indigo-300 transition-colors"
        >
          🧬 Persona Distill
        </button>
        <span className="text-slate-600 text-sm">·</span>
        <span className="text-slate-500 text-sm">
          {allPersonas.length} distilled {allPersonas.length === 1 ? 'persona' : 'personas'}
        </span>
        <div className="ml-auto flex gap-2">
          {view.type === 'chat' && (
            <button
              onClick={() => setView({ type: 'library' })}
              className="text-slate-400 hover:text-slate-200 text-sm px-3 py-1 rounded border border-slate-700 hover:border-slate-500 transition-colors"
            >
              ← Library
            </button>
          )}
          {view.type !== 'create' && (
            <button
              onClick={() => setView({ type: 'create' })}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-1.5 rounded transition-colors"
            >
              + New Persona
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {view.type === 'library' && (
          <Library
            presets={PRESETS}
            personas={allPersonas}
            loadingPreset={loadingPreset}
            onDistillPreset={distillPreset}
            onChatWithPersona={(p) => setView({ type: 'chat', persona: p })}
            onDeletePersona={deletePersona}
            onCreateNew={() => setView({ type: 'create' })}
          />
        )}
        {view.type === 'create' && (
          <CreatePersona
            onPersonaCreated={(p) => {
              addPersona(p)
              setView({ type: 'chat', persona: p })
            }}
            onCancel={() => setView({ type: 'library' })}
          />
        )}
        {view.type === 'chat' && (
          <Chat
            persona={view.persona}
            onBack={() => setView({ type: 'library' })}
          />
        )}
      </main>
    </div>
  )
}

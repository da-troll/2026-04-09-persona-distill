import { useState, useRef, useEffect, useCallback } from 'react'
import type { Persona, ChatMessage } from '../types'

interface Props {
  persona: Persona
  onBack?: () => void
}

export function Chat({ persona }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [showCard, setShowCard] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async () => {
    const content = input.trim()
    if (!content || streaming) return
    setInput('')
    setShowCard(false)

    const userMsg: ChatMessage = { role: 'user', content }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setStreaming(true)

    // Placeholder for streaming response
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('./api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          systemPrompt: persona.systemPrompt,
          personaName: persona.name,
        }),
      })

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const event = JSON.parse(data)
            if (event.error) throw new Error(event.error)
            if (event.text) {
              accumulated += event.text
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: accumulated }
                return updated
              })
            }
          } catch {}
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: `_Error: ${err instanceof Error ? err.message : 'Failed to get response'}_`,
        }
        return updated
      })
    } finally {
      setStreaming(false)
      textareaRef.current?.focus()
    }
  }, [input, messages, streaming, persona])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const STARTERS = [
    `What's your framework for making hard decisions?`,
    `What do most people get wrong about your domain?`,
    `What would you push back on in current conventional wisdom?`,
    `How do you think about long-term vs short-term tradeoffs?`,
    `What's the most important thing you've changed your mind on?`,
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-130px)]">
      {/* Persona header */}
      <div className="flex items-center gap-4 pb-4 border-b border-slate-800 mb-4 flex-shrink-0">
        <div className="text-4xl">{persona.avatar || '🧬'}</div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-lg">{persona.name}</div>
          <div className="text-slate-400 text-sm truncate">{persona.tagline}</div>
        </div>
        <button
          onClick={() => setShowCard(v => !v)}
          className="text-slate-500 hover:text-slate-300 text-xs px-3 py-1.5 rounded border border-slate-700 hover:border-slate-500 transition-colors flex-shrink-0"
        >
          {showCard ? 'Hide card' : 'Show card'}
        </button>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Persona card sidebar */}
        {showCard && (
          <aside className="w-72 flex-shrink-0 overflow-y-auto space-y-4">
            {/* Core beliefs */}
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Core Beliefs</div>
              <ul className="space-y-1.5">
                {persona.coreBeliefs.map((b, i) => (
                  <li key={i} className="text-slate-300 text-sm flex gap-2">
                    <span className="text-indigo-500 flex-shrink-0">·</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mental models */}
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Mental Models</div>
              <div className="space-y-2.5">
                {persona.mentalModels.map((m, i) => (
                  <div key={i}>
                    <div className="text-indigo-400 text-xs font-medium">{m.name}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{m.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Communication */}
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Communication Style</div>
              <div className="space-y-1.5 text-xs">
                <div><span className="text-slate-500">Tone:</span> <span className="text-slate-300">{persona.communicationStyle.tone}</span></div>
                <div><span className="text-slate-500">Structure:</span> <span className="text-slate-300">{persona.communicationStyle.structure}</span></div>
                <div><span className="text-slate-500">Signature:</span> <span className="text-slate-300">{persona.communicationStyle.signature}</span></div>
              </div>
            </div>

            {/* Would push back on */}
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Would Push Back On</div>
              <ul className="space-y-1.5">
                {persona.wouldPushBackOn.map((w, i) => (
                  <li key={i} className="text-slate-300 text-sm flex gap-2">
                    <span className="text-red-500 flex-shrink-0">✗</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Phrases */}
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Characteristic Phrases</div>
              <div className="space-y-1.5">
                {persona.characteristicPhrases.map((ph, i) => (
                  <div key={i} className="text-slate-400 text-xs italic">"{ph}"</div>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="text-center text-slate-500 text-sm py-6">
                  Start a conversation with distilled {persona.name}
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {STARTERS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(s); textareaRef.current?.focus() }}
                      className="text-left text-sm text-slate-400 hover:text-slate-200 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-lg px-4 py-2.5 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-800 text-lg mt-0.5">
                    {persona.avatar || '🧬'}
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm chat-message ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-slate-800 text-slate-200 rounded-bl-sm'
                  } ${msg.role === 'assistant' && streaming && i === messages.length - 1 && !msg.content ? 'streaming-cursor' : ''}`}
                >
                  {msg.content ? (
                    <div className={msg.role === 'assistant' && streaming && i === messages.length - 1 ? 'streaming-cursor' : ''}>
                      {msg.content.split('\n').map((line, j) => (
                        <span key={j}>
                          {line}
                          {j < msg.content.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="streaming-cursor" />
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="pt-4 flex-shrink-0">
            <div className="flex gap-2 items-end bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 focus-within:border-indigo-500 transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask distilled ${persona.name}…`}
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-slate-500 resize-none focus:outline-none text-sm leading-relaxed max-h-32 overflow-y-auto"
                style={{ fieldSizing: 'content' } as React.CSSProperties}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || streaming}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg px-3 py-1.5 text-sm transition-colors flex-shrink-0"
              >
                {streaming ? '…' : '↑'}
              </button>
            </div>
            <div className="text-slate-600 text-xs mt-1.5 text-center">
              Responding in {persona.name}'s thinking style · Enter to send · Shift+Enter for newline
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

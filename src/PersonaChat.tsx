import { useState, useRef, useEffect, useCallback } from 'react';
import { streamChat } from './api';
import type { ChatMessage, Persona } from './types';

interface Props {
  persona: Persona;
  onBack: () => void;
}

const STARTERS = [
  "What's the most common mistake you see people make in your domain?",
  "How do you decide what to work on?",
  "What's a belief you hold that most people disagree with?",
  "What would you tell someone just starting out?",
  "How do you think about risk?",
];

export function PersonaChat({ persona, onBack }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;
    setError('');
    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    // Add empty assistant message to stream into
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      await streamChat(
        newMessages,
        persona.systemPrompt,
        (chunk) => {
          setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.role === 'assistant') {
              updated[updated.length - 1] = { ...last, content: last.content + chunk };
            }
            return updated;
          });
        },
        controller.signal
      );
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setError(e.message);
        // Remove empty assistant message on error
        setMessages(prev => prev.filter((_, i) => i !== prev.length - 1 || prev[prev.length - 1].content));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [messages, streaming, persona.systemPrompt]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function abort() {
    abortRef.current?.abort();
    setStreaming(false);
  }

  const lastMsg = messages[messages.length - 1];
  const isStreaming = streaming && lastMsg?.role === 'assistant';

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ←
        </button>
        <div className="text-2xl">{persona.avatar}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-sm">{persona.name}</div>
          <div className="text-slate-500 text-xs truncate">{persona.tagline}</div>
        </div>
        <button
          onClick={() => setShowProfile(p => !p)}
          className="text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-colors"
        >
          {showProfile ? 'Hide' : 'Profile'}
        </button>
      </div>

      {/* Profile panel */}
      {showProfile && (
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-4 text-sm overflow-y-auto max-h-72">
          <div className="max-w-2xl mx-auto space-y-4">
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Core Beliefs</div>
              <ul className="space-y-1">
                {persona.coreBeliefs.map((b, i) => (
                  <li key={i} className="text-slate-300 flex gap-2">
                    <span className="text-indigo-400 shrink-0">·</span>{b}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Mental Models</div>
              <div className="space-y-2">
                {persona.mentalModels.map((m, i) => (
                  <div key={i}>
                    <span className="text-indigo-300 font-medium">{m.name}</span>
                    <span className="text-slate-400"> — {m.description}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Characteristic Phrases</div>
              <div className="flex flex-wrap gap-2">
                {persona.characteristicPhrases.map((p, i) => (
                  <span key={i} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md border border-slate-700">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="space-y-6">
              <div className="text-center text-slate-500 text-sm pt-8">
                You're now talking to a distillation of {persona.name}'s thinking style.
              </div>
              <div className="grid grid-cols-1 gap-2">
                {STARTERS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    className="text-left text-sm text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 px-4 py-3 rounded-lg transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            const isLast = i === messages.length - 1;
            const isStreamingThis = isLast && isStreaming;
            return (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="text-xl shrink-0 mt-1">{persona.avatar}</div>
                )}
                <div
                  className={`chat-message max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white ml-auto'
                      : 'bg-slate-800 text-slate-100'
                  } ${isStreamingThis && msg.content === '' ? 'streaming-cursor' : ''}`}
                >
                  {msg.content || (isStreamingThis ? '' : '…')}
                  {isStreamingThis && msg.content && (
                    <span className="inline-block w-2 h-4 bg-indigo-400 ml-0.5 animate-pulse align-middle" />
                  )}
                </div>
              </div>
            );
          })}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-slate-800 bg-slate-950/80 backdrop-blur px-4 py-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${persona.name.split(' ')[0]} anything…`}
            rows={1}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none text-sm leading-relaxed"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
          />
          {streaming ? (
            <button
              onClick={abort}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl transition-colors text-sm"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={() => send(input)}
              disabled={!input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl transition-colors text-sm font-medium"
            >
              Send
            </button>
          )}
        </div>
        <div className="max-w-2xl mx-auto mt-2 text-xs text-slate-600 text-center">
          Enter to send · Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}

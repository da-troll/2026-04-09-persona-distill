import type { Persona } from './types';

interface Props {
  persona: Persona;
  onChat: () => void;
  onDelete?: () => void;
}

export function PersonaCard({ persona, onChat, onDelete }: Props) {
  return (
    <div className="group relative bg-slate-900 border border-slate-700/50 rounded-xl p-5 flex flex-col gap-3 hover:border-indigo-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="text-3xl leading-none mt-0.5">{persona.avatar}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-base leading-tight">{persona.name}</h3>
          <p className="text-slate-400 text-sm mt-1 leading-snug">{persona.tagline}</p>
        </div>
        {persona.isCustom && (
          <span className="shrink-0 text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
            Custom
          </span>
        )}
      </div>

      {/* Beliefs preview */}
      <div className="flex flex-wrap gap-1.5">
        {persona.coreBeliefs.slice(0, 2).map((belief, i) => (
          <span
            key={i}
            className="text-xs text-slate-400 bg-slate-800 rounded-md px-2 py-1 border border-slate-700/50 line-clamp-1 max-w-full"
          >
            {belief.length > 60 ? belief.slice(0, 60) + '…' : belief}
          </span>
        ))}
      </div>

      {/* Style badge */}
      <div className="text-xs text-slate-500 italic">
        "{persona.communicationStyle.tone}"
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-1">
        <button
          onClick={onChat}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Chat →
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-slate-500 hover:text-red-400 text-sm px-3 py-2 rounded-lg border border-slate-700 hover:border-red-400/50 transition-colors"
            title="Delete persona"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

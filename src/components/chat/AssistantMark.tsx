import { BrainCircuit, Sparkles } from 'lucide-react'

type AssistantMarkProps = {
  compact?: boolean
}

export const AssistantMark = ({ compact = false }: AssistantMarkProps) => (
  <div
    className={`relative grid shrink-0 place-items-center overflow-hidden rounded-lg border border-emerald-300/30 bg-slate-950 text-emerald-300 shadow-lg shadow-emerald-950/20 ${compact ? 'h-10 w-10' : 'h-14 w-14'}`}
    aria-hidden="true"
  >
    <div className="absolute inset-x-1 top-1 h-px bg-emerald-300/50" />
    <BrainCircuit className={compact ? 'h-5 w-5' : 'h-7 w-7'} strokeWidth={1.8} />
    <Sparkles className="absolute right-1 top-1 h-3 w-3 text-amber-300" />
  </div>
)
'use client'

interface FilterChip {
  label: string
  key: string
}

interface ActiveFilterChipsProps {
  chips: FilterChip[]
  onRemove: (key: string) => void
}

export default function ActiveFilterChips({ chips, onRemove }: ActiveFilterChipsProps) {
  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 px-1">
      <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider flex items-center gap-1 mr-0.5">
        <i className="fa-solid fa-wand-magic-sparkles text-[9px]"></i>
        AI
      </span>
      {chips.map(chip => (
        <button
          key={chip.key}
          onClick={() => onRemove(chip.key)}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--c-accent-light)] border border-[var(--c-accent)]/20 rounded-[6px] text-[11px] font-semibold text-[var(--c-accent)] hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-150 group"
        >
          <span>{chip.label}</span>
          <i className="fa-solid fa-xmark text-[9px] opacity-50 group-hover:opacity-100"></i>
        </button>
      ))}
    </div>
  )
}

export default function ImagePlaceholder({
  label       = 'Terminal Screenshot',
  aspectRatio = '16/9',
  className   = '',
}) {
  const slug = label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div
      className={`img-placeholder ${className}`}
      style={{ aspectRatio }}
      data-placeholder={slug}
    >
      {/* Subtle center glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,255,255,0.015), transparent 70%)',
        }}
      />
      {/* Corner accents */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-white/[0.08] rounded-tl-sm" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-white/[0.08] rounded-tr-sm" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-white/[0.08] rounded-bl-sm" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-white/[0.08] rounded-br-sm" />
      {/* Label */}
      <div className="relative text-center pointer-events-none select-none">
        <div className="w-10 h-10 rounded-xl border border-white/[0.06] flex items-center justify-center mx-auto mb-3 bg-black">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#3F3F46]"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        </div>
        <p className="text-xs text-[#3F3F46] font-medium tracking-wide">{label}</p>
      </div>
    </div>
  )
}

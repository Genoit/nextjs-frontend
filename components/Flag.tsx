// Drawn flags for the video language pickers (emoji flags render as letters on Windows).
export type FlagCode = 'gb' | 'fr' | 'es' | 'de';

export function Flag({ code, className = 'h-[14px] w-5' }: { code: FlagCode; className?: string }) {
  return (
    <svg
      viewBox="0 0 60 40"
      aria-hidden
      className={`shrink-0 overflow-hidden rounded-[3px] ring-1 ring-white/15 ${className}`}
      preserveAspectRatio="none"
    >
      {code === 'fr' && (
        <>
          <rect width="20" height="40" fill="#0055a4" />
          <rect x="20" width="20" height="40" fill="#fff" />
          <rect x="40" width="20" height="40" fill="#ef4135" />
        </>
      )}
      {code === 'de' && (
        <>
          <rect width="60" height="13.34" fill="#000" />
          <rect y="13.33" width="60" height="13.34" fill="#dd0000" />
          <rect y="26.66" width="60" height="13.34" fill="#ffce00" />
        </>
      )}
      {code === 'es' && (
        <>
          <rect width="60" height="40" fill="#aa151b" />
          <rect y="10" width="60" height="20" fill="#f1bf00" />
        </>
      )}
      {code === 'gb' && (
        <>
          <rect width="60" height="40" fill="#012169" />
          <path d="M0 0l60 40M60 0L0 40" stroke="#fff" strokeWidth="8" />
          <path d="M0 0l60 40M60 0L0 40" stroke="#c8102e" strokeWidth="3" />
          <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="12" />
          <path d="M30 0v40M0 20h60" stroke="#c8102e" strokeWidth="7" />
        </>
      )}
    </svg>
  );
}

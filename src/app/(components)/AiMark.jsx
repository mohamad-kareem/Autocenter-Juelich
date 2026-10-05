/**
 * Assistant bot mark: rounded head, antenna light and a visor with two
 * glowing eyes that blink now and then. Uses currentColor for the outline,
 * `accent` for the lights – so it works on dark and light backgrounds.
 */
export default function AiMark({ className = "h-5 w-5", twinkle = true, accent = "currentColor" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      {/* antenna */}
      <path d="M12 3.6v2.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="2.6" r="1.35" fill={accent} className={twinkle ? "ai-twinkle" : undefined} style={{ transformOrigin: "12px 2.6px" }} />
      {/* ears */}
      <rect x="1.6" y="10.2" width="2.2" height="4.6" rx="1.1" fill="currentColor" />
      <rect x="20.2" y="10.2" width="2.2" height="4.6" rx="1.1" fill="currentColor" />
      {/* head */}
      <rect x="4.4" y="5.8" width="15.2" height="13.4" rx="4.6" stroke="currentColor" strokeWidth="1.6" />
      {/* visor */}
      <rect x="6.9" y="9.1" width="10.2" height="5.6" rx="2.8" fill="currentColor" fillOpacity="0.22" />
      {/* eyes */}
      <g className={twinkle ? "ai-blink" : undefined} style={{ transformOrigin: "12px 11.9px" }}>
        <circle cx="9.9" cy="11.9" r="1.25" fill={accent} />
        <circle cx="14.1" cy="11.9" r="1.25" fill={accent} />
      </g>
      {/* mouth */}
      <path d="M10.6 16.6h2.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

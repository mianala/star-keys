// SVG Icons for music notation symbols
// These render reliably across all systems without needing special fonts

export const WholeNoteIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <ellipse
      cx="12"
      cy="12"
      rx="8"
      ry="6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

export const HalfNoteIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <ellipse cx="10" cy="14" rx="6" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
    <line x1="16" y1="14" x2="16" y2="4" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const QuarterNoteIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <ellipse cx="10" cy="16" rx="5" ry="4" fill="currentColor" />
    <line x1="15" y1="16" x2="15" y2="4" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const EighthNoteIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <ellipse cx="9" cy="17" rx="5" ry="4" fill="currentColor" />
    <line x1="14" y1="17" x2="14" y2="5" stroke="currentColor" strokeWidth="2" />
    <path d="M14 5 Q18 7, 20 10" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

export const SixteenthNoteIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <ellipse cx="9" cy="18" rx="5" ry="4" fill="currentColor" />
    <line x1="14" y1="18" x2="14" y2="4" stroke="currentColor" strokeWidth="2" />
    <line x1="14" y1="8" x2="19" y2="10" stroke="currentColor" strokeWidth="2" />
    <line x1="14" y1="12" x2="19" y2="14" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const ThirtySecondNoteIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <ellipse cx="9" cy="19" rx="5" ry="4" fill="currentColor" />
    <line x1="14" y1="19" x2="14" y2="3" stroke="currentColor" strokeWidth="2" />
    <line x1="14" y1="7" x2="19" y2="9" stroke="currentColor" strokeWidth="2" />
    <line x1="14" y1="11" x2="19" y2="13" stroke="currentColor" strokeWidth="2" />
    <line x1="14" y1="15" x2="19" y2="17" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const RestIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <rect x="10" y="6" width="4" height="12" rx="1" fill="currentColor" />
  </svg>
);

export const SharpIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <line x1="8" y1="4" x2="8" y2="20" stroke="currentColor" strokeWidth="2" />
    <line x1="16" y1="4" x2="16" y2="20" stroke="currentColor" strokeWidth="2" />
    <line x1="5" y1="10" x2="19" y2="8" stroke="currentColor" strokeWidth="2" />
    <line x1="5" y1="16" x2="19" y2="14" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const FlatIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M10 4 L10 16 Q10 19, 14 19 Q17 19, 17 16 Q17 13, 14 13 L12 13 L12 4" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

export const NaturalIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <line x1="10" y1="4" x2="10" y2="20" stroke="currentColor" strokeWidth="2" />
    <line x1="14" y1="4" x2="14" y2="20" stroke="currentColor" strokeWidth="2" />
    <line x1="10" y1="12" x2="14" y2="10" stroke="currentColor" strokeWidth="2" />
    <line x1="10" y1="18" x2="14" y2="16" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const TieIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M4 16 Q12 8, 20 16" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

export const StaccatoIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

export const AccentIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <polygon points="12,4 20,18 4,18" fill="currentColor" />
  </svg>
);

export const MarcatoIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <polygon points="12,4 20,20 12,16 4,20" fill="currentColor" />
  </svg>
);

export const TenutoIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="3" />
  </svg>
);

export const FermataIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <circle cx="12" cy="14" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M8 14 Q12 6, 16 14" stroke="currentColor" strokeWidth="2" fill="none" />
    <line x1="12" y1="6" x2="12" y2="4" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const TrillIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="16" fill="currentColor">
    <text x="4" y="16" fontSize="14" fontFamily="serif" fill="currentColor">tr</text>
  </svg>
);

export const MordentIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M4 12 L8 8 L12 12 L16 8 L20 12" stroke="currentColor" strokeWidth="2" fill="none" />
    <line x1="10" y1="8" x2="10" y2="16" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const TurnIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M4 12 Q8 8, 12 12 Q16 16, 20 12" stroke="currentColor" strokeWidth="2" fill="none" />
    <line x1="4" y1="12" x2="4" y2="8" stroke="currentColor" strokeWidth="2" />
    <line x1="20" y1="12" x2="20" y2="16" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const TremoloIcon = ({ beams = 1 }: { beams?: number }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    {[...Array(beams)].map((_, i) => (
      <line key={i} x1="4" y1={8 + i * 4} x2="20" y2={6 + i * 4} stroke="currentColor" strokeWidth="2" />
    ))}
  </svg>
);

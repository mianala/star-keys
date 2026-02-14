// Music notation icons using Bravura font (SMuFL standard)
// Bravura is the reference font for SMuFL (Standard Music Font Layout)

import type { CSSProperties } from 'react';

interface IconProps {
  className?: string;
  style?: CSSProperties;
}

const Icon = ({ char, className = '', style }: { char: string } & IconProps) => (
  <span 
    className={`music-icon ${className}`} 
    style={{ 
      fontFamily: 'BravuraText, Bravura, sans-serif',
      fontSize: '1.5em',
      lineHeight: 1,
      ...style,
    }}
    aria-hidden="true"
  >
    {char}
  </span>
);

// Helper to create Unicode characters from code points
const u = (codePoint: number) => String.fromCodePoint(codePoint);

// SMuFL Unicode characters for music notation
// Reference: https://www.smufl.org/version/latest/

// Note durations (U+E0A0-U+E0AF range)
export const WholeNoteIcon = () => <Icon char={u(0xE0A2)} />;  // Whole note
export const HalfNoteIcon = () => <Icon char={u(0xE0A3)} />;   // Half note (stem up)
export const QuarterNoteIcon = () => <Icon char={u(0xE0A4)} />; // Quarter note (stem up)
export const EighthNoteIcon = () => <Icon char={u(0xE0A5)} />;  // Eighth note (stem up)
export const SixteenthNoteIcon = () => <Icon char={u(0xE0A6)} />; // 16th note (stem up)
export const ThirtySecondNoteIcon = () => <Icon char={u(0xE0A7)} />; // 32nd note (stem up)

// Rests (U+E4E0-U+E4F7 range)
export const RestIcon = () => <Icon char={u(0xE4E3)} />; // Quarter rest

// Accidentals (U+E260-U+E26F range)
export const SharpIcon = () => <Icon char={u(0xE262)} />;  // Sharp
export const FlatIcon = () => <Icon char={u(0xE260)} />;   // Flat
export const NaturalIcon = () => <Icon char={u(0xE261)} />; // Natural

// Ties and slurs (U+E1A0-U+E1BF range)
export const TieIcon = () => (
  <Icon char={u(0xE1AD)} style={{ transform: 'scaleY(0.5)' }} />
);

// Articulations (U+E4A0-U+E4DF range)
export const StaccatoIcon = () => <Icon char={u(0xE4A2)} />;   // Staccato dot
export const AccentIcon = () => <Icon char={u(0xE4A0)} />;     // Accent
export const MarcatoIcon = () => <Icon char={u(0xE4AC)} />;    // Marcato
export const TenutoIcon = () => <Icon char={u(0xE4C0)} />;     // Tenuto
export const FermataIcon = () => <Icon char={u(0xE4C4)} />;    // Fermata

// Ornaments (U+E560-U+E5BF range)
export const TrillIcon = () => <Icon char={u(0xE566)} />;      // Trill
export const MordentIcon = () => <Icon char={u(0xE56C)} />;    // Mordent
export const TurnIcon = () => <Icon char={u(0xE567)} />;       // Turn

// Tremolo (U+E220-U+E23F range)
export const TremoloIcon = ({ beams = 1 }: { beams?: number }) => {
  const tremoloChars: Record<number, number> = {
    1: 0xE220, // tremolo1
    2: 0xE221, // tremolo2
    3: 0xE222, // tremolo3
  };
  return <Icon char={u(tremoloChars[beams] || tremoloChars[1])} />;
};

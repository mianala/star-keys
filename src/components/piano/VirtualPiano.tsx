import { useState, useCallback } from 'react';
import type { Step } from '@/types/index.ts';

interface VirtualPianoProps {
  startOctave?: number;
  octaves?: number;
  onNoteDown?: (step: Step, octave: number) => void;
  onNoteUp?: (step: Step, octave: number) => void;
  activeNotes?: Set<string>; // "C4", "D#5", etc.
}

const WHITE_KEYS: { step: Step; offset: number }[] = [
  { step: 'C', offset: 0 },
  { step: 'D', offset: 1 },
  { step: 'E', offset: 2 },
  { step: 'F', offset: 3 },
  { step: 'G', offset: 4 },
  { step: 'A', offset: 5 },
  { step: 'B', offset: 6 },
];

const BLACK_KEYS: { step: Step; alter: number; leftOffset: number }[] = [
  { step: 'C', alter: 1, leftOffset: 16 },
  { step: 'D', alter: 1, leftOffset: 40 },
  { step: 'F', alter: 1, leftOffset: 88 },
  { step: 'G', alter: 1, leftOffset: 112 },
  { step: 'A', alter: 1, leftOffset: 136 },
];

const OCTAVE_WIDTH = 7 * 24; // 7 white keys * 24px each

export function VirtualPiano({
  startOctave = 3,
  octaves = 2,
  onNoteDown,
  onNoteUp,
  activeNotes,
}: VirtualPianoProps) {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const handleMouseDown = useCallback((step: Step, octave: number) => {
    const key = `${step}${octave}`;
    setPressedKey(key);
    onNoteDown?.(step, octave);
  }, [onNoteDown]);

  const handleMouseUp = useCallback((step: Step, octave: number) => {
    setPressedKey(null);
    onNoteUp?.(step, octave);
  }, [onNoteUp]);

  const octaveElements = [];
  for (let o = startOctave; o < startOctave + octaves; o++) {
    octaveElements.push(
      <div key={o} style={{ position: 'relative', display: 'inline-block' }}>
        <div className="piano-octave-label">C{o}</div>
        <div className="piano-keys">
          {WHITE_KEYS.map((wk) => {
            const key = `${wk.step}${o}`;
            const isActive = pressedKey === key || activeNotes?.has(key);
            return (
              <div
                key={key}
                className={`piano-white-key${isActive ? ' active' : ''}`}
                onMouseDown={() => handleMouseDown(wk.step, o)}
                onMouseUp={() => handleMouseUp(wk.step, o)}
                onMouseLeave={() => { if (pressedKey === key) { setPressedKey(null); onNoteUp?.(wk.step, o); } }}
              >
                <span className="piano-note-label">{wk.step}</span>
              </div>
            );
          })}
          {BLACK_KEYS.map((bk) => {
            const key = `${bk.step}#${o}`;
            const isActive = pressedKey === key || activeNotes?.has(key);
            return (
              <div
                key={key}
                className={`piano-black-key${isActive ? ' active' : ''}`}
                style={{ left: bk.leftOffset }}
                onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(bk.step, o); }}
                onMouseUp={(e) => { e.stopPropagation(); handleMouseUp(bk.step, o); }}
                onMouseLeave={() => { if (pressedKey === key) { setPressedKey(null); } }}
              />
            );
          })}
        </div>
      </div>,
    );
  }

  return (
    <div className="virtual-piano" style={{ width: octaves * OCTAVE_WIDTH + 16 }}>
      {octaveElements}
    </div>
  );
}

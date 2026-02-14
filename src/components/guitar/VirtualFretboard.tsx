import { useState, useCallback } from 'react';
import type { Step } from '@/types/index.ts';

interface VirtualFretboardProps {
  tuning?: string[]; // e.g. ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']
  numFrets?: number;
  capo?: number;
  onFretClick?: (stringIndex: number, fret: number, step: Step, octave: number) => void;
}

const NOTES: Step[] = ['C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B'];

function parseTuningNote(note: string): { step: Step; octave: number } {
  const match = note.match(/^([A-G])#?(\d)$/);
  if (!match) return { step: 'E', octave: 2 };
  return { step: match[1] as Step, octave: parseInt(match[2]) };
}

function noteToMidi(step: Step, octave: number, alter = 0): number {
  const STEP_TO_MIDI: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  return (octave + 1) * 12 + (STEP_TO_MIDI[step] ?? 0) + alter;
}

function midiToNote(midi: number): { step: Step; octave: number } {
  const octave = Math.floor(midi / 12) - 1;
  const pc = midi % 12;
  return { step: NOTES[pc], octave };
}

const FRET_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
const DOUBLE_MARKERS = [12, 24];

const DEFAULT_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

export function VirtualFretboard({
  tuning = DEFAULT_TUNING,
  numFrets = 15,
  capo = 0,
  onFretClick,
}: VirtualFretboardProps) {
  const [activeCell, setActiveCell] = useState<string | null>(null);

  const handleClick = useCallback((stringIdx: number, fret: number) => {
    const tuningNote = parseTuningNote(tuning[stringIdx]);
    const openMidi = noteToMidi(tuningNote.step, tuningNote.octave);
    const actualFret = fret + capo;
    const { step, octave } = midiToNote(openMidi + actualFret);
    const key = `${stringIdx}-${fret}`;
    setActiveCell(key);
    setTimeout(() => setActiveCell(null), 200);
    onFretClick?.(stringIdx, actualFret, step, octave);
  }, [tuning, capo, onFretClick]);

  // Render strings top-to-bottom (highest pitch = top, matching tablature convention)
  const strings = [...tuning].reverse();

  return (
    <div className="fretboard-container" role="group" aria-label="Virtual fretboard">
      <div className="fretboard">
        {/* Fret markers */}
        <div className="fretboard-markers">
          <div className="fretboard-marker-cell" /> {/* nut */}
          {Array.from({ length: numFrets }, (_, fret) => (
            <div key={fret} className="fretboard-marker-cell">
              {FRET_MARKERS.includes(fret + 1) && (
                <span className={`fretboard-dot${DOUBLE_MARKERS.includes(fret + 1) ? ' double' : ''}`} />
              )}
              {DOUBLE_MARKERS.includes(fret + 1) && (
                <span className="fretboard-dot double second" />
              )}
            </div>
          ))}
        </div>

        {/* Strings */}
        {strings.map((tuningStr, rowIdx) => {
          const stringIdx = tuning.length - 1 - rowIdx; // map back to original index
          return (
            <div key={stringIdx} className="fretboard-string">
              <div className="fretboard-tuning-label">{tuningStr}</div>
              {/* Open string (fret 0) */}
              <button
                className={`fretboard-cell nut${activeCell === `${stringIdx}-0` ? ' active' : ''}${capo > 0 ? ' capo' : ''}`}
                onClick={() => handleClick(stringIdx, 0)}
                aria-label={`String ${stringIdx + 1} open`}
              >
                {capo > 0 ? capo : 'O'}
              </button>
              {/* Frets */}
              {Array.from({ length: numFrets }, (_, fret) => {
                const key = `${stringIdx}-${fret + 1}`;
                return (
                  <button
                    key={fret}
                    className={`fretboard-cell${activeCell === key ? ' active' : ''}`}
                    onClick={() => handleClick(stringIdx, fret + 1)}
                    aria-label={`String ${stringIdx + 1} fret ${fret + 1}`}
                  >
                    {activeCell === key ? fret + 1 + capo : ''}
                  </button>
                );
              })}
            </div>
          );
        })}

        {/* Fret numbers */}
        <div className="fretboard-fret-numbers">
          <div className="fretboard-fret-num" /> {/* nut */}
          {Array.from({ length: numFrets }, (_, fret) => (
            <div key={fret} className="fretboard-fret-num">
              {FRET_MARKERS.includes(fret + 1) ? fret + 1 : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

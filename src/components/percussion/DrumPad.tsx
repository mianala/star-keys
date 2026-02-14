import { useState, useCallback } from 'react';
import type { Step } from '@/types/index.ts';

interface DrumPadProps {
  onPadHit?: (step: Step) => void;
}

interface PadConfig {
  label: string;
  shortLabel: string;
  step: Step;
  midiNote: number;
  color: string;
}

const DRUM_PADS: PadConfig[] = [
  { label: 'Kick', shortLabel: 'BD', step: 'C', midiNote: 36, color: '#e74c3c' },
  { label: 'Snare', shortLabel: 'SD', step: 'D', midiNote: 38, color: '#3498db' },
  { label: 'Closed HH', shortLabel: 'HH', step: 'F', midiNote: 42, color: '#f39c12' },
  { label: 'Open HH', shortLabel: 'OH', step: 'A', midiNote: 46, color: '#f1c40f' },
  { label: 'Hi Tom', shortLabel: 'HT', step: 'D', midiNote: 50, color: '#9b59b6' },
  { label: 'Mid Tom', shortLabel: 'MT', step: 'B', midiNote: 47, color: '#8e44ad' },
  { label: 'Lo Tom', shortLabel: 'LT', step: 'A', midiNote: 45, color: '#6c3483' },
  { label: 'Crash', shortLabel: 'CR', step: 'C', midiNote: 49, color: '#2ecc71' },
  { label: 'Ride', shortLabel: 'RD', step: 'D', midiNote: 51, color: '#1abc9c' },
  { label: 'Rim', shortLabel: 'RM', step: 'C', midiNote: 37, color: '#e67e22' },
  { label: 'Cowbell', shortLabel: 'CB', step: 'G', midiNote: 56, color: '#d35400' },
  { label: 'Clap', shortLabel: 'CP', step: 'E', midiNote: 39, color: '#c0392b' },
];

export function DrumPad({ onPadHit }: DrumPadProps) {
  const [activePad, setActivePad] = useState<number | null>(null);

  const handlePadDown = useCallback((pad: PadConfig, index: number) => {
    setActivePad(index);
    onPadHit?.(pad.step);
    setTimeout(() => setActivePad(null), 150);
  }, [onPadHit]);

  return (
    <div className="drum-pad-container" role="group" aria-label="Drum pad input">
      <div className="drum-pad-grid">
        {DRUM_PADS.map((pad, i) => (
          <button
            key={pad.midiNote}
            className={`drum-pad${activePad === i ? ' active' : ''}`}
            style={{ '--pad-color': pad.color } as React.CSSProperties}
            onMouseDown={() => handlePadDown(pad, i)}
            aria-label={pad.label}
            title={pad.label}
          >
            <span className="drum-pad-label">{pad.shortLabel}</span>
            <span className="drum-pad-name">{pad.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

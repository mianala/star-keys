import { useState } from 'react';
import type { NavigationMark } from '@/types/index.ts';

const NAVIGATION_MARKS: { label: string; value: NavigationMark; title: string }[] = [
  { label: '𝄋', value: 'segno', title: 'Segno' },
  { label: '𝄌', value: 'coda', title: 'Coda' },
  { label: 'D.C.', value: 'dacapo', title: 'Da Capo' },
  { label: 'D.S.', value: 'dalsegno', title: 'Dal Segno' },
  { label: 'Fine', value: 'fine', title: 'Fine' },
  { label: '→𝄌', value: 'tocoda', title: 'To Coda' },
  { label: 'D.C.🔁', value: 'dacapo-al-coda', title: 'D.C. al Coda' },
  { label: 'D.C.⏹', value: 'dacapo-al-fine', title: 'D.C. al Fine' },
  { label: 'D.S.🔁', value: 'dalsegno-al-coda', title: 'D.S. al Coda' },
  { label: 'D.S.⏹', value: 'dalsegno-al-fine', title: 'D.S. al Fine' },
];

const EXPRESSION_PRESETS = [
  'dolce', 'legato', 'cantabile', 'espressivo', 'con brio',
  'con fuoco', 'grazioso', 'maestoso', 'scherzando', 'tranquillo',
];

interface NotationPanelProps {
  onToggleSlur: () => void;
  onAddTempo: (bpm: number, text?: string) => void;
  onAddRehearsal: () => void;
  onAddNavigation: (mark: NavigationMark) => void;
  onAddLyric: (text: string, syllabic?: 'single' | 'begin' | 'middle' | 'end') => void;
  onAddChordSymbol: (text: string) => void;
  onAddExpression: (text: string) => void;
  onToggleTuplet: (actual: number, normal: number) => void;
}

export function NotationPanel({
  onToggleSlur,
  onAddTempo,
  onAddRehearsal,
  onAddNavigation,
  onAddLyric,
  onAddChordSymbol,
  onAddExpression,
  onToggleTuplet,
}: NotationPanelProps) {
  const [tempoInput, setTempoInput] = useState('120');
  const [tempoText, setTempoText] = useState('');
  const [lyricInput, setLyricInput] = useState('');
  const [chordInput, setChordInput] = useState('');
  const [expressionInput, setExpressionInput] = useState('');

  return (
    <div className="notation-panel">
      {/* Slurs & Ties */}
      <div className="notation-section">
        <span className="notation-section-title">Slur</span>
        <button className="articulation-btn" onClick={onToggleSlur} title="Toggle slur (L)">
          ⁔
        </button>
      </div>

      {/* Tempo Markings */}
      <div className="notation-section">
        <span className="notation-section-title">Tempo</span>
        <div className="notation-inline-form">
          <input
            type="number"
            className="notation-input notation-input-sm"
            value={tempoInput}
            onChange={(e) => setTempoInput(e.target.value)}
            min={20}
            max={300}
            title="BPM"
          />
          <input
            type="text"
            className="notation-input"
            value={tempoText}
            onChange={(e) => setTempoText(e.target.value)}
            placeholder="Allegro..."
            title="Tempo text"
          />
          <button
            className="articulation-btn"
            onClick={() => {
              onAddTempo(Number(tempoInput) || 120, tempoText || undefined);
              setTempoText('');
            }}
            title="Add tempo marking"
          >
            +
          </button>
        </div>
      </div>

      {/* Rehearsal Marks */}
      <div className="notation-section">
        <span className="notation-section-title">Rehearsal</span>
        <button className="articulation-btn" onClick={onAddRehearsal} title="Add rehearsal mark">
          A
        </button>
      </div>

      {/* Navigation Marks */}
      <div className="notation-section">
        <span className="notation-section-title">Navigation</span>
        <div className="notation-btn-grid">
          {NAVIGATION_MARKS.map((m) => (
            <button
              key={m.value}
              className="articulation-btn"
              onClick={() => onAddNavigation(m.value)}
              title={m.title}
              style={{ fontSize: 9 }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lyrics */}
      <div className="notation-section">
        <span className="notation-section-title">Lyrics (Ctrl+L)</span>
        <div className="notation-inline-form">
          <input
            type="text"
            className="notation-input"
            value={lyricInput}
            onChange={(e) => setLyricInput(e.target.value)}
            placeholder="Syllable..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && lyricInput.trim()) {
                onAddLyric(lyricInput.trim(), 'single');
                setLyricInput('');
              } else if (e.key === '-' && lyricInput.trim()) {
                e.preventDefault();
                onAddLyric(lyricInput.trim(), 'begin');
                setLyricInput('');
              } else if (e.key === ' ' && lyricInput.trim()) {
                e.preventDefault();
                onAddLyric(lyricInput.trim(), 'single');
                setLyricInput('');
              }
            }}
          />
        </div>
      </div>

      {/* Chord Symbols */}
      <div className="notation-section">
        <span className="notation-section-title">Chords (Ctrl+K)</span>
        <div className="notation-inline-form">
          <input
            type="text"
            className="notation-input"
            value={chordInput}
            onChange={(e) => setChordInput(e.target.value)}
            placeholder="Cmaj7..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && chordInput.trim()) {
                onAddChordSymbol(chordInput.trim());
                setChordInput('');
              }
            }}
          />
          <button
            className="articulation-btn"
            onClick={() => {
              if (chordInput.trim()) {
                onAddChordSymbol(chordInput.trim());
                setChordInput('');
              }
            }}
            title="Add chord symbol"
          >
            +
          </button>
        </div>
      </div>

      {/* Expression Text */}
      <div className="notation-section">
        <span className="notation-section-title">Expression</span>
        <div className="notation-inline-form">
          <input
            type="text"
            className="notation-input"
            value={expressionInput}
            onChange={(e) => setExpressionInput(e.target.value)}
            placeholder="dolce..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && expressionInput.trim()) {
                onAddExpression(expressionInput.trim());
                setExpressionInput('');
              }
            }}
          />
          <button
            className="articulation-btn"
            onClick={() => {
              if (expressionInput.trim()) {
                onAddExpression(expressionInput.trim());
                setExpressionInput('');
              }
            }}
            title="Add expression text"
          >
            +
          </button>
        </div>
        <div className="notation-btn-grid">
          {EXPRESSION_PRESETS.map((preset) => (
            <button
              key={preset}
              className="articulation-btn"
              onClick={() => onAddExpression(preset)}
              title={preset}
              style={{ fontSize: 9, fontStyle: 'italic' }}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Tuplets */}
      <div className="notation-section">
        <span className="notation-section-title">Tuplets</span>
        <div className="notation-btn-grid">
          <button className="articulation-btn" onClick={() => onToggleTuplet(3, 2)} title="Triplet (3:2)">
            3:2
          </button>
          <button className="articulation-btn" onClick={() => onToggleTuplet(5, 4)} title="Quintuplet (5:4)">
            5:4
          </button>
          <button className="articulation-btn" onClick={() => onToggleTuplet(6, 4)} title="Sextuplet (6:4)">
            6:4
          </button>
          <button className="articulation-btn" onClick={() => onToggleTuplet(7, 4)} title="Septuplet (7:4)">
            7:4
          </button>
        </div>
      </div>
    </div>
  );
}

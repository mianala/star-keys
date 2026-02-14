import { useState } from 'react';
import type { InstrumentConfig } from '@/types/index.ts';
import { PRESET_INSTRUMENTS, createScore } from '@/core/score/index.ts';
import type { Score } from '@/types/index.ts';

interface NewScoreDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateScore: (score: Score) => void;
}

export function NewScoreDialog({ isOpen, onClose, onCreateScore }: NewScoreDialogProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('Untitled Score');
  const [composer, setComposer] = useState('');
  const [tempo, setTempo] = useState(120);
  const [timeBeats, setTimeBeats] = useState(4);
  const [timeBeatType, setTimeBeatType] = useState(4);
  const [selectedInstruments, setSelectedInstruments] = useState<InstrumentConfig[]>([PRESET_INSTRUMENTS[0]]);
  const [keyFifths, setKeyFifths] = useState(0);
  const [measureCount, setMeasureCount] = useState(32);

  if (!isOpen) return null;

  const handleCreate = () => {
    const score = createScore(title, composer, selectedInstruments, measureCount);
    // Set time signature and key on first measure of each part
    for (const part of score.parts) {
      const firstMeasure = part.measures[0];
      if (firstMeasure?.attributes) {
        firstMeasure.attributes.time = { beats: timeBeats, beatType: timeBeatType };
        if (!part.instrument.isPercussion) {
          firstMeasure.attributes.key = { fifths: keyFifths, mode: 'major' };
        }
      }
    }
    // Set tempo
    if (score.parts[0]?.measures[0]) {
      score.parts[0].measures[0].directions.push({ kind: 'tempo', bpm: tempo });
    }
    onCreateScore(score);
    // Reset
    setStep(1);
    setTitle('Untitled Score');
    setComposer('');
    setTempo(120);
    setSelectedInstruments([PRESET_INSTRUMENTS[0]]);
    setKeyFifths(0);
    setMeasureCount(32);
    onClose();
  };

  const addInstrument = (inst: InstrumentConfig) => {
    setSelectedInstruments([...selectedInstruments, inst]);
  };

  const removeInstrument = (index: number) => {
    if (selectedInstruments.length <= 1) return;
    setSelectedInstruments(selectedInstruments.filter((_, i) => i !== index));
  };

  const KEY_NAMES: Record<number, string> = {
    '-7': 'Cb Major', '-6': 'Gb Major', '-5': 'Db Major', '-4': 'Ab Major',
    '-3': 'Eb Major', '-2': 'Bb Major', '-1': 'F Major', '0': 'C Major',
    '1': 'G Major', '2': 'D Major', '3': 'A Major', '4': 'E Major',
    '5': 'B Major', '6': 'F# Major', '7': 'C# Major',
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">New Score</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <div className="dialog-body">
          {step === 1 && (
            <div className="dialog-step">
              <h3 className="dialog-step-title">Score Information</h3>
              <div className="dialog-field">
                <label className="dialog-label">Title</label>
                <input
                  className="dialog-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="dialog-field">
                <label className="dialog-label">Composer</label>
                <input
                  className="dialog-input"
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                />
              </div>
              <div className="dialog-row">
                <div className="dialog-field">
                  <label className="dialog-label">Tempo (BPM)</label>
                  <input
                    className="dialog-input"
                    type="number"
                    value={tempo}
                    min={20}
                    max={300}
                    onChange={(e) => setTempo(Number(e.target.value))}
                  />
                </div>
                <div className="dialog-field">
                  <label className="dialog-label">Time Signature</label>
                  <div className="dialog-row-inline">
                    <input
                      className="dialog-input dialog-input-small"
                      type="number"
                      value={timeBeats}
                      min={1}
                      max={16}
                      onChange={(e) => setTimeBeats(Number(e.target.value))}
                    />
                    <span>/</span>
                    <select
                      className="dialog-select"
                      value={timeBeatType}
                      onChange={(e) => setTimeBeatType(Number(e.target.value))}
                    >
                      <option value={2}>2</option>
                      <option value={4}>4</option>
                      <option value={8}>8</option>
                      <option value={16}>16</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="dialog-step">
              <h3 className="dialog-step-title">Instruments</h3>
              <div className="dialog-instruments">
                <div className="dialog-instruments-selected">
                  <label className="dialog-label">Selected Instruments</label>
                  {selectedInstruments.map((inst, i) => (
                    <div key={i} className="dialog-instrument-item">
                      <span>{inst.isPercussion ? '🥁' : '🎸'} {inst.name}</span>
                      <button
                        className="dialog-remove-btn"
                        onClick={() => removeInstrument(i)}
                        disabled={selectedInstruments.length <= 1}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="dialog-instruments-available">
                  <label className="dialog-label">Add Instrument</label>
                  {PRESET_INSTRUMENTS.map((inst) => (
                    <button
                      key={inst.id}
                      className="dialog-add-btn"
                      onClick={() => addInstrument(inst)}
                    >
                      {inst.isPercussion ? '🥁' : '🎸'} {inst.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="dialog-step">
              <h3 className="dialog-step-title">Key & Measures</h3>
              <div className="dialog-field">
                <label className="dialog-label">Key Signature</label>
                <select
                  className="dialog-select"
                  value={keyFifths}
                  onChange={(e) => setKeyFifths(Number(e.target.value))}
                >
                  {Object.entries(KEY_NAMES).map(([val, name]) => (
                    <option key={val} value={val}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="dialog-field">
                <label className="dialog-label">Number of Measures</label>
                <input
                  className="dialog-input"
                  type="number"
                  value={measureCount}
                  min={1}
                  max={999}
                  onChange={(e) => setMeasureCount(Number(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>

        <div className="dialog-footer">
          <div className="dialog-steps-indicator">
            {[1, 2, 3].map((s) => (
              <span key={s} className={`dialog-step-dot ${step === s ? 'active' : ''}`} />
            ))}
          </div>
          <div className="dialog-actions">
            {step > 1 && (
              <button className="dialog-btn" onClick={() => setStep(step - 1)}>Back</button>
            )}
            {step < 3 ? (
              <button className="dialog-btn dialog-btn-primary" onClick={() => setStep(step + 1)}>Next</button>
            ) : (
              <button className="dialog-btn dialog-btn-primary" onClick={handleCreate}>Create</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';

type TransposeScope = 'selection' | 'part' | 'all';
type TransposeMethod = 'interval' | 'key' | 'chromatic';

interface TransposeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTranspose: (semitones: number, scope: TransposeScope) => void;
}

const INTERVALS = [
  { label: 'Minor 2nd up', semitones: 1 },
  { label: 'Major 2nd up', semitones: 2 },
  { label: 'Minor 3rd up', semitones: 3 },
  { label: 'Major 3rd up', semitones: 4 },
  { label: 'Perfect 4th up', semitones: 5 },
  { label: 'Tritone', semitones: 6 },
  { label: 'Perfect 5th up', semitones: 7 },
  { label: 'Minor 6th up', semitones: 8 },
  { label: 'Major 6th up', semitones: 9 },
  { label: 'Minor 7th up', semitones: 10 },
  { label: 'Major 7th up', semitones: 11 },
  { label: 'Octave up', semitones: 12 },
  { label: 'Minor 2nd down', semitones: -1 },
  { label: 'Major 2nd down', semitones: -2 },
  { label: 'Minor 3rd down', semitones: -3 },
  { label: 'Major 3rd down', semitones: -4 },
  { label: 'Perfect 4th down', semitones: -5 },
  { label: 'Perfect 5th down', semitones: -7 },
  { label: 'Octave down', semitones: -12 },
];

export function TransposeDialog({ isOpen, onClose, onTranspose }: TransposeDialogProps) {
  const [method, setMethod] = useState<TransposeMethod>('chromatic');
  const [scope, setScope] = useState<TransposeScope>('all');
  const [semitones, setSemitones] = useState(0);
  const [selectedInterval, setSelectedInterval] = useState(0);

  if (!isOpen) return null;

  const handleTranspose = () => {
    const amount = method === 'interval' ? INTERVALS[selectedInterval]?.semitones ?? 0 : semitones;
    onTranspose(amount, scope);
    onClose();
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">Transpose</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <div className="dialog-body">
          <div className="dialog-field">
            <label className="dialog-label">Method</label>
            <div className="transpose-radio-group">
              <label>
                <input type="radio" checked={method === 'chromatic'} onChange={() => setMethod('chromatic')} />
                Chromatic (semitones)
              </label>
              <label>
                <input type="radio" checked={method === 'interval'} onChange={() => setMethod('interval')} />
                By interval
              </label>
            </div>
          </div>

          {method === 'chromatic' && (
            <div className="dialog-field">
              <label className="dialog-label">Semitones ({semitones > 0 ? '+' : ''}{semitones})</label>
              <input
                type="range"
                className="mixer-slider"
                style={{ width: '100%' }}
                min={-24}
                max={24}
                value={semitones}
                onChange={(e) => setSemitones(Number(e.target.value))}
              />
            </div>
          )}

          {method === 'interval' && (
            <div className="dialog-field">
              <label className="dialog-label">Interval</label>
              <select
                className="dialog-select"
                style={{ width: '100%' }}
                value={selectedInterval}
                onChange={(e) => setSelectedInterval(Number(e.target.value))}
              >
                {INTERVALS.map((int, i) => (
                  <option key={i} value={i}>{int.label} ({int.semitones > 0 ? '+' : ''}{int.semitones})</option>
                ))}
              </select>
            </div>
          )}

          <div className="dialog-field">
            <label className="dialog-label">Apply to</label>
            <div className="transpose-radio-group">
              <label>
                <input type="radio" checked={scope === 'selection'} onChange={() => setScope('selection')} />
                Selection only
              </label>
              <label>
                <input type="radio" checked={scope === 'part'} onChange={() => setScope('part')} />
                Current part
              </label>
              <label>
                <input type="radio" checked={scope === 'all'} onChange={() => setScope('all')} />
                Entire score
              </label>
            </div>
          </div>
        </div>

        <div className="dialog-footer">
          <div />
          <div className="dialog-actions">
            <button className="dialog-btn" onClick={onClose}>Cancel</button>
            <button className="dialog-btn dialog-btn-primary" onClick={handleTranspose}>Transpose</button>
          </div>
        </div>
      </div>
    </div>
  );
}

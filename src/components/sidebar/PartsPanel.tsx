import { useState } from 'react';
import type { InstrumentConfig } from '@/types/index.ts';
import { useEditor } from '@/stores/EditorContext.tsx';
import { PRESET_INSTRUMENTS, createPart } from '@/core/score/index.ts';

export function PartsPanel() {
  const { score, editorState, dispatch, mutateScore } = useEditor();
  const [showAddInstrument, setShowAddInstrument] = useState(false);

  const addPart = (inst: InstrumentConfig) => {
    const numMeasures = score.parts[0]?.measures.length ?? 8;
    const part = createPart(inst, numMeasures);
    mutateScore((s) => { s.parts.push(part); });
    setShowAddInstrument(false);
  };

  const removePart = (index: number) => {
    if (score.parts.length <= 1) return;
    mutateScore((s) => { s.parts.splice(index, 1); });
    if (editorState.cursor.partIndex >= score.parts.length - 1) {
      dispatch({ type: 'SET_CURSOR_PART', partIndex: Math.max(0, score.parts.length - 2) });
    }
  };

  const movePart = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= score.parts.length) return;
    mutateScore((s) => {
      [s.parts[index], s.parts[target]] = [s.parts[target], s.parts[index]];
    });
    if (editorState.cursor.partIndex === index) {
      dispatch({ type: 'SET_CURSOR_PART', partIndex: target });
    } else if (editorState.cursor.partIndex === target) {
      dispatch({ type: 'SET_CURSOR_PART', partIndex: index });
    }
  };

  return (
    <aside className="parts-panel">
      <h3 className="panel-title">Parts</h3>
      <div className="parts-actions">
        <button className="parts-action-btn" onClick={() => setShowAddInstrument(!showAddInstrument)}>
          + Add
        </button>
      </div>

      {showAddInstrument && (
        <div style={{ padding: '4px 12px' }}>
          {PRESET_INSTRUMENTS.map((inst) => (
            <button
              key={inst.id}
              className="dialog-add-btn"
              onClick={() => addPart(inst)}
            >
              {inst.isPercussion ? '🥁' : inst.usesTab ? '🎸' : '🎹'} {inst.name}
            </button>
          ))}
        </div>
      )}

      <ul className="parts-list">
        {score.parts.map((part, i) => (
          <li
            key={part.id}
            className={`parts-item${editorState.cursor.partIndex === i ? ' active' : ''}`}
            onClick={() => dispatch({ type: 'SET_CURSOR_PART', partIndex: i })}
          >
            <span className="parts-drag-handle" title="Drag to reorder">⠿</span>
            <span className="parts-icon">
              {part.instrument.isPercussion ? '🥁' : part.instrument.usesTab ? '🎸' : '🎹'}
            </span>
            <span className="parts-name">{part.instrument.name}</span>
            <span className="parts-measures">{part.measures.length}m</span>
            <div className="parts-item-controls">
              <button
                className="parts-action-btn"
                onClick={(e) => { e.stopPropagation(); movePart(i, 'up'); }}
                disabled={i === 0}
                title="Move up"
              >
                ↑
              </button>
              <button
                className="parts-action-btn"
                onClick={(e) => { e.stopPropagation(); movePart(i, 'down'); }}
                disabled={i === score.parts.length - 1}
                title="Move down"
              >
                ↓
              </button>
              <button
                className="parts-action-btn"
                onClick={(e) => { e.stopPropagation(); removePart(i); }}
                disabled={score.parts.length <= 1}
                title="Remove"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

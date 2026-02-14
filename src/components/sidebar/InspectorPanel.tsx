import type { Note, Rest, DynamicLevel } from '@/types/index.ts';
import { useEditor } from '@/stores/EditorContext.tsx';

const DYNAMIC_LEVELS: DynamicLevel[] = ['ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff'];

export function InspectorPanel() {
  const { score, editorState, mutateScore } = useEditor();
  const { cursor } = editorState;

  const part = score.parts[cursor.partIndex];
  const measure = part?.measures[cursor.measureIndex];
  const noteAtCursor = measure?.notes[cursor.noteIndex];

  const currentDynamic = measure?.directions.find((d) => d.kind === 'dynamic');
  const currentTempo = measure?.directions.find((d) => d.kind === 'tempo');

  const setDynamic = (level: DynamicLevel) => {
    const mIdx = cursor.measureIndex;
    const pIdx = cursor.partIndex;
    mutateScore((s) => {
      const m = s.parts[pIdx]?.measures[mIdx];
      if (!m) return;
      const existing = m.directions.findIndex((d) => d.kind === 'dynamic');
      if (existing >= 0) {
        m.directions[existing] = { kind: 'dynamic', level };
      } else {
        m.directions.push({ kind: 'dynamic', level });
      }
    });
  };

  return (
    <aside className="inspector-panel">
      <h3 className="panel-title">Inspector</h3>

      {/* Score metadata */}
      <div className="inspector-section">
        <div className="inspector-row">
          <span className="inspector-label">Title</span>
          <span className="inspector-value">{score.meta.title}</span>
        </div>
        {score.meta.composer && (
          <div className="inspector-row">
            <span className="inspector-label">Composer</span>
            <span className="inspector-value">{score.meta.composer}</span>
          </div>
        )}
        <div className="inspector-row">
          <span className="inspector-label">Parts</span>
          <span className="inspector-value">{score.parts.length}</span>
        </div>
        <div className="inspector-row">
          <span className="inspector-label">Measures</span>
          <span className="inspector-value">{part?.measures.length ?? 0}</span>
        </div>
      </div>

      {/* Cursor position */}
      <h3 className="panel-title" style={{ marginTop: 8 }}>Cursor</h3>
      <div className="inspector-section">
        <div className="inspector-row">
          <span className="inspector-label">Part</span>
          <span className="inspector-value">{part?.instrument.name ?? '—'}</span>
        </div>
        <div className="inspector-row">
          <span className="inspector-label">Measure</span>
          <span className="inspector-value">{cursor.measureIndex + 1}</span>
        </div>
        <div className="inspector-row">
          <span className="inspector-label">Beat</span>
          <span className="inspector-value">{cursor.noteIndex + 1}</span>
        </div>
        <div className="inspector-row">
          <span className="inspector-label">Voice</span>
          <span className="inspector-value">{cursor.voice}</span>
        </div>
        <div className="inspector-row">
          <span className="inspector-label">Mode</span>
          <span className="inspector-value">{editorState.inputMode}</span>
        </div>
      </div>

      {/* Note/Rest properties */}
      {noteAtCursor && (
        <>
          <h3 className="panel-title" style={{ marginTop: 8 }}>
            {noteAtCursor.type === 'note' ? 'Note' : 'Rest'}
          </h3>
          <div className="inspector-section">
            {noteAtCursor.type === 'note' && (
              <>
                <div className="inspector-row">
                  <span className="inspector-label">Pitch</span>
                  <span className="inspector-value">
                    {(noteAtCursor as Note).pitch.step}
                    {(noteAtCursor as Note).pitch.octave}
                  </span>
                </div>
                {(noteAtCursor as Note).pitch.alter !== undefined && (noteAtCursor as Note).pitch.alter !== 0 && (
                  <div className="inspector-row">
                    <span className="inspector-label">Alter</span>
                    <span className="inspector-value">{(noteAtCursor as Note).pitch.alter! > 0 ? '+' : ''}{(noteAtCursor as Note).pitch.alter}</span>
                  </div>
                )}
                {(noteAtCursor as Note).accidental && (
                  <div className="inspector-row">
                    <span className="inspector-label">Accidental</span>
                    <span className="inspector-value">{(noteAtCursor as Note).accidental}</span>
                  </div>
                )}
                {(noteAtCursor as Note).tie && (
                  <div className="inspector-row">
                    <span className="inspector-label">Tie</span>
                    <span className="inspector-value">{(noteAtCursor as Note).tie}</span>
                  </div>
                )}
                {(noteAtCursor as Note).articulations && (noteAtCursor as Note).articulations!.length > 0 && (
                  <div className="inspector-row">
                    <span className="inspector-label">Articulations</span>
                    <span className="inspector-value">{(noteAtCursor as Note).articulations!.join(', ')}</span>
                  </div>
                )}
                {(noteAtCursor as Note).ornaments && (noteAtCursor as Note).ornaments!.length > 0 && (
                  <div className="inspector-row">
                    <span className="inspector-label">Ornaments</span>
                    <span className="inspector-value">{(noteAtCursor as Note).ornaments!.join(', ')}</span>
                  </div>
                )}
                {(noteAtCursor as Note).slur && (
                  <div className="inspector-row">
                    <span className="inspector-label">Slur</span>
                    <span className="inspector-value">{(noteAtCursor as Note).slur}</span>
                  </div>
                )}
                {(noteAtCursor as Note).lyrics && (noteAtCursor as Note).lyrics!.length > 0 && (
                  <div className="inspector-row">
                    <span className="inspector-label">Lyrics</span>
                    <span className="inspector-value">{(noteAtCursor as Note).lyrics!.map((l) => l.text).join(' ')}</span>
                  </div>
                )}
                {(noteAtCursor as Note).tuplet && (
                  <div className="inspector-row">
                    <span className="inspector-label">Tuplet</span>
                    <span className="inspector-value">{(noteAtCursor as Note).tuplet!.actualNotes}:{(noteAtCursor as Note).tuplet!.normalNotes}</span>
                  </div>
                )}
              </>
            )}
            <div className="inspector-row">
              <span className="inspector-label">Duration</span>
              <span className="inspector-value">
                {noteAtCursor.duration}
                {noteAtCursor.dots > 0 ? ` (${'·'.repeat(noteAtCursor.dots)})` : ''}
              </span>
            </div>
            {noteAtCursor.type === 'rest' && (noteAtCursor as Rest).isFullMeasure && (
              <div className="inspector-row">
                <span className="inspector-label">Type</span>
                <span className="inspector-value">Full measure</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Measure properties */}
      {measure && (
        <>
          <h3 className="panel-title" style={{ marginTop: 8 }}>Measure</h3>
          <div className="inspector-section">
            {measure.attributes?.time && (
              <div className="inspector-row">
                <span className="inspector-label">Time</span>
                <span className="inspector-value">{measure.attributes.time.beats}/{measure.attributes.time.beatType}</span>
              </div>
            )}
            {measure.attributes?.key && (
              <div className="inspector-row">
                <span className="inspector-label">Key</span>
                <span className="inspector-value">{measure.attributes.key.fifths > 0 ? `${measure.attributes.key.fifths}#` : measure.attributes.key.fifths < 0 ? `${Math.abs(measure.attributes.key.fifths)}b` : 'C'} {measure.attributes.key.mode ?? ''}</span>
              </div>
            )}
            {currentTempo && currentTempo.kind === 'tempo' && (
              <div className="inspector-row">
                <span className="inspector-label">Tempo</span>
                <span className="inspector-value">{currentTempo.bpm} BPM</span>
              </div>
            )}
            {measure?.directions.filter((d) => d.kind === 'harmony').map((d, i) => (
              <div className="inspector-row" key={`harm-${i}`}>
                <span className="inspector-label">Chord</span>
                <span className="inspector-value">{d.kind === 'harmony' ? (d.text ?? `${d.root.step}${d.root.alter === 1 ? '#' : d.root.alter === -1 ? 'b' : ''} ${d.chordKind}`) : ''}</span>
              </div>
            ))}
            {measure?.directions.filter((d) => d.kind === 'words').map((d, i) => (
              <div className="inspector-row" key={`words-${i}`}>
                <span className="inspector-label">Text</span>
                <span className="inspector-value" style={{ fontStyle: 'italic' }}>{d.kind === 'words' ? d.text : ''}</span>
              </div>
            ))}
            {measure?.directions.filter((d) => d.kind === 'rehearsal').map((d, i) => (
              <div className="inspector-row" key={`reh-${i}`}>
                <span className="inspector-label">Rehearsal</span>
                <span className="inspector-value" style={{ fontWeight: 'bold' }}>{d.kind === 'rehearsal' ? d.text : ''}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Dynamics */}
      <h3 className="panel-title" style={{ marginTop: 8 }}>Dynamics</h3>
      <div className="inspector-section">
        <div className="articulation-palette">
          {DYNAMIC_LEVELS.map((level) => (
            <button
              key={level}
              className={`articulation-btn ${currentDynamic?.kind === 'dynamic' && currentDynamic.level === level ? 'active' : ''}`}
              onClick={() => setDynamic(level)}
              title={level}
              style={{ fontSize: 11, fontStyle: 'italic' }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Selection info */}
      {editorState.selectedNoteIds.length > 0 && (
        <>
          <h3 className="panel-title" style={{ marginTop: 8 }}>Selection</h3>
          <div className="inspector-section">
            <div className="inspector-row">
              <span className="inspector-label">Selected</span>
              <span className="inspector-value">{editorState.selectedNoteIds.length} notes</span>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

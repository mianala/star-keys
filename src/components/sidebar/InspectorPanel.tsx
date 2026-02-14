import type { Note, Rest } from '@/types/index.ts';
import { useEditor } from '@/stores/EditorContext.tsx';

export function InspectorPanel() {
  const { score, editorState } = useEditor();
  const { cursor } = editorState;

  const part = score.parts[cursor.partIndex];
  const measure = part?.measures[cursor.measureIndex];
  const noteAtCursor = measure?.notes[cursor.noteIndex];

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
                {(noteAtCursor as Note).accidental && (
                  <div className="inspector-row">
                    <span className="inspector-label">Accidental</span>
                    <span className="inspector-value">{(noteAtCursor as Note).accidental}</span>
                  </div>
                )}
              </>
            )}
            <div className="inspector-row">
              <span className="inspector-label">Duration</span>
              <span className="inspector-value">{noteAtCursor.duration}</span>
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
    </aside>
  );
}

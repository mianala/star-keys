import { useEditor } from '@/stores/EditorContext.tsx';

export function PartsPanel() {
  const { score, editorState, dispatch } = useEditor();

  return (
    <aside className="parts-panel">
      <h3 className="panel-title">Parts</h3>
      <ul className="parts-list">
        {score.parts.map((part, i) => (
          <li
            key={part.id}
            className={`parts-item${editorState.cursor.partIndex === i ? ' active' : ''}`}
            onClick={() => dispatch({ type: 'SET_CURSOR_PART', partIndex: i })}
          >
            <span className="parts-icon">
              {part.instrument.isPercussion ? '🥁' : '🎸'}
            </span>
            <span className="parts-name">{part.instrument.name}</span>
            <span className="parts-measures">{part.measures.length}m</span>
            <span className="parts-index">#{i + 1}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

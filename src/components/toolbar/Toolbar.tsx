import { useEditor } from '@/stores/EditorContext.tsx';
import type { NoteDuration, ArticulationType } from '@/types/index.ts';

const DURATIONS: { label: string; value: NoteDuration; key: string }[] = [
  { label: '𝅝', value: 'whole', key: '1' },
  { label: '𝅗𝅥', value: 'half', key: '2' },
  { label: '♩', value: 'quarter', key: '3' },
  { label: '♪', value: 'eighth', key: '4' },
  { label: '𝅘𝅥𝅯', value: '16th', key: '5' },
  { label: '𝅘𝅥𝅰', value: '32nd', key: '6' },
];

const ARTICULATIONS: { label: string; value: ArticulationType; title: string }[] = [
  { label: '·', value: 'staccato', title: 'Staccato' },
  { label: '>', value: 'accent', title: 'Accent' },
  { label: '^', value: 'marcato', title: 'Marcato' },
  { label: '—', value: 'tenuto', title: 'Tenuto' },
  { label: '𝄐', value: 'fermata', title: 'Fermata' },
];

interface ToolbarProps {
  onArticulation?: (art: ArticulationType) => void;
  onDot?: () => void;
  onSharp?: () => void;
  onFlat?: () => void;
  onNatural?: () => void;
  onTie?: () => void;
}

export function Toolbar({ onArticulation, onDot, onSharp, onFlat, onNatural, onTie }: ToolbarProps) {
  const { editorState, dispatch } = useEditor();

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <span className="toolbar-label">Duration</span>
        {DURATIONS.map((d) => (
          <button
            key={d.value}
            className={`toolbar-btn ${editorState.selectedDuration === d.value ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_DURATION', duration: d.value })}
            title={`${d.value} (${d.key})`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <span className="toolbar-label">Tool</span>
        <button
          className={`toolbar-btn ${editorState.activeTool === 'note' ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_ACTIVE_TOOL', tool: 'note' })}
          title="Note input"
        >
          N
        </button>
        <button
          className={`toolbar-btn ${editorState.activeTool === 'rest' ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_ACTIVE_TOOL', tool: 'rest' })}
          title="Rest input (0)"
        >
          𝄾
        </button>
        <button
          className={`toolbar-btn ${editorState.activeTool === 'select' ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_ACTIVE_TOOL', tool: 'select' })}
          title="Select"
        >
          ↖
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <span className="toolbar-label">Modify</span>
        <button className="toolbar-btn" title="Dot (.)" onClick={onDot}>.</button>
        <button className="toolbar-btn" title="Sharp (+)" onClick={onSharp}>♯</button>
        <button className="toolbar-btn" title="Flat (-)" onClick={onFlat}>♭</button>
        <button className="toolbar-btn" title="Natural" onClick={onNatural}>♮</button>
        <button className="toolbar-btn" title="Tie (T)" onClick={onTie}>⁀</button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <span className="toolbar-label">Articulation</span>
        {ARTICULATIONS.map((a) => (
          <button
            key={a.value}
            className="articulation-btn"
            title={a.title}
            onClick={() => onArticulation?.(a.value)}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <span className="toolbar-label">Voice</span>
        <button
          className={`toolbar-btn ${editorState.cursor.voice === 1 ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_CURSOR', cursor: { ...editorState.cursor, voice: 1 } })}
          title="Voice 1"
        >
          1
        </button>
        <button
          className={`toolbar-btn ${editorState.cursor.voice === 2 ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_CURSOR', cursor: { ...editorState.cursor, voice: 2 } })}
          title="Voice 2"
        >
          2
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <span className="toolbar-label">Mode</span>
        <button
          className={`toolbar-btn ${editorState.inputMode === 'insert' ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_INPUT_MODE', mode: editorState.inputMode === 'insert' ? 'replace' : 'insert' })}
          title="Insert/Replace (I)"
        >
          {editorState.inputMode === 'insert' ? 'INS' : 'REP'}
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <span className="toolbar-label">View</span>
        <button
          className="toolbar-btn"
          onClick={() => dispatch({ type: 'SET_ZOOM', zoom: editorState.zoom - 10 })}
          title="Zoom out (Ctrl+-)"
        >
          −
        </button>
        <span className="toolbar-zoom">{editorState.zoom}%</span>
        <button
          className="toolbar-btn"
          onClick={() => dispatch({ type: 'SET_ZOOM', zoom: editorState.zoom + 10 })}
          title="Zoom in (Ctrl+=)"
        >
          +
        </button>
        <button
          className="toolbar-btn"
          onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
          title="Toggle dark mode"
        >
          {editorState.isDarkMode ? 'Light' : 'Dark'}
        </button>
      </div>
    </div>
  );
}

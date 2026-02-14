import { useEditor } from '@/stores/EditorContext.tsx';
import type { NoteDuration } from '@/types/index.ts';

const DURATIONS: { label: string; value: NoteDuration; key: string }[] = [
  { label: '𝅝', value: 'whole', key: '1' },
  { label: '𝅗𝅥', value: 'half', key: '2' },
  { label: '♩', value: 'quarter', key: '3' },
  { label: '♪', value: 'eighth', key: '4' },
  { label: '𝅘𝅥𝅯', value: '16th', key: '5' },
  { label: '𝅘𝅥𝅰', value: '32nd', key: '6' },
];

export function Toolbar() {
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

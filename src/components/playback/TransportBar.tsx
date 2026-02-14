import { useEditor } from '@/stores/EditorContext.tsx';

export function TransportBar() {
  const { editorState, dispatch } = useEditor();

  return (
    <div className="transport-bar">
      <div className="transport-controls">
        <button
          className="transport-btn"
          title="Rewind"
          onClick={() => dispatch({ type: 'STOP_PLAYBACK' })}
        >
          ⏮
        </button>
        <button
          className={`transport-btn transport-btn-play${editorState.isPlaying ? ' playing' : ''}`}
          title="Play (Space)"
          onClick={() => dispatch({ type: 'TOGGLE_PLAYBACK' })}
        >
          {editorState.isPlaying ? '⏸' : '▶'}
        </button>
        <button
          className="transport-btn"
          title="Stop"
          onClick={() => dispatch({ type: 'STOP_PLAYBACK' })}
        >
          ⏹
        </button>
      </div>

      <div className="transport-tempo">
        <span className="transport-label">♩ =</span>
        <input
          type="number"
          className="transport-bpm"
          value={editorState.tempo}
          min={20}
          max={300}
          step={1}
          onChange={(e) => dispatch({ type: 'SET_TEMPO', tempo: Number(e.target.value) })}
          onBlur={() => {
            const clamped = Math.max(20, Math.min(300, editorState.tempo || 120));
            if (clamped !== editorState.tempo) {
              dispatch({ type: 'SET_TEMPO', tempo: clamped });
            }
          }}
        />
      </div>

      <div className="transport-progress">
        <div className="transport-progress-bar">
          <div className="transport-progress-fill" style={{ width: '0%' }} />
        </div>
        <span className="transport-time">0:00 / 0:00</span>
      </div>

      <div className="transport-toggles">
        <button
          className={`transport-btn${editorState.isMetronomeOn ? ' active' : ''}`}
          title="Metronome"
          onClick={() => dispatch({ type: 'TOGGLE_METRONOME' })}
        >
          🥁
        </button>
        <button
          className={`transport-btn${editorState.isLoopOn ? ' active' : ''}`}
          title="Loop"
          onClick={() => dispatch({ type: 'TOGGLE_LOOP' })}
        >
          🔁
        </button>
      </div>
    </div>
  );
}

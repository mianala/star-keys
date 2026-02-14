import { useEditor } from '@/stores/EditorContext.tsx';

interface TransportBarProps {
  onPlay?: () => void;
  onStop?: () => void;
  progress?: number;
  currentTime?: string;
  totalTime?: string;
}

export function TransportBar({ onPlay, onStop, progress = 0, currentTime = '0:00', totalTime = '0:00' }: TransportBarProps) {
  const { editorState, dispatch } = useEditor();

  return (
    <div className="transport-bar" role="toolbar" aria-label="Playback controls">
      <div className="transport-controls" role="group" aria-label="Transport">
        <button
          className="transport-btn"
          title="Rewind"
          aria-label="Rewind to start"
          onClick={onStop ?? (() => dispatch({ type: 'STOP_PLAYBACK' }))}
        >
          ⏮
        </button>
        <button
          className={`transport-btn transport-btn-play${editorState.isPlaying ? ' playing' : ''}`}
          title="Play (Space)"
          aria-label={editorState.isPlaying ? 'Pause playback' : 'Start playback'}
          onClick={onPlay ?? (() => dispatch({ type: 'TOGGLE_PLAYBACK' }))}
        >
          {editorState.isPlaying ? '⏸' : '▶'}
        </button>
        <button
          className="transport-btn"
          title="Stop"
          aria-label="Stop playback"
          onClick={onStop ?? (() => dispatch({ type: 'STOP_PLAYBACK' }))}
        >
          ⏹
        </button>
      </div>

      <div className="transport-tempo">
        <span className="transport-label">♩ =</span>
        <input
          type="number"
          className="transport-bpm"
          aria-label="Tempo in BPM"
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
        <div className="transport-progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Playback progress">
          <div className="transport-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="transport-time">{currentTime} / {totalTime}</span>
      </div>

      <div className="transport-toggles" role="group" aria-label="Playback options">
        <button
          className={`transport-btn${editorState.isMetronomeOn ? ' active' : ''}`}
          title="Metronome"
          aria-label="Toggle metronome"
          aria-pressed={editorState.isMetronomeOn}
          onClick={() => dispatch({ type: 'TOGGLE_METRONOME' })}
        >
          🥁
        </button>
        <button
          className={`transport-btn${editorState.isLoopOn ? ' active' : ''}`}
          title="Loop"
          aria-label="Toggle loop playback"
          aria-pressed={editorState.isLoopOn}
          onClick={() => dispatch({ type: 'TOGGLE_LOOP' })}
        >
          🔁
        </button>
      </div>
    </div>
  );
}

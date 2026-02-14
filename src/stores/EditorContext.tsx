import { createContext, useContext, useReducer, useRef, useMemo, useCallback, type ReactNode } from 'react';
import type { Score, EditorState, NoteDuration, CursorPosition, InputMode, EditorTool } from '@/types/index.ts';
import { createScore, GUITAR_STANDARD, DRUM_SET, CommandHistory } from '@/core/score/index.ts';
import type { Command } from '@/core/score/index.ts';
import { serializeToMusicXML } from '@/core/musicxml/index.ts';

// ─── State ──────────────────────────────────────────────────

const initialEditor: EditorState = {
  cursor: { partIndex: 0, measureIndex: 0, noteIndex: 0, voice: 1 },
  selectedDuration: 'quarter',
  inputMode: 'insert',
  activeTool: 'note',
  zoom: 100,
  isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  selectedNoteIds: [],
  isPlaying: false,
  tempo: 120,
  isMetronomeOn: false,
  isLoopOn: false,
};

type Action =
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_DURATION'; duration: NoteDuration }
  | { type: 'SET_CURSOR_PART'; partIndex: number }
  | { type: 'SET_CURSOR'; cursor: CursorPosition }
  | { type: 'SET_INPUT_MODE'; mode: InputMode }
  | { type: 'SET_ACTIVE_TOOL'; tool: EditorTool }
  | { type: 'TOGGLE_PLAYBACK' }
  | { type: 'STOP_PLAYBACK' }
  | { type: 'SET_TEMPO'; tempo: number }
  | { type: 'TOGGLE_METRONOME' }
  | { type: 'TOGGLE_LOOP' }
  | { type: 'FORCE_UPDATE' };

function editorReducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(25, Math.min(300, action.zoom)) };
    case 'TOGGLE_DARK_MODE':
      return { ...state, isDarkMode: !state.isDarkMode };
    case 'SET_DURATION':
      return { ...state, selectedDuration: action.duration };
    case 'SET_CURSOR_PART':
      return { ...state, cursor: { ...state.cursor, partIndex: action.partIndex, measureIndex: 0, noteIndex: 0 } };
    case 'SET_CURSOR':
      return { ...state, cursor: action.cursor };
    case 'SET_INPUT_MODE':
      return { ...state, inputMode: action.mode };
    case 'SET_ACTIVE_TOOL':
      return { ...state, activeTool: action.tool };
    case 'TOGGLE_PLAYBACK':
      return { ...state, isPlaying: !state.isPlaying };
    case 'STOP_PLAYBACK':
      return { ...state, isPlaying: false };
    case 'SET_TEMPO':
      return { ...state, tempo: action.tempo };
    case 'TOGGLE_METRONOME':
      return { ...state, isMetronomeOn: !state.isMetronomeOn };
    case 'TOGGLE_LOOP':
      return { ...state, isLoopOn: !state.isLoopOn };
    case 'FORCE_UPDATE':
      return { ...state };
    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────

export type MoveCursorDirection =
  | 'left' | 'right'
  | 'measureLeft' | 'measureRight'
  | 'home' | 'end';

interface EditorContextValue {
  editorState: EditorState;
  dispatch: React.Dispatch<Action>;
  score: Score;
  setScore: (score: Score) => void;
  musicXML: string;
  commandHistory: CommandHistory;
  executeCommand: (cmd: Command) => void;
  scoreRef: React.RefObject<Score>;
}

const EditorContext = createContext<EditorContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────

export function EditorProvider({ children }: { children: ReactNode }) {
  const [editorState, dispatch] = useReducer(editorReducer, initialEditor);
  const scoreRef = useRef<Score>(
    createScore('Untitled Score', '', [GUITAR_STANDARD, DRUM_SET], 8),
  );
  const commandHistoryRef = useRef(new CommandHistory());

  const setScore = useCallback((score: Score) => {
    scoreRef.current = score;
    commandHistoryRef.current.clear();
    dispatch({ type: 'FORCE_UPDATE' });
  }, []);

  const executeCommand = useCallback((cmd: Command) => {
    commandHistoryRef.current.execute(cmd);
    dispatch({ type: 'FORCE_UPDATE' });
  }, []);

  const musicXML = useMemo(
    () => serializeToMusicXML(scoreRef.current),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editorState], // re-serialize whenever editor state changes (including FORCE_UPDATE)
  );

  const value: EditorContextValue = {
    editorState,
    dispatch,
    score: scoreRef.current,
    setScore,
    musicXML,
    commandHistory: commandHistoryRef.current,
    executeCommand,
    scoreRef,
  };

  return <EditorContext value={value}>{children}</EditorContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used within EditorProvider');
  return ctx;
}

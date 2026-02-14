import type { NoteDuration } from './score.ts';

export type InputMode = 'insert' | 'replace';
export type EditorTool = 'note' | 'rest' | 'select';

export interface CursorPosition {
  partIndex: number;
  measureIndex: number;
  noteIndex: number;
  voice: number;
}

export interface EditorState {
  cursor: CursorPosition;
  selectedDuration: NoteDuration;
  inputMode: InputMode;
  activeTool: EditorTool;
  zoom: number;         // percentage, default 100
  isDarkMode: boolean;
  selectedNoteIds: string[];
  isPlaying: boolean;
  tempo: number;        // BPM, default 120
  isMetronomeOn: boolean;
  isLoopOn: boolean;
}

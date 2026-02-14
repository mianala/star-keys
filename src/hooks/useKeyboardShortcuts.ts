import { useEffect } from 'react';
import type { NoteDuration, Step } from '@/types/index.ts';

const DURATION_KEYS: Record<string, NoteDuration> = {
  '1': 'whole',
  '2': 'half',
  '3': 'quarter',
  '4': 'eighth',
  '5': '16th',
  '6': '32nd',
  '7': '64th',
};

const NOTE_KEYS: Record<string, Step> = {
  a: 'A',
  b: 'B',
  c: 'C',
  d: 'D',
  e: 'E',
  f: 'F',
  g: 'G',
};

export interface ShortcutActions {
  setDuration: (duration: NoteDuration) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  toggleDarkMode: () => void;
  undo: () => void;
  redo: () => void;
  togglePlayback: () => void;
  insertNote: (step: Step) => void;
  insertChordNote: (step: Step) => void;
  insertRest: () => void;
  deleteAtCursor: () => void;
  moveCursor: (direction: 'left' | 'right' | 'measureLeft' | 'measureRight' | 'home' | 'end') => void;
  switchPart: (direction: 'prev' | 'next') => void;
  toggleInputMode: () => void;
  cycleVoice: () => void;
  toggleDot: () => void;
  sharpen: () => void;
  flatten: () => void;
  toggleTie: () => void;
  pitchUp: () => void;
  pitchDown: () => void;
  octaveUp: () => void;
  octaveDown: () => void;
  insertMeasure: () => void;
  deleteMeasure: () => void;
  selectAll: () => void;
  escape: () => void;
  copy: () => void;
  cut: () => void;
  paste: () => void;
}

export function useKeyboardShortcuts(actions: ShortcutActions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when typing in input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const ctrl = e.ctrlKey || e.metaKey;

      // Escape: clear selection
      if (e.key === 'Escape') {
        e.preventDefault();
        actions.escape();
        return;
      }

      // Select all: Ctrl+A
      if (ctrl && e.key === 'a') {
        e.preventDefault();
        actions.selectAll();
        return;
      }

      // Duration keys (1-7)
      if (!ctrl && !e.altKey && !e.shiftKey && DURATION_KEYS[e.key]) {
        e.preventDefault();
        actions.setDuration(DURATION_KEYS[e.key]);
        return;
      }

      // Chord input (Shift+A-G)
      if (!ctrl && !e.altKey && e.shiftKey && NOTE_KEYS[e.key.toLowerCase()]) {
        e.preventDefault();
        actions.insertChordNote(NOTE_KEYS[e.key.toLowerCase()]);
        return;
      }

      // Note input (A-G) — only when no modifiers
      if (!ctrl && !e.altKey && !e.shiftKey && NOTE_KEYS[e.key]) {
        e.preventDefault();
        actions.insertNote(NOTE_KEYS[e.key]);
        return;
      }

      // Rest input (0)
      if (!ctrl && !e.altKey && e.key === '0') {
        e.preventDefault();
        actions.insertRest();
        return;
      }

      // Dot toggle (.)
      if (!ctrl && !e.altKey && e.key === '.') {
        e.preventDefault();
        actions.toggleDot();
        return;
      }

      // Accidentals
      if (!ctrl && !e.altKey && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        actions.sharpen();
        return;
      }
      if (!ctrl && !e.altKey && e.key === '-') {
        e.preventDefault();
        actions.flatten();
        return;
      }

      // Tie (T)
      if (!ctrl && !e.altKey && !e.shiftKey && e.key === 't') {
        e.preventDefault();
        actions.toggleTie();
        return;
      }

      // Delete/Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        actions.deleteAtCursor();
        return;
      }

      // Pitch Up/Down (Arrow Up/Down without modifiers)
      if (e.key === 'ArrowUp' && !ctrl && !e.shiftKey) {
        e.preventDefault();
        actions.pitchUp();
        return;
      }
      if (e.key === 'ArrowDown' && !ctrl && !e.shiftKey) {
        e.preventDefault();
        actions.pitchDown();
        return;
      }

      // Octave Up/Down (Shift+Arrow Up/Down)
      if (e.key === 'ArrowUp' && e.shiftKey && !ctrl) {
        e.preventDefault();
        actions.octaveUp();
        return;
      }
      if (e.key === 'ArrowDown' && e.shiftKey && !ctrl) {
        e.preventDefault();
        actions.octaveDown();
        return;
      }

      // Navigation
      if (e.key === 'ArrowLeft' && !ctrl && !e.shiftKey) {
        e.preventDefault();
        actions.moveCursor('left');
        return;
      }
      if (e.key === 'ArrowRight' && !ctrl && !e.shiftKey) {
        e.preventDefault();
        actions.moveCursor('right');
        return;
      }
      if (e.key === 'ArrowLeft' && ctrl) {
        e.preventDefault();
        actions.moveCursor('measureLeft');
        return;
      }
      if (e.key === 'ArrowRight' && ctrl) {
        e.preventDefault();
        actions.moveCursor('measureRight');
        return;
      }
      if (e.key === 'Home') {
        e.preventDefault();
        actions.moveCursor('home');
        return;
      }
      if (e.key === 'End') {
        e.preventDefault();
        actions.moveCursor('end');
        return;
      }

      // Switch part (Ctrl+Shift+ArrowUp/Down)
      if (ctrl && e.shiftKey && e.key === 'ArrowUp') {
        e.preventDefault();
        actions.switchPart('prev');
        return;
      }
      if (ctrl && e.shiftKey && e.key === 'ArrowDown') {
        e.preventDefault();
        actions.switchPart('next');
        return;
      }

      // Toggle insert/replace mode (I)
      if (!ctrl && !e.altKey && !e.shiftKey && e.key === 'i') {
        e.preventDefault();
        actions.toggleInputMode();
        return;
      }

      // Cycle voice (V)
      if (!ctrl && !e.altKey && !e.shiftKey && e.key === 'v') {
        e.preventDefault();
        actions.cycleVoice();
        return;
      }

      // Insert measure (Ctrl+Shift+M)
      if (ctrl && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        actions.insertMeasure();
        return;
      }

      // Delete measure (Ctrl+Shift+Delete)
      if (ctrl && e.shiftKey && e.key === 'Delete') {
        e.preventDefault();
        actions.deleteMeasure();
        return;
      }

      // Zoom: Ctrl+= / Ctrl+-  / Ctrl+0
      if (ctrl && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        actions.zoomIn();
        return;
      }
      if (ctrl && e.key === '-') {
        e.preventDefault();
        actions.zoomOut();
        return;
      }
      if (ctrl && e.key === '0') {
        e.preventDefault();
        actions.resetZoom();
        return;
      }

      // Undo/Redo: Ctrl+Z / Ctrl+Y
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        actions.undo();
        return;
      }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        actions.redo();
        return;
      }

      // Copy: Ctrl+C
      if (ctrl && e.key === 'c' && !e.shiftKey) {
        e.preventDefault();
        actions.copy();
        return;
      }

      // Cut: Ctrl+X
      if (ctrl && e.key === 'x' && !e.shiftKey) {
        e.preventDefault();
        actions.cut();
        return;
      }

      // Paste: Ctrl+V
      if (ctrl && e.key === 'v' && !e.shiftKey) {
        e.preventDefault();
        actions.paste();
        return;
      }

      // Space: toggle playback
      if (e.key === ' ' && !ctrl) {
        e.preventDefault();
        actions.togglePlayback();
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);
}

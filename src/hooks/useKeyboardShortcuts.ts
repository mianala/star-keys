import { useEffect } from 'react';
import type { NoteDuration, Step } from '@/types/index.ts';

const DURATION_KEYS: Record<string, NoteDuration> = {
  '1': 'whole',
  '2': 'half',
  '3': 'quarter',
  '4': 'eighth',
  '5': '16th',
  '6': '32nd',
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
  insertRest: () => void;
  deleteAtCursor: () => void;
  moveCursor: (direction: 'left' | 'right' | 'measureLeft' | 'measureRight' | 'home' | 'end') => void;
  switchPart: (direction: 'prev' | 'next') => void;
  toggleInputMode: () => void;
  cycleVoice: () => void;
}

export function useKeyboardShortcuts(actions: ShortcutActions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when typing in input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const ctrl = e.ctrlKey || e.metaKey;

      // Duration keys (1-6)
      if (!ctrl && !e.altKey && DURATION_KEYS[e.key]) {
        e.preventDefault();
        actions.setDuration(DURATION_KEYS[e.key]);
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

      // Delete/Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        actions.deleteAtCursor();
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

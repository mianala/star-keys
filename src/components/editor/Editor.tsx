import { useMemo, useRef, useCallback } from 'react';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import type { NoteDuration, Step, CursorPosition } from '@/types/index.ts';
import { useEditor } from '@/stores/EditorContext.tsx';
import type { MoveCursorDirection } from '@/stores/EditorContext.tsx';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts.ts';
import type { ShortcutActions } from '@/hooks/useKeyboardShortcuts.ts';
import { useFileIO } from '@/hooks/useFileIO.ts';
import { createNote, createRest, InsertNoteCommand, InsertRestCommand, DeleteNoteCommand, ReplaceNoteCommand } from '@/core/score/index.ts';
import { ScoreRenderer } from './ScoreRenderer.tsx';
import { Toolbar } from '@/components/toolbar/Toolbar.tsx';
import { PartsPanel } from '@/components/sidebar/PartsPanel.tsx';
import { InspectorPanel } from '@/components/sidebar/InspectorPanel.tsx';
import { TransportBar } from '@/components/playback/TransportBar.tsx';
import { MenuBar } from '@/components/menu/MenuBar.tsx';

function syncOsmdCursor(osmd: OSMD | null, cursor: CursorPosition) {
  if (!osmd || !osmd.cursors || osmd.cursors.length === 0) return;
  const c = osmd.cursors[0];
  c.reset();

  // Navigate to the target position
  // Each cursor.next() advances one note/rest across all parts
  // We need to advance to the right measure and note index
  let currentMeasure = 0;
  let currentNote = 0;

  const targetMeasure = cursor.measureIndex;
  const targetNote = cursor.noteIndex;

  while (!c.Iterator.EndReached) {
    const iterMeasure = c.Iterator.CurrentMeasureIndex;
    if (iterMeasure > targetMeasure) break;
    if (iterMeasure === targetMeasure && currentNote >= targetNote && currentMeasure === targetMeasure) break;

    if (iterMeasure === targetMeasure) {
      if (currentMeasure !== targetMeasure) {
        currentMeasure = targetMeasure;
        currentNote = 0;
      } else {
        currentNote++;
      }
    }

    if (iterMeasure === targetMeasure && currentNote >= targetNote) break;
    c.next();
  }

  c.show();
}

export function Editor() {
  const { editorState, dispatch, score, setScore, musicXML, commandHistory, executeCommand, scoreRef } = useEditor();
  const osmdRef = useRef<OSMD | null>(null);

  const onOsmdReady = useCallback((osmd: OSMD) => {
    osmdRef.current = osmd;
    syncOsmdCursor(osmd, editorState.cursor);
  }, [editorState.cursor]);

  const { newScore, triggerOpen, saveAsXML, exportAsMXL } = useFileIO({
    setScore,
    musicXML,
    scoreTitle: score.meta.title,
  });

  const moveCursor = useCallback((direction: MoveCursorDirection) => {
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const part = s.parts[cur.partIndex];
    if (!part) return;

    let newCursor: CursorPosition;

    switch (direction) {
      case 'left': {
        if (cur.noteIndex > 0) {
          newCursor = { ...cur, noteIndex: cur.noteIndex - 1 };
        } else if (cur.measureIndex > 0) {
          const prevMeasure = part.measures[cur.measureIndex - 1];
          newCursor = {
            ...cur,
            measureIndex: cur.measureIndex - 1,
            noteIndex: Math.max(0, prevMeasure.notes.length - 1),
          };
        } else {
          return;
        }
        break;
      }
      case 'right': {
        const measure = part.measures[cur.measureIndex];
        if (!measure) return;
        if (cur.noteIndex < measure.notes.length - 1) {
          newCursor = { ...cur, noteIndex: cur.noteIndex + 1 };
        } else if (cur.measureIndex < part.measures.length - 1) {
          newCursor = { ...cur, measureIndex: cur.measureIndex + 1, noteIndex: 0 };
        } else {
          return;
        }
        break;
      }
      case 'measureLeft': {
        if (cur.measureIndex > 0) {
          newCursor = { ...cur, measureIndex: cur.measureIndex - 1, noteIndex: 0 };
        } else {
          return;
        }
        break;
      }
      case 'measureRight': {
        if (cur.measureIndex < part.measures.length - 1) {
          newCursor = { ...cur, measureIndex: cur.measureIndex + 1, noteIndex: 0 };
        } else {
          return;
        }
        break;
      }
      case 'home': {
        newCursor = { ...cur, measureIndex: 0, noteIndex: 0 };
        break;
      }
      case 'end': {
        const lastMeasureIdx = part.measures.length - 1;
        const lastMeasure = part.measures[lastMeasureIdx];
        newCursor = {
          ...cur,
          measureIndex: lastMeasureIdx,
          noteIndex: Math.max(0, lastMeasure.notes.length - 1),
        };
        break;
      }
    }

    dispatch({ type: 'SET_CURSOR', cursor: newCursor });
    syncOsmdCursor(osmdRef.current, newCursor);
  }, [editorState.cursor, scoreRef, dispatch]);

  const insertNote = useCallback((step: Step) => {
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const part = s.parts[cur.partIndex];
    if (!part) return;
    const measure = part.measures[cur.measureIndex];
    if (!measure) return;

    const note = createNote(
      { step, octave: 4 },
      editorState.selectedDuration,
      cur.voice,
    );

    if (editorState.inputMode === 'replace' && measure.notes[cur.noteIndex]) {
      const oldNote = measure.notes[cur.noteIndex];
      const cmd = new ReplaceNoteCommand(s, { ...cur }, oldNote.id, note);
      executeCommand(cmd);
    } else {
      const cmd = new InsertNoteCommand(s, { ...cur }, note);
      executeCommand(cmd);
    }

    // Advance cursor
    const newNoteIndex = editorState.inputMode === 'replace'
      ? Math.min(cur.noteIndex + 1, measure.notes.length - 1)
      : measure.notes.length - 1;
    const newCursor = { ...cur, noteIndex: newNoteIndex };
    dispatch({ type: 'SET_CURSOR', cursor: newCursor });
  }, [editorState.cursor, editorState.selectedDuration, editorState.inputMode, scoreRef, executeCommand, dispatch]);

  const insertRest = useCallback(() => {
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const part = s.parts[cur.partIndex];
    if (!part) return;
    const measure = part.measures[cur.measureIndex];
    if (!measure) return;

    const rest = createRest(editorState.selectedDuration, cur.voice);

    if (editorState.inputMode === 'replace' && measure.notes[cur.noteIndex]) {
      const oldNote = measure.notes[cur.noteIndex];
      const cmd = new ReplaceNoteCommand(s, { ...cur }, oldNote.id, rest);
      executeCommand(cmd);
    } else {
      const cmd = new InsertRestCommand(s, { ...cur }, rest);
      executeCommand(cmd);
    }

    const newNoteIndex = editorState.inputMode === 'replace'
      ? Math.min(cur.noteIndex + 1, measure.notes.length - 1)
      : measure.notes.length - 1;
    const newCursor = { ...cur, noteIndex: newNoteIndex };
    dispatch({ type: 'SET_CURSOR', cursor: newCursor });
  }, [editorState.cursor, editorState.selectedDuration, editorState.inputMode, scoreRef, executeCommand, dispatch]);

  const deleteAtCursor = useCallback(() => {
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const part = s.parts[cur.partIndex];
    if (!part) return;
    const measure = part.measures[cur.measureIndex];
    if (!measure) return;

    const noteAtCursor = measure.notes[cur.noteIndex];
    if (!noteAtCursor) return;
    // Don't delete full-measure rests
    if (noteAtCursor.type === 'rest' && 'isFullMeasure' in noteAtCursor && noteAtCursor.isFullMeasure) return;

    const cmd = new DeleteNoteCommand(s, { ...cur }, noteAtCursor.id);
    executeCommand(cmd);

    // Adjust cursor
    const newNoteIndex = Math.min(cur.noteIndex, Math.max(0, measure.notes.length - 1));
    dispatch({ type: 'SET_CURSOR', cursor: { ...cur, noteIndex: newNoteIndex } });
  }, [editorState.cursor, scoreRef, executeCommand, dispatch]);

  const undo = useCallback(() => {
    commandHistory.undo();
    dispatch({ type: 'FORCE_UPDATE' });
  }, [commandHistory, dispatch]);

  const redo = useCallback(() => {
    commandHistory.redo();
    dispatch({ type: 'FORCE_UPDATE' });
  }, [commandHistory, dispatch]);

  const switchPart = useCallback((direction: 'prev' | 'next') => {
    const cur = editorState.cursor;
    const numParts = scoreRef.current.parts.length;
    let newPartIndex: number;
    if (direction === 'prev') {
      newPartIndex = Math.max(0, cur.partIndex - 1);
    } else {
      newPartIndex = Math.min(numParts - 1, cur.partIndex + 1);
    }
    if (newPartIndex !== cur.partIndex) {
      dispatch({ type: 'SET_CURSOR', cursor: { ...cur, partIndex: newPartIndex, measureIndex: 0, noteIndex: 0 } });
    }
  }, [editorState.cursor, scoreRef, dispatch]);

  const toggleInputMode = useCallback(() => {
    dispatch({
      type: 'SET_INPUT_MODE',
      mode: editorState.inputMode === 'insert' ? 'replace' : 'insert',
    });
  }, [editorState.inputMode, dispatch]);

  const cycleVoice = useCallback(() => {
    const cur = editorState.cursor;
    const newVoice = cur.voice === 1 ? 2 : 1;
    dispatch({ type: 'SET_CURSOR', cursor: { ...cur, voice: newVoice } });
  }, [editorState.cursor, dispatch]);

  const shortcutActions: ShortcutActions = useMemo(() => ({
    setDuration: (duration: NoteDuration) =>
      dispatch({ type: 'SET_DURATION', duration }),
    zoomIn: () => dispatch({ type: 'SET_ZOOM', zoom: editorState.zoom + 10 }),
    zoomOut: () => dispatch({ type: 'SET_ZOOM', zoom: editorState.zoom - 10 }),
    resetZoom: () => dispatch({ type: 'SET_ZOOM', zoom: 100 }),
    toggleDarkMode: () => dispatch({ type: 'TOGGLE_DARK_MODE' }),
    undo,
    redo,
    togglePlayback: () => dispatch({ type: 'TOGGLE_PLAYBACK' }),
    insertNote,
    insertRest,
    deleteAtCursor,
    moveCursor,
    switchPart,
    toggleInputMode,
    cycleVoice,
  }), [dispatch, editorState.zoom, undo, redo, insertNote, insertRest, deleteAtCursor, moveCursor, switchPart, toggleInputMode, cycleVoice]);

  useKeyboardShortcuts(shortcutActions);

  const menus = useMemo(() => [
    {
      label: 'File',
      items: [
        { label: 'New Score', action: newScore },
        { label: 'Open...', shortcut: 'Ctrl+O', action: triggerOpen },
        { label: 'Save as MusicXML', shortcut: 'Ctrl+S', action: saveAsXML },
        { separator: true, label: '' },
        { label: 'Export as MXL', action: exportAsMXL },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: undo, disabled: !commandHistory.canUndo },
        { label: 'Redo', shortcut: 'Ctrl+Y', action: redo, disabled: !commandHistory.canRedo },
        { separator: true, label: '' },
        { label: 'Cut', shortcut: 'Ctrl+X', disabled: true },
        { label: 'Copy', shortcut: 'Ctrl+C', disabled: true },
        { label: 'Paste', shortcut: 'Ctrl+V', disabled: true },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Zoom In', shortcut: 'Ctrl++', action: () => dispatch({ type: 'SET_ZOOM', zoom: editorState.zoom + 10 }) },
        { label: 'Zoom Out', shortcut: 'Ctrl+-', action: () => dispatch({ type: 'SET_ZOOM', zoom: editorState.zoom - 10 }) },
        { label: 'Reset Zoom', shortcut: 'Ctrl+0', action: () => dispatch({ type: 'SET_ZOOM', zoom: 100 }) },
        { separator: true, label: '' },
        {
          label: editorState.isDarkMode ? 'Light Mode' : 'Dark Mode',
          action: () => dispatch({ type: 'TOGGLE_DARK_MODE' }),
        },
      ],
    },
  ], [newScore, triggerOpen, saveAsXML, exportAsMXL, undo, redo, commandHistory.canUndo, commandHistory.canRedo, dispatch, editorState.zoom, editorState.isDarkMode]);

  return (
    <div className={`editor ${editorState.isDarkMode ? 'dark' : 'light'}`}>
      <header className="editor-header">
        <div className="editor-logo">Star Keys</div>
        <MenuBar menus={menus} />
      </header>

      <Toolbar />

      <div className="editor-main">
        <PartsPanel />

        <main className="editor-canvas">
          <ScoreRenderer
            musicXML={musicXML}
            zoom={editorState.zoom}
            darkMode={editorState.isDarkMode}
            onOsmdReady={onOsmdReady}
          />
        </main>

        <InspectorPanel />
      </div>

      <TransportBar />
    </div>
  );
}

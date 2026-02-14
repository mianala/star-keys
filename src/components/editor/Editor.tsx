import { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import type { NoteDuration, Step, CursorPosition, Note, NoteOrRest, ArticulationType } from '@/types/index.ts';
import { useEditor } from '@/stores/EditorContext.tsx';
import type { MoveCursorDirection } from '@/stores/EditorContext.tsx';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts.ts';
import type { ShortcutActions } from '@/hooks/useKeyboardShortcuts.ts';
import { useFileIO } from '@/hooks/useFileIO.ts';
import {
  createNote, createRest,
  InsertNoteCommand, InsertRestCommand, DeleteNoteCommand, ReplaceNoteCommand,
  ModifyNoteCommand, InsertMeasureCommand, DeleteMeasureCommand,
} from '@/core/score/index.ts';
import { AudioEngine } from '@/core/audio/index.ts';
import { parseMusicXML } from '@/core/musicxml/index.ts';
import { ScoreRenderer } from './ScoreRenderer.tsx';
import { Toolbar } from '@/components/toolbar/Toolbar.tsx';
import { PartsPanel } from '@/components/sidebar/PartsPanel.tsx';
import { InspectorPanel } from '@/components/sidebar/InspectorPanel.tsx';
import { TransportBar } from '@/components/playback/TransportBar.tsx';
import { MenuBar } from '@/components/menu/MenuBar.tsx';
import { NewScoreDialog } from '@/components/dialogs/NewScoreDialog.tsx';
import { TransposeDialog } from '@/components/dialogs/TransposeDialog.tsx';
import { KeyboardShortcutsDialog } from '@/components/dialogs/KeyboardShortcutsDialog.tsx';
import { MixerPanel } from '@/components/mixer/MixerPanel.tsx';
import { VirtualPiano } from '@/components/piano/VirtualPiano.tsx';

const STEPS_ORDER: Step[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

function stepUp(step: Step): { step: Step; octaveDelta: number } {
  const idx = STEPS_ORDER.indexOf(step);
  if (idx === STEPS_ORDER.length - 1) return { step: 'C', octaveDelta: 1 };
  return { step: STEPS_ORDER[idx + 1], octaveDelta: 0 };
}

function stepDown(step: Step): { step: Step; octaveDelta: number } {
  const idx = STEPS_ORDER.indexOf(step);
  if (idx === 0) return { step: 'B', octaveDelta: -1 };
  return { step: STEPS_ORDER[idx - 1], octaveDelta: 0 };
}

function syncOsmdCursor(osmd: OSMD | null, cursor: CursorPosition) {
  if (!osmd || !osmd.cursors || osmd.cursors.length === 0) return;
  const c = osmd.cursors[0];
  c.reset();

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

// Auto-save to IndexedDB
const DB_NAME = 'star-keys';
const STORE_NAME = 'autosave';

async function autoSaveToIndexedDB(musicXML: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(musicXML, 'current');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    req.onerror = () => reject(req.error);
  });
}

export function Editor() {
  const { editorState, dispatch, score, setScore, musicXML, commandHistory, executeCommand, mutateScore, scoreRef } = useEditor();
  const osmdRef = useRef<OSMD | null>(null);
  const audioEngineRef = useRef(new AudioEngine());
  const clipboardRef = useRef<NoteOrRest[]>([]);

  // Dialog / panel state
  const [showNewScoreDialog, setShowNewScoreDialog] = useState(false);
  const [showTransposeDialog, setShowTransposeDialog] = useState(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [showMixer, setShowMixer] = useState(false);
  const [showPiano, setShowPiano] = useState(false);

  // Drag & drop
  const [isDragOver, setIsDragOver] = useState(false);

  // Context menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Playback
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackTime, setPlaybackTime] = useState('0:00');
  const [playbackTotal, setPlaybackTotal] = useState('0:00');

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      autoSaveToIndexedDB(musicXML).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [musicXML]);

  // Audio engine playback listener
  useEffect(() => {
    const engine = audioEngineRef.current;
    const unsub = engine.subscribe({
      onStateChange: (state) => {
        if (state === 'idle') {
          dispatch({ type: 'STOP_PLAYBACK' });
          setPlaybackProgress(0);
          setPlaybackTime('0:00');
        }
      },
      onTimeUpdate: (current, total) => {
        setPlaybackProgress(total > 0 ? (current / total) * 100 : 0);
        setPlaybackTime(formatTime(current));
        setPlaybackTotal(formatTime(total));
      },
    });
    return unsub;
  }, [dispatch]);

  // Close context menu on click elsewhere
  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => setContextMenu(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [contextMenu]);

  const onOsmdReady = useCallback((osmd: OSMD) => {
    osmdRef.current = osmd;
  }, []);

  const { triggerOpen, saveAsXML, exportAsMXL, exportAsMidi, exportAsSVG, exportAsPNG, printScore } = useFileIO({
    setScore,
    musicXML,
    scoreTitle: score.meta.title,
    score,
    tempo: editorState.tempo,
  });

  // ─── Drag and drop ───────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xml') || file.name.endsWith('.musicxml') || file.name.endsWith('.mxl'))) {
      file.text().then((text) => {
        try {
          const parsed = parseMusicXML(text);
          setScore(parsed);
        } catch (err) {
          console.error('Failed to parse dropped file:', err);
        }
      });
    }
  }, [setScore]);

  // ─── Context menu ────────────────────────────────────────
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  // ─── Cursor navigation ──────────────────────────────────
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
      case 'measureLeft':
        if (cur.measureIndex > 0) {
          newCursor = { ...cur, measureIndex: cur.measureIndex - 1, noteIndex: 0 };
        } else return;
        break;
      case 'measureRight':
        if (cur.measureIndex < part.measures.length - 1) {
          newCursor = { ...cur, measureIndex: cur.measureIndex + 1, noteIndex: 0 };
        } else return;
        break;
      case 'home':
        newCursor = { ...cur, measureIndex: 0, noteIndex: 0 };
        break;
      case 'end': {
        const lastIdx = part.measures.length - 1;
        const lastMeasure = part.measures[lastIdx];
        newCursor = { ...cur, measureIndex: lastIdx, noteIndex: Math.max(0, lastMeasure.notes.length - 1) };
        break;
      }
    }

    dispatch({ type: 'SET_CURSOR', cursor: newCursor });
    syncOsmdCursor(osmdRef.current, newCursor);
  }, [editorState.cursor, scoreRef, dispatch]);

  // ─── Note Input ──────────────────────────────────────────
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

    const newNoteIndex = editorState.inputMode === 'replace'
      ? Math.min(cur.noteIndex + 1, measure.notes.length - 1)
      : measure.notes.length - 1;
    dispatch({ type: 'SET_CURSOR', cursor: { ...cur, noteIndex: newNoteIndex } });

    // Sound preview
    const engine = audioEngineRef.current;
    engine.ensureContext().then(() => {
      const gmProg = part.instrument.gmProgram;
      engine.loadInstrument(gmProg).then(() => {
        const midi = (4 + 1) * 12 + ({ C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[step] ?? 0);
        engine.playNotePreview(gmProg, midi);
      });
    });
  }, [editorState.cursor, editorState.selectedDuration, editorState.inputMode, scoreRef, executeCommand, dispatch]);

  const insertChordNote = useCallback((step: Step) => {
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const measure = s.parts[cur.partIndex]?.measures[cur.measureIndex];
    if (!measure) return;

    const note = createNote(
      { step, octave: 4 },
      editorState.selectedDuration,
      cur.voice,
    );
    note.isChord = true;

    const cmd = new InsertNoteCommand(s, { ...cur }, note);
    executeCommand(cmd);
  }, [editorState.cursor, editorState.selectedDuration, scoreRef, executeCommand]);

  const insertRest = useCallback(() => {
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const measure = s.parts[cur.partIndex]?.measures[cur.measureIndex];
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
    dispatch({ type: 'SET_CURSOR', cursor: { ...cur, noteIndex: newNoteIndex } });
  }, [editorState.cursor, editorState.selectedDuration, editorState.inputMode, scoreRef, executeCommand, dispatch]);

  const deleteAtCursor = useCallback(() => {
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const measure = s.parts[cur.partIndex]?.measures[cur.measureIndex];
    if (!measure) return;

    const noteAtCursor = measure.notes[cur.noteIndex];
    if (!noteAtCursor) return;
    if (noteAtCursor.type === 'rest' && 'isFullMeasure' in noteAtCursor && noteAtCursor.isFullMeasure) return;

    const cmd = new DeleteNoteCommand(s, { ...cur }, noteAtCursor.id);
    executeCommand(cmd);

    const newNoteIndex = Math.min(cur.noteIndex, Math.max(0, measure.notes.length - 1));
    dispatch({ type: 'SET_CURSOR', cursor: { ...cur, noteIndex: newNoteIndex } });
  }, [editorState.cursor, scoreRef, executeCommand, dispatch]);

  // ─── Note Modification ──────────────────────────────────
  const toggleDot = useCallback(() => {
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const measure = s.parts[cur.partIndex]?.measures[cur.measureIndex];
    if (!measure?.notes[cur.noteIndex]) return;

    const cmd = new ModifyNoteCommand(s, { ...cur }, cur.noteIndex, (n: NoteOrRest) => ({
      ...n,
      dots: n.dots > 0 ? 0 : 1,
    }));
    executeCommand(cmd);
  }, [editorState.cursor, scoreRef, executeCommand]);

  const sharpen = useCallback(() => {
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const note = s.parts[cur.partIndex]?.measures[cur.measureIndex]?.notes[cur.noteIndex];
    if (!note || note.type !== 'note') return;

    const cmd = new ModifyNoteCommand(s, { ...cur }, cur.noteIndex, (n: NoteOrRest) => {
      if (n.type !== 'note') return n;
      const nn = n as Note;
      const alter = (nn.pitch.alter ?? 0) + 1;
      return { ...nn, pitch: { ...nn.pitch, alter: Math.min(alter, 2) }, accidental: alter === 1 ? 'sharp' : alter === 2 ? 'double-sharp' : undefined };
    });
    executeCommand(cmd);
  }, [editorState.cursor, scoreRef, executeCommand]);

  const flatten = useCallback(() => {
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const note = s.parts[cur.partIndex]?.measures[cur.measureIndex]?.notes[cur.noteIndex];
    if (!note || note.type !== 'note') return;

    const cmd = new ModifyNoteCommand(s, { ...cur }, cur.noteIndex, (n: NoteOrRest) => {
      if (n.type !== 'note') return n;
      const nn = n as Note;
      const alter = (nn.pitch.alter ?? 0) - 1;
      return { ...nn, pitch: { ...nn.pitch, alter: Math.max(alter, -2) }, accidental: alter === -1 ? 'flat' : alter === -2 ? 'double-flat' : undefined };
    });
    executeCommand(cmd);
  }, [editorState.cursor, scoreRef, executeCommand]);

  const natural = useCallback(() => {
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const note = s.parts[cur.partIndex]?.measures[cur.measureIndex]?.notes[cur.noteIndex];
    if (!note || note.type !== 'note') return;

    const cmd = new ModifyNoteCommand(s, { ...cur }, cur.noteIndex, (n: NoteOrRest) => {
      if (n.type !== 'note') return n;
      const nn = n as Note;
      return { ...nn, pitch: { ...nn.pitch, alter: 0 }, accidental: 'natural' };
    });
    executeCommand(cmd);
  }, [editorState.cursor, scoreRef, executeCommand]);

  const toggleTie = useCallback(() => {
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const note = s.parts[cur.partIndex]?.measures[cur.measureIndex]?.notes[cur.noteIndex];
    if (!note || note.type !== 'note') return;

    const cmd = new ModifyNoteCommand(s, { ...cur }, cur.noteIndex, (n: NoteOrRest) => {
      if (n.type !== 'note') return n;
      const nn = n as Note;
      return { ...nn, tie: nn.tie ? undefined : 'start' };
    });
    executeCommand(cmd);
  }, [editorState.cursor, scoreRef, executeCommand]);

  const toggleArticulation = useCallback((art: ArticulationType) => {
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const note = s.parts[cur.partIndex]?.measures[cur.measureIndex]?.notes[cur.noteIndex];
    if (!note || note.type !== 'note') return;

    const cmd = new ModifyNoteCommand(s, { ...cur }, cur.noteIndex, (n: NoteOrRest) => {
      if (n.type !== 'note') return n;
      const nn = n as Note;
      const arts = nn.articulations ?? [];
      const has = arts.includes(art);
      return { ...nn, articulations: has ? arts.filter((a) => a !== art) : [...arts, art] };
    });
    executeCommand(cmd);
  }, [editorState.cursor, scoreRef, executeCommand]);

  const pitchUp = useCallback(() => {
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const note = s.parts[cur.partIndex]?.measures[cur.measureIndex]?.notes[cur.noteIndex];
    if (!note || note.type !== 'note') return;

    const cmd = new ModifyNoteCommand(s, { ...cur }, cur.noteIndex, (n: NoteOrRest) => {
      if (n.type !== 'note') return n;
      const nn = n as Note;
      const { step: newStep, octaveDelta } = stepUp(nn.pitch.step);
      return { ...nn, pitch: { ...nn.pitch, step: newStep, octave: nn.pitch.octave + octaveDelta } };
    });
    executeCommand(cmd);
  }, [editorState.cursor, scoreRef, executeCommand]);

  const pitchDown = useCallback(() => {
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const note = s.parts[cur.partIndex]?.measures[cur.measureIndex]?.notes[cur.noteIndex];
    if (!note || note.type !== 'note') return;

    const cmd = new ModifyNoteCommand(s, { ...cur }, cur.noteIndex, (n: NoteOrRest) => {
      if (n.type !== 'note') return n;
      const nn = n as Note;
      const { step: newStep, octaveDelta } = stepDown(nn.pitch.step);
      return { ...nn, pitch: { ...nn.pitch, step: newStep, octave: nn.pitch.octave + octaveDelta } };
    });
    executeCommand(cmd);
  }, [editorState.cursor, scoreRef, executeCommand]);

  const octaveUp = useCallback(() => {
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const note = s.parts[cur.partIndex]?.measures[cur.measureIndex]?.notes[cur.noteIndex];
    if (!note || note.type !== 'note') return;

    const cmd = new ModifyNoteCommand(s, { ...cur }, cur.noteIndex, (n: NoteOrRest) => {
      if (n.type !== 'note') return n;
      const nn = n as Note;
      return { ...nn, pitch: { ...nn.pitch, octave: Math.min(nn.pitch.octave + 1, 8) } };
    });
    executeCommand(cmd);
  }, [editorState.cursor, scoreRef, executeCommand]);

  const octaveDown = useCallback(() => {
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const note = s.parts[cur.partIndex]?.measures[cur.measureIndex]?.notes[cur.noteIndex];
    if (!note || note.type !== 'note') return;

    const cmd = new ModifyNoteCommand(s, { ...cur }, cur.noteIndex, (n: NoteOrRest) => {
      if (n.type !== 'note') return n;
      const nn = n as Note;
      return { ...nn, pitch: { ...nn.pitch, octave: Math.max(nn.pitch.octave - 1, 0) } };
    });
    executeCommand(cmd);
  }, [editorState.cursor, scoreRef, executeCommand]);

  // ─── Measure Operations ──────────────────────────────────
  const insertMeasure = useCallback(() => {
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const cmd = new InsertMeasureCommand(s, cur.partIndex, cur.measureIndex + 1);
    executeCommand(cmd);
  }, [editorState.cursor, scoreRef, executeCommand]);

  const deleteMeasure = useCallback(() => {
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const part = s.parts[cur.partIndex];
    if (!part || part.measures.length <= 1) return;
    const cmd = new DeleteMeasureCommand(s, cur.measureIndex);
    executeCommand(cmd);
    const newMeasureIndex = Math.min(cur.measureIndex, part.measures.length - 1);
    dispatch({ type: 'SET_CURSOR', cursor: { ...cur, measureIndex: newMeasureIndex, noteIndex: 0 } });
  }, [editorState.cursor, scoreRef, executeCommand, dispatch]);

  // ─── Clipboard ───────────────────────────────────────────
  const copy = useCallback(() => {
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const ids = editorState.selectedNoteIds;
    if (ids.length > 0) {
      const notes: NoteOrRest[] = [];
      for (const part of s.parts) {
        for (const measure of part.measures) {
          for (const note of measure.notes) {
            if (ids.includes(note.id)) {
              notes.push(structuredClone(note));
            }
          }
        }
      }
      clipboardRef.current = notes;
    } else {
      const note = s.parts[cur.partIndex]?.measures[cur.measureIndex]?.notes[cur.noteIndex];
      if (note) clipboardRef.current = [structuredClone(note)];
    }
  }, [editorState.cursor, editorState.selectedNoteIds, scoreRef]);

  const cut = useCallback(() => {
    copy();
    if (editorState.selectedNoteIds.length > 0) {
      const ids = editorState.selectedNoteIds;
      mutateScore((s) => {
        for (const part of s.parts) {
          for (const measure of part.measures) {
            measure.notes = measure.notes.filter((n) => !ids.includes(n.id));
          }
        }
      });
      dispatch({ type: 'CLEAR_SELECTION' });
    } else {
      deleteAtCursor();
    }
  }, [copy, editorState.selectedNoteIds, mutateScore, dispatch, deleteAtCursor]);

  const paste = useCallback(() => {
    const notes = clipboardRef.current;
    if (notes.length === 0) return;
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const measure = s.parts[cur.partIndex]?.measures[cur.measureIndex];
    if (!measure) return;

    for (const note of notes) {
      const clone = structuredClone(note);
      clone.id = `n${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      measure.notes.splice(cur.noteIndex + 1, 0, clone);
    }
    dispatch({ type: 'FORCE_UPDATE' });
  }, [editorState.cursor, scoreRef, dispatch]);

  // ─── Selection ───────────────────────────────────────────
  const selectAll = useCallback(() => {
    const s = scoreRef.current;
    const cur = editorState.cursor;
    const part = s.parts[cur.partIndex];
    if (!part) return;
    const ids: string[] = [];
    for (const measure of part.measures) {
      for (const note of measure.notes) {
        ids.push(note.id);
      }
    }
    dispatch({ type: 'SELECT_NOTES', noteIds: ids });
  }, [editorState.cursor, scoreRef, dispatch]);

  const escape = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
    setContextMenu(null);
  }, [dispatch]);

  // ─── Transpose ───────────────────────────────────────────
  const handleTranspose = useCallback((semitones: number, scope: 'selection' | 'part' | 'all') => {
    const STEP_MIDI: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const MIDI_STEP: [Step, number][] = [['C', 0], ['C', 1], ['D', 0], ['D', 1], ['E', 0], ['F', 0], ['F', 1], ['G', 0], ['G', 1], ['A', 0], ['A', 1], ['B', 0]];

    const transposeNote = (note: Note) => {
      const midi = (note.pitch.octave + 1) * 12 + (STEP_MIDI[note.pitch.step] ?? 0) + (note.pitch.alter ?? 0);
      const newMidi = Math.max(0, Math.min(127, midi + semitones));
      const octave = Math.floor(newMidi / 12) - 1;
      const pc = newMidi % 12;
      const [step, alter] = MIDI_STEP[pc] ?? ['C', 0];
      note.pitch = { step, octave, alter: alter || undefined };
      note.accidental = alter === 1 ? 'sharp' : undefined;
    };

    const partIndex = editorState.cursor.partIndex;
    const selectedIds = editorState.selectedNoteIds;

    mutateScore((s) => {
      const parts = scope === 'all' ? s.parts : scope === 'part' ? [s.parts[partIndex]] : [];

      if (scope === 'selection' && selectedIds.length > 0) {
        for (const part of s.parts) {
          for (const measure of part.measures) {
            for (const note of measure.notes) {
              if (note.type === 'note' && selectedIds.includes(note.id)) {
                transposeNote(note);
              }
            }
          }
        }
      } else {
        for (const part of parts) {
          if (!part) continue;
          for (const measure of part.measures) {
            for (const note of measure.notes) {
              if (note.type === 'note') transposeNote(note);
            }
          }
        }
      }
    });
  }, [editorState.cursor.partIndex, editorState.selectedNoteIds, mutateScore]);

  // ─── Undo / Redo ─────────────────────────────────────────
  const undo = useCallback(() => {
    commandHistory.undo();
    dispatch({ type: 'FORCE_UPDATE' });
  }, [commandHistory, dispatch]);

  const redo = useCallback(() => {
    commandHistory.redo();
    dispatch({ type: 'FORCE_UPDATE' });
  }, [commandHistory, dispatch]);

  // ─── Parts ───────────────────────────────────────────────
  const switchPart = useCallback((direction: 'prev' | 'next') => {
    const cur = editorState.cursor;
    const numParts = scoreRef.current.parts.length;
    const newPartIndex = direction === 'prev'
      ? Math.max(0, cur.partIndex - 1)
      : Math.min(numParts - 1, cur.partIndex + 1);
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
    dispatch({ type: 'SET_CURSOR', cursor: { ...cur, voice: cur.voice === 1 ? 2 : 1 } });
  }, [editorState.cursor, dispatch]);

  // ─── Playback ────────────────────────────────────────────
  const togglePlayback = useCallback(async () => {
    const engine = audioEngineRef.current;
    if (engine.state === 'playing') {
      engine.pause();
      dispatch({ type: 'TOGGLE_PLAYBACK' });
    } else {
      dispatch({ type: 'TOGGLE_PLAYBACK' });
      await engine.play(scoreRef.current, editorState.tempo, editorState.isMetronomeOn);
    }
  }, [scoreRef, editorState.tempo, editorState.isMetronomeOn, dispatch]);

  const stopPlayback = useCallback(() => {
    audioEngineRef.current.stop();
    dispatch({ type: 'STOP_PLAYBACK' });
  }, [dispatch]);

  // ─── Piano input ─────────────────────────────────────────
  const handlePianoNoteDown = useCallback(
    (...args: [Step, number]) => insertNote(args[0]),
    [insertNote],
  );

  // ─── Keyboard shortcuts ──────────────────────────────────
  const shortcutActions: ShortcutActions = useMemo(() => ({
    setDuration: (duration: NoteDuration) => dispatch({ type: 'SET_DURATION', duration }),
    zoomIn: () => dispatch({ type: 'SET_ZOOM', zoom: editorState.zoom + 10 }),
    zoomOut: () => dispatch({ type: 'SET_ZOOM', zoom: editorState.zoom - 10 }),
    resetZoom: () => dispatch({ type: 'SET_ZOOM', zoom: 100 }),
    toggleDarkMode: () => dispatch({ type: 'TOGGLE_DARK_MODE' }),
    undo,
    redo,
    togglePlayback,
    insertNote,
    insertChordNote,
    insertRest,
    deleteAtCursor,
    moveCursor,
    switchPart,
    toggleInputMode,
    cycleVoice,
    toggleDot,
    sharpen,
    flatten,
    toggleTie,
    pitchUp,
    pitchDown,
    octaveUp,
    octaveDown,
    insertMeasure,
    deleteMeasure,
    selectAll,
    escape,
    copy,
    cut,
    paste,
  }), [dispatch, editorState.zoom, undo, redo, togglePlayback,
    insertNote, insertChordNote, insertRest, deleteAtCursor, moveCursor, switchPart,
    toggleInputMode, cycleVoice, toggleDot, sharpen, flatten, toggleTie,
    pitchUp, pitchDown, octaveUp, octaveDown, insertMeasure, deleteMeasure,
    selectAll, escape, copy, cut, paste]);

  useKeyboardShortcuts(shortcutActions);

  // ─── Menus ───────────────────────────────────────────────
  const menus = useMemo(() => [
    {
      label: 'File',
      items: [
        { label: 'New Score...', action: () => setShowNewScoreDialog(true) },
        { label: 'Open...', shortcut: 'Ctrl+O', action: triggerOpen },
        { label: 'Save as MusicXML', shortcut: 'Ctrl+S', action: saveAsXML },
        { separator: true, label: '' },
        { label: 'Export as MXL', action: exportAsMXL },
        { label: 'Export as MIDI', action: exportAsMidi },
        { label: 'Export as SVG', action: exportAsSVG },
        { label: 'Export as PNG', action: exportAsPNG },
        { separator: true, label: '' },
        { label: 'Print...', shortcut: 'Ctrl+P', action: printScore },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: undo, disabled: !commandHistory.canUndo },
        { label: 'Redo', shortcut: 'Ctrl+Y', action: redo, disabled: !commandHistory.canRedo },
        { separator: true, label: '' },
        { label: 'Cut', shortcut: 'Ctrl+X', action: cut },
        { label: 'Copy', shortcut: 'Ctrl+C', action: copy },
        { label: 'Paste', shortcut: 'Ctrl+V', action: paste },
        { separator: true, label: '' },
        { label: 'Select All', shortcut: 'Ctrl+A', action: selectAll },
        { separator: true, label: '' },
        { label: 'Insert Measure', shortcut: 'Ctrl+Shift+M', action: insertMeasure },
        { label: 'Delete Measure', shortcut: 'Ctrl+Shift+Del', action: deleteMeasure },
        { separator: true, label: '' },
        { label: 'Transpose...', action: () => setShowTransposeDialog(true) },
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
        { separator: true, label: '' },
        { label: showPiano ? 'Hide Piano' : 'Show Piano', action: () => setShowPiano(!showPiano) },
        { label: showMixer ? 'Hide Mixer' : 'Show Mixer', action: () => setShowMixer(!showMixer) },
      ],
    },
    {
      label: 'Help',
      items: [
        { label: 'Keyboard Shortcuts...', shortcut: '?', action: () => setShowShortcutsDialog(true) },
      ],
    },
  ], [triggerOpen, saveAsXML, exportAsMXL, exportAsMidi, exportAsSVG, exportAsPNG, printScore,
    undo, redo, commandHistory.canUndo, commandHistory.canRedo,
    cut, copy, paste, selectAll, insertMeasure, deleteMeasure, dispatch, editorState.zoom,
    editorState.isDarkMode, showPiano, showMixer]);

  return (
    <div
      className={`editor ${editorState.isDarkMode ? 'dark' : 'light'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <header className="editor-header">
        <div className="editor-logo">Star Keys</div>
        <MenuBar menus={menus} />
      </header>

      <Toolbar
        onArticulation={toggleArticulation}
        onDot={toggleDot}
        onSharp={sharpen}
        onFlat={flatten}
        onNatural={natural}
        onTie={toggleTie}
      />

      <div className="editor-main">
        <PartsPanel />

        <main
          className={`editor-canvas ${isDragOver ? 'drag-over' : ''}`}
          onContextMenu={handleContextMenu}
        >
          <ScoreRenderer
            musicXML={musicXML}
            zoom={editorState.zoom}
            darkMode={editorState.isDarkMode}
            onOsmdReady={onOsmdReady}
          />
          {isDragOver && (
            <div className="drop-overlay">Drop MusicXML file to open</div>
          )}
        </main>

        <InspectorPanel />
      </div>

      {showPiano && (
        <VirtualPiano
          onNoteDown={handlePianoNoteDown}
        />
      )}

      <TransportBar
        onPlay={togglePlayback}
        onStop={stopPlayback}
        progress={playbackProgress}
        currentTime={playbackTime}
        totalTime={playbackTotal}
      />

      {/* Context menu */}
      {contextMenu && (
        <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>
          <button className="context-menu-item" onClick={() => { cut(); setContextMenu(null); }}>Cut</button>
          <button className="context-menu-item" onClick={() => { copy(); setContextMenu(null); }}>Copy</button>
          <button className="context-menu-item" onClick={() => { paste(); setContextMenu(null); }}>Paste</button>
          <div className="context-menu-separator" />
          <button className="context-menu-item" onClick={() => { deleteAtCursor(); setContextMenu(null); }}>Delete</button>
          <div className="context-menu-separator" />
          <button className="context-menu-item" onClick={() => { insertMeasure(); setContextMenu(null); }}>Insert Measure After</button>
          <button className="context-menu-item" onClick={() => { deleteMeasure(); setContextMenu(null); }}
            disabled={score.parts[editorState.cursor.partIndex]?.measures.length <= 1}
          >Delete Measure</button>
        </div>
      )}

      {/* Mixer panel */}
      {showMixer && (
        <MixerPanel onClose={() => setShowMixer(false)} />
      )}

      {/* Dialogs */}
      <NewScoreDialog
        isOpen={showNewScoreDialog}
        onClose={() => setShowNewScoreDialog(false)}
        onCreateScore={setScore}
      />

      <TransposeDialog
        isOpen={showTransposeDialog}
        onClose={() => setShowTransposeDialog(false)}
        onTranspose={handleTranspose}
      />

      <KeyboardShortcutsDialog
        isOpen={showShortcutsDialog}
        onClose={() => setShowShortcutsDialog(false)}
      />
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

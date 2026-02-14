# Phase 2 — Note Input & Basic Editing

Core editing capability: add, modify, and delete notes.

**Goal:** Users can input and edit notes using keyboard, mouse, and basic toolbar controls.

**Depends on:** Phase 1 (Foundation)

---

## Tasks

### 2.1 Cursor System

- [ ] Implement editor cursor:
  - Blinking vertical line at current position
  - Positioned between/on notes in the score
  - Tracks: part index, measure index, beat position, voice
- [ ] Cursor navigation:
  - Left/Right arrow: move to prev/next note
  - Ctrl+Left/Right: move to prev/next measure
  - Home/End: beginning/end of score
  - Ctrl+Shift+Up/Down: move to prev/next staff
- [ ] Cursor renders as an overlay on the SVG score
- [ ] Auto-scroll: canvas scrolls to keep cursor visible

### 2.2 Note Input (Keyboard)

- [ ] Duration selection via number keys (1=whole → 7=64th)
- [ ] Note input via A–G keys:
  - Determine octave from cursor position on staff
  - Create note in score model at cursor position
  - Re-render score
  - Advance cursor
- [ ] Rest input via `0` key
- [ ] Dotted notes via `.` key
- [ ] Accidentals:
  - `+`/`=` to sharpen
  - `-` to flatten
  - Applied before or after note input
- [ ] Tie via `T` key
- [ ] Chord input via Shift+A–G (add note to existing beat)
- [ ] Voice switching via `V` key
- [ ] Insert vs Replace mode toggle via `I` key

### 2.3 Note Input (Mouse)

- [ ] Click-to-place notes on the staff:
  - Hit-test click position against staff lines
  - Determine pitch from vertical position
  - Place note at nearest rhythmic position
- [ ] Click on existing note to select it
- [ ] Click+drag to select a range
- [ ] Right-click context menu (delete, properties)

### 2.4 Selection System

- [ ] Single note selection (click or navigate to)
- [ ] Range selection (Shift+Arrow or click+drag)
- [ ] Visual highlight for selected notes (blue tint overlay)
- [ ] Select all (Ctrl+A)
- [ ] Clear selection (Escape)
- [ ] Cut/Copy/Paste (Ctrl+X/C/V):
  - Serialize selected notes
  - Paste at cursor position
  - Handle cross-measure paste

### 2.5 Note Editing

- [ ] Delete selected note(s) (Delete/Backspace key)
- [ ] Change duration of selected note (press duration key)
- [ ] Change pitch of selected note (Up/Down arrows for diatonic, +/- for chromatic)
- [ ] Octave shift (Shift+Up/Down)
- [ ] Enharmonic toggle (e.g., F# ↔ Gb)
- [ ] Add/remove dot on selected note
- [ ] Add/remove tie on selected note

### 2.6 Measure Operations

- [ ] Insert empty measure (at cursor position)
- [ ] Delete measure (with confirmation for non-empty)
- [ ] Change time signature at measure
- [ ] Change key signature at measure
- [ ] Change clef at measure
- [ ] Add/change barline type

### 2.7 Notes Toolbar Palette

- [ ] Build Notes palette UI:
  - Duration buttons (whole → 64th) with visual icons
  - Rest toggle button
  - Dot / double-dot buttons
  - Accidental buttons (sharp, flat, natural, double sharp, double flat)
  - Tie button
  - Tuplet button (opens config)
  - Voice selector (1/2)
  - Insert/Replace mode indicator
- [ ] Toolbar state syncs with keyboard input (pressing `3` highlights quarter note button)
- [ ] Toolbar buttons trigger same actions as keyboard shortcuts

### 2.8 Undo/Redo Integration

- [ ] Wrap all edit operations in Commands
- [ ] Commands:
  - `InsertNoteCommand`
  - `DeleteNoteCommand`
  - `ModifyNoteCommand` (pitch, duration, accidental, etc.)
  - `InsertMeasureCommand`
  - `DeleteMeasureCommand`
  - `ChangeAttributesCommand` (clef, key, time)
- [ ] Ctrl+Z / Ctrl+Y triggers undo/redo
- [ ] Undo/redo buttons in toolbar

### 2.9 Score Re-rendering Pipeline

- [ ] After each edit:
  1. Apply command to ScoreModel
  2. Serialize ScoreModel to MusicXML
  3. Pass MusicXML to OSMD for re-render
  4. Update cursor position
- [ ] Optimize: batch rapid edits, debounce re-render
- [ ] Consider partial re-rendering (only changed measures) if full re-render is too slow

---

## Acceptance Criteria

- [ ] Can navigate through a score with arrow keys
- [ ] Can input notes using keyboard (A–G) with selectable durations
- [ ] Can input notes using mouse click on staff
- [ ] Can add rests, dotted notes, accidentals, ties
- [ ] Can select, delete, and modify existing notes
- [ ] Can insert and delete measures
- [ ] Can change clef, key, and time signature
- [ ] Undo/redo works for all operations
- [ ] Copy/paste works for notes and selections
- [ ] Toolbar reflects current state and triggers actions

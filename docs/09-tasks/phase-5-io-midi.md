# Phase 5 — File I/O & MIDI

Import/export capabilities and MIDI device integration.

**Goal:** Full file interoperability and physical MIDI keyboard support.

**Depends on:** Phase 1 (MusicXML), Phase 3 (Playback)

---

## Tasks

### 5.1 File Open / Save

- [ ] Install `jszip` (if not already) for .mxl handling
- [ ] "Open" dialog:
  - File picker for .xml, .mxl, .mid files
  - Drag-and-drop support on the editor
  - Read file, detect format, route to appropriate parser
- [ ] "Save" (MusicXML):
  - Serialize ScoreModel → MusicXML
  - If File System Access API available: save to same file
  - Otherwise: trigger download
- [ ] "Save As":
  - Choose format (MusicXML .xml, .mxl, MIDI .mid)
  - Choose filename
  - Trigger download
- [ ] Auto-save to IndexedDB every 30 seconds
- [ ] Recent files list (stored in localStorage)

### 5.2 MIDI File Import

- [ ] Install `midi-player-js` or write custom MIDI parser
- [ ] Parse MIDI file:
  - Detect format (0 or 1)
  - Extract tracks, tempo, time signature, key signature
  - Group note-on/note-off pairs
- [ ] Convert to ScoreModel:
  - Quantize note timings to nearest standard duration
  - Spell pitches using key context (tonal library)
  - Assign beaming based on time signature
  - Map program changes to instrument names
  - Map velocity to approximate dynamics
- [ ] Import settings dialog:
  - Quantization grid selection
  - Key signature (auto-detect or manual)
  - Whether to merge tracks
- [ ] Show import preview before committing

### 5.3 MIDI File Export

- [ ] Implement MIDI file writer:
  - Create Format 1 MIDI file
  - Write header chunk (PPQ = 480)
  - Write tempo track (time sig, key sig, tempo meta events)
  - Write one track per part (program change + note events)
  - Resolve repeats (expand to linear sequence)
  - Map dynamics to velocity
- [ ] Export as .mid file download
- [ ] MIDI export settings:
  - PPQ (default 480)
  - Whether to expand repeats
  - Velocity curve

### 5.4 PDF Export

- [ ] Install `jspdf` and `svg2pdf.js`
- [ ] Implement PDF generation:
  - Render score in page view mode (OSMD multi-page)
  - Extract SVG per page
  - Create jsPDF document with correct page size
  - Embed each SVG as a PDF page
  - Add title, composer, page numbers
- [ ] Export settings dialog (see `07-print-export/pdf-export.md`)
- [ ] Part extraction: generate PDF for individual parts
- [ ] Show rendering progress for multi-page scores

### 5.5 PNG / SVG Export

- [ ] SVG export:
  - Clone OSMD SVG output
  - Inline all CSS styles
  - Serialize to standalone SVG file
  - Offer as download
- [ ] PNG export:
  - Render SVG to canvas (at configurable DPI)
  - canvas.toBlob('image/png')
  - Offer as download
- [ ] Export selection only (if range is selected)

### 5.6 MIDI Device Connection

- [ ] Install `webmidi`
- [ ] Create `MidiDeviceManager`:
  - Request Web MIDI access on user action
  - Enumerate input and output devices
  - Listen for device connect/disconnect
  - Selected input/output stored in preferences
- [ ] MIDI Settings UI:
  - Input device dropdown
  - Output device dropdown
  - Connection status indicator
  - Test button (play a note)
- [ ] Handle browsers without Web MIDI support (show message)

### 5.7 MIDI Step Entry

- [ ] Wire MIDI input to note entry pipeline:
  - `noteon` → create note at cursor with selected duration
  - Handle chord detection (simultaneous keys)
  - Configurable velocity sensitivity
- [ ] "Write while playing" mode (hear without writing)
- [ ] Visual feedback: virtual piano highlights pressed keys

### 5.8 MIDI Live Recording

- [ ] Implement recording mode:
  - Record button in transport bar (or `R` key)
  - Metronome count-in (configurable: 1 or 2 measures)
  - Record note events with timestamps
  - Stop recording
  - Quantize recorded notes (see `06-recording/midi-recording.md`)
  - Insert into score
- [ ] Quantization settings (grid selection)
- [ ] Preview recorded result before committing (undo if unwanted)

### 5.9 MIDI Output (Playback to Device)

- [ ] Route playback events to selected MIDI output device
- [ ] Send program change at start of playback (per part)
- [ ] Send note-on/note-off events in real time
- [ ] Useful for driving external synths, DAWs, or MIDI speakers

---

## Acceptance Criteria

- [ ] Can open .xml, .mxl, and .mid files (via dialog or drag-and-drop)
- [ ] Can save score as .xml or .mxl
- [ ] Can export as PDF with correct layout and page numbers
- [ ] Can export as PNG (configurable DPI) and SVG
- [ ] Can export as MIDI .mid file
- [ ] MIDI import produces reasonable notation from a MIDI file
- [ ] Physical MIDI keyboard connects and notes appear in score (step entry)
- [ ] MIDI live recording captures and quantizes a performance
- [ ] Auto-save works (recover on browser crash/close)

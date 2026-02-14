# Phase 6 — Polish & Advanced Features

UI refinements, advanced notation, and quality-of-life features.

**Goal:** Production-quality editor with professional features.

**Depends on:** Phases 1–5

---

## Tasks

### 6.1 Virtual Piano

- [ ] Build `<VirtualPiano>` component:
  - 2-octave keyboard rendered as interactive keys
  - Scrollable octave range (◀/▶ buttons or swipe)
  - Click/tap to input notes (same pipeline as keyboard/MIDI)
  - Highlight currently playing notes during playback
  - Show note names on keys (toggleable)
- [ ] Context switching:
  - Show piano for pitched instruments
  - Show drum pad grid for percussion parts
  - Show fretboard for tab parts
- [ ] Collapsible: can hide to gain more score canvas space

### 6.2 Inspector Panel

- [ ] Build `<InspectorPanel>` component:
  - Displays properties of selected element
  - Note: pitch, duration, accidental, dots, voice, articulations
  - Measure: number, key, time, clef, barline
  - Score: title, composer, parts count
- [ ] Editable fields (change pitch, duration, etc. via inspector)
- [ ] Collapsible panel

### 6.3 Parts Management

- [ ] Full parts panel:
  - List all parts with instrument name and icon
  - Drag to reorder (changes score order)
  - Show/hide individual parts
  - Add instrument (opens instrument picker)
  - Remove instrument (with confirmation)
  - Change instrument (keeps notes, changes sound and transposition)
  - Rename part
- [ ] Instrument picker dialog:
  - Searchable list of all instruments
  - Organized by category (strings, woodwinds, brass, etc.)
  - Preview sound on hover/click
- [ ] Score templates (pre-configured ensembles)

### 6.4 Keyboard Shortcut Customization

- [ ] Build keyboard shortcut settings page:
  - Searchable list of all actions
  - Current shortcut displayed
  - Click to record new shortcut
  - Conflict detection and warning
  - Reset to defaults
- [ ] Store custom shortcuts in localStorage
- [ ] Shortcut reference panel (press `?` to show all shortcuts)

### 6.5 Transpose Dialog

- [ ] Build `<TransposeDialog>`:
  - Transpose by interval (up/down, minor/major/perfect/augmented/diminished)
  - Transpose by key (from key → to key)
  - Transpose chromatically (by semitones)
  - Apply to: selection, entire part, or all parts
- [ ] Use `tonal` library for interval and transposition calculations
- [ ] Handle transposing instruments correctly

### 6.6 Print Preview

- [ ] Build print preview mode:
  - Shows score as it will appear on paper
  - Page navigation (page 1 of N)
  - Zoom to fit page / actual size
  - Edit layout settings (margins, staff size, etc.) with live preview
- [ ] Native print dialog integration (Ctrl+P → browser print → PDF)

### 6.7 Beaming & Stem Direction

- [ ] Automatic beam grouping based on time signature
- [ ] Manual beam break/join:
  - Select notes, apply "break beam" or "join beam"
- [ ] Automatic stem direction (above middle → down, below → up)
- [ ] Manual stem direction override

### 6.8 Music Font Selection

- [ ] Bundle SMuFL fonts (Bravura, Petaluma, Leland)
- [ ] Font selector in Layout palette / Settings
- [ ] Score re-renders with selected font
- [ ] Store font preference per score

### 6.9 Accessibility & Performance

- [ ] ARIA labels on all toolbar buttons and interactive elements
- [ ] Keyboard navigation (Tab order) through all controls
- [ ] Screen reader announcements for score navigation
- [ ] Focus management (focus returns to canvas after toolbar interaction)
- [ ] Performance profiling:
  - Measure render time for large scores
  - Optimize hot paths (debounce, requestAnimationFrame, etc.)
  - Consider virtualization for very long scores

### 6.10 Error Handling & Edge Cases

- [ ] Graceful handling of:
  - Corrupt MusicXML files
  - Unsupported MusicXML features (skip gracefully)
  - Audio context errors (browser restrictions)
  - MIDI device disconnection during recording
  - Network errors during soundfont loading
- [ ] User-friendly error messages (toast notifications)
- [ ] Console warnings for developers (non-critical issues)

### 6.11 Settings Page

- [ ] Build Settings dialog/page:
  - **General:** language (future), auto-save interval, default note duration
  - **Audio:** default instrument, reverb amount, note preview on input
  - **MIDI:** input/output device, velocity sensitivity, quantization grid
  - **Display:** dark mode, default zoom, show note names, colored noteheads
  - **Shortcuts:** keyboard shortcut customization (link to 6.4)
- [ ] Store all settings in localStorage
- [ ] Export/import settings (JSON)

---

## Acceptance Criteria

- [ ] Virtual piano works for note input and shows playback
- [ ] Inspector panel shows and allows editing of selected element properties
- [ ] Parts can be added, removed, reordered, and instrument-swapped
- [ ] Keyboard shortcuts are fully customizable
- [ ] Transpose feature works for selection, part, and full score
- [ ] Print preview shows accurate page layout
- [ ] Multiple music fonts are available
- [ ] Application is accessible via keyboard and screen reader
- [ ] Large scores (100+ measures, 10+ parts) render without major lag
- [ ] Error states are handled gracefully with user-friendly messages

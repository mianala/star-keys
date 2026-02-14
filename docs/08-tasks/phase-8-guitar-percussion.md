# Phase 8 — Guitar Tablature & Percussion (Post-MVP)

Specialized notation for guitar and percussion instruments.

**Goal:** Full guitar tab editing and percussion notation support.

**Depends on:** Phase 2 (Note Input), Phase 4 (Expressive Notation)

---

## Tasks

### 8.1 Guitar Tablature Rendering

- [ ] Render tab staff (6-line by default, configurable)
- [ ] Display fret numbers on strings
- [ ] Tab staff linked to standard notation staff (optional, can be tab-only)
- [ ] Custom tuning support (drop D, open G, etc.)
- [ ] Capo display (adjust fret numbers)

### 8.2 Guitar Tab Input

- [ ] Virtual fretboard component:
  - Shows all strings and frets
  - Click on intersection to enter fret number
  - Displays current tuning
  - Highlights active notes
- [ ] Keyboard input for tab:
  - Number keys (0–24) for fret number
  - Up/Down arrows to change strings
  - String keys configurable
- [ ] MIDI keyboard input → auto-assign to strings based on pitch

### 8.3 Guitar-Specific Notation

- [ ] Bends:
  - Full bend (whole step), half bend, quarter bend
  - Pre-bend, pre-bend and release
  - Visual: curved arrow with interval label
- [ ] Slides:
  - Slide in (from below/above)
  - Slide out (to below/above)
  - Slide between two notes
  - Visual: diagonal line
- [ ] Hammer-on / pull-off:
  - Displayed as slur between tab numbers
  - Labeled "H" or "P" (optional)
- [ ] Harmonics:
  - Natural harmonics (diamond notehead, fret number)
  - Artificial harmonics
- [ ] Palm mute range (P.M. with dashes)
- [ ] Let ring range (let ring with dashes)
- [ ] String muting (X on tab)
- [ ] Up/down stroke indicators

### 8.4 Chord Diagrams

- [ ] Chord diagram component:
  - Grid showing strings × frets
  - Dots for finger positions
  - X for muted strings, O for open strings
  - Barre indicator
  - Finger numbers (optional)
- [ ] Display above the staff at chord positions
- [ ] Chord diagram library (common chords pre-built)
- [ ] Custom chord diagram editor

### 8.5 Percussion Staff

- [ ] Render percussion staff (standard 5-line or 1-line)
- [ ] Different noteheads for different instruments:
  - X for cymbals/hi-hat
  - Normal for drums
  - Diamond for cowbell, etc.
- [ ] Standard GM drum map for note placement on staff

### 8.6 Percussion Input

- [ ] Virtual drum pad component:
  - Grid of labeled pads
  - Each pad = one percussion instrument
  - Click/tap to enter percussion note
  - Customizable pad layout
- [ ] Keyboard shortcuts for percussion:
  - Assign letter keys to specific drums
  - Display mapping in the drum pad UI
- [ ] MIDI keyboard/pad input → map to percussion instruments

### 8.7 Custom Percussion Maps

- [ ] Allow users to define custom percussion instruments:
  - Name, abbreviation
  - Notehead shape
  - Position on staff (line/space)
  - Sound (MIDI note on channel 10)
  - Keyboard shortcut for input
- [ ] Save custom maps for reuse
- [ ] Import/export percussion maps

### 8.8 Guitar Tab Playback

- [ ] Interpret tab-specific notations for playback:
  - Bends: pitch shift (portamento)
  - Slides: glissando between pitches
  - Harmonics: play at harmonic frequency
  - Palm mute: staccato + dampened tone
  - Let ring: allow natural sustain

---

## Acceptance Criteria

- [ ] Guitar tablature renders correctly with fret numbers
- [ ] Tab input works via virtual fretboard, keyboard, and MIDI
- [ ] Custom tuning and capo are reflected in tab display
- [ ] Guitar-specific notation (bends, slides, harmonics, etc.) works
- [ ] Chord diagrams display above the staff
- [ ] Percussion staff renders with correct noteheads
- [ ] Drum pad input works for entering percussion notes
- [ ] Tab and percussion playback sounds correct

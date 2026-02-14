# Phase 4 — Expressive Notation & Text

Articulations, dynamics, ornaments, lyrics, and chord symbols.

**Goal:** Full expressive notation capability comparable to a standard notation editor.

**Depends on:** Phase 2 (Note Input)

---

## Tasks

### 4.1 Articulations Palette & Input

- [ ] Build Articulations palette UI:
  - Staccato, staccatissimo, accent, marcato, tenuto, fermata
  - Slur (start/end)
  - Grace note (before selected note)
  - Up bow / down bow
- [ ] Apply articulation to selected note(s)
- [ ] Toggle articulations (click again to remove)
- [ ] Keyboard shortcuts for common articulations:
  - `Shift+S` staccato
  - `Shift+>` accent
  - etc.
- [ ] Articulations persist in score model and MusicXML

### 4.2 Dynamics Input

- [ ] Build Dynamics palette UI:
  - Dynamic levels: ppp, pp, p, mp, mf, f, ff, fff
  - Special: sfz, fp, rfz
  - Crescendo hairpin
  - Diminuendo hairpin
  - Pedal markings (on/off)
- [ ] Place dynamics at selected note position
- [ ] Hairpins span a range (select start, then end)
- [ ] Dynamics stored in ScoreModel as `Direction` elements
- [ ] Dynamics render below the staff

### 4.3 Ornaments Input

- [ ] Build ornaments section (can be part of Articulations palette):
  - Trill
  - Tremolo (1, 2, 3 beams)
  - Mordent, inverted mordent
  - Turn, inverted turn
  - Arpeggio (chord rolled)
  - Glissando (between two notes)
- [ ] Apply to selected note
- [ ] Ornaments stored in score model and MusicXML

### 4.4 Slurs

- [ ] Slur creation workflow:
  - Select start note
  - Press `L` or click slur button
  - Navigate to end note
  - Press `L` again or click to complete
  - Slur renders as curved arc
- [ ] Slur editing: select slur and drag endpoints
- [ ] Delete slur: select and press Delete
- [ ] Handle cross-measure and cross-system slurs

### 4.5 Tempo Markings

- [ ] Tempo marking input:
  - BPM number (e.g., ♩= 120)
  - Italian terms (Allegro, Andante, etc.) with auto-complete
  - Combined (e.g., "Allegro ♩= 132")
- [ ] Place at selected measure/beat position
- [ ] Tempo markings affect playback (scheduler reads them)
- [ ] Accelerando / ritardando:
  - Spanning marking (start to end position)
  - Gradual tempo change during playback

### 4.6 Rehearsal Marks

- [ ] Auto-incrementing rehearsal marks (A, B, C... or 1, 2, 3...)
- [ ] Place at selected barline
- [ ] Configurable: letters vs. numbers
- [ ] Bold, boxed display above top staff

### 4.7 Repeat & Navigation Marks

- [ ] Segno symbol placement
- [ ] Coda symbol placement
- [ ] D.C. (Da Capo) text marking
- [ ] D.S. (Dal Segno) text marking
- [ ] "al Coda", "al Fine" variants
- [ ] Fine marking
- [ ] Volta brackets (1st, 2nd, etc. endings):
  - Create by selecting measures
  - Number assignment
  - Visual bracket rendering
- [ ] All marks affect playback (scheduler resolves them)

### 4.8 Lyrics

- [ ] Lyrics input mode:
  - Activate via Text palette or `Ctrl+L`
  - Text field appears below selected note
  - Type syllable → press Space to advance to next note
  - Press `-` to add hyphen (syllable continuation)
  - Press `_` for melisma extension line
  - Press Enter for next verse line
- [ ] Multi-verse support (stacked lyric lines)
- [ ] Lyrics alignment: centered under noteheads
- [ ] Lyrics stored in score model (`<lyric>` in MusicXML)
- [ ] Edit existing lyrics: double-click on lyric text

### 4.9 Chord Symbols

- [ ] Chord symbol input mode:
  - Activate via Text palette or `Ctrl+K`
  - Text field appears above staff at selected position
  - Type chord name (e.g., "Cmaj7", "Dm7b5", "F#7")
  - Auto-formatting: renders as proper chord symbol typography
  - Press Space/Right to advance to next beat
- [ ] Use `tonal` library for chord validation and formatting
- [ ] Chord symbols stored in `<harmony>` MusicXML elements
- [ ] Chord symbols affect nothing in playback (display only, for now)

### 4.10 Expression Text

- [ ] Free text annotation:
  - Place anywhere on the score
  - Italic by default (musical convention)
  - Common presets: dolce, legato, cantabile, etc.
- [ ] Text stored in `<direction>` → `<words>` in MusicXML

### 4.11 Tuplets

- [ ] Tuplet creation workflow:
  - Select notes to group (or specify count)
  - Choose ratio (3:2, 5:4, 6:4, etc.)
  - Notes re-spaced to fit the tuplet
- [ ] Visual: number (and optional bracket) above/below notes
- [ ] Common presets: triplet (3:2) as default
- [ ] Tuplets affect duration calculation in playback

---

## Acceptance Criteria

- [ ] Can add all standard articulations to notes
- [ ] Can add dynamics (static and hairpins)
- [ ] Can add slurs between notes (including cross-measure)
- [ ] Can add ornaments (trills, tremolos, etc.)
- [ ] Can set tempo markings that affect playback
- [ ] Can add rehearsal marks
- [ ] Can add all repeat/navigation marks (segno, coda, D.C., D.S., volta)
- [ ] Can input lyrics aligned to notes (multi-verse)
- [ ] Can input chord symbols above the staff
- [ ] Can add expression text
- [ ] Can create tuplets (triplets and other ratios)
- [ ] All new elements persist in MusicXML save/load

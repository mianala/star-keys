# Notation Features

Complete breakdown of music notation features to implement, organized by priority.

---

## Phase 1 — Core Notation (MVP)

### Notes & Rests

| Feature | Description | Complexity |
|---|---|---|
| Note durations | Whole, half, quarter, eighth, 16th, 32nd notes | Medium |
| Rest durations | Matching rest for each note duration | Low |
| Dotted notes | Single dot (1.5x duration) | Low |
| Double-dotted notes | Double dot (1.75x duration) | Low |
| Accidentals | Sharp, flat, natural | Low |
| Double accidentals | Double sharp, double flat | Low |
| Ties | Connect notes of same pitch across beats/measures | Medium |
| Beaming | Automatic beam grouping based on time signature | High |
| Manual beaming | User override of automatic beam groups | Medium |

### Clefs

| Feature | Description | Complexity |
|---|---|---|
| Treble clef | G clef on second line | Low |
| Bass clef | F clef on fourth line | Low |
| Alto clef | C clef on third line | Low |
| Tenor clef | C clef on fourth line | Low |
| Mid-score clef changes | Change clef at any point in the score | Medium |

### Key Signatures

| Feature | Description | Complexity |
|---|---|---|
| All major/minor keys | Full circle of fifths | Low |
| Mid-score changes | Key signature change at any barline | Medium |
| Concert pitch toggle | Display in concert or transposed pitch | Medium |

### Time Signatures

| Feature | Description | Complexity |
|---|---|---|
| Simple time | 2/4, 3/4, 4/4, 2/2, etc. | Low |
| Compound time | 6/8, 9/8, 12/8, etc. | Low |
| Custom time | Any numerator/denominator | Medium |
| Mid-score changes | Time signature change at any barline | Medium |

### Barlines

| Feature | Description | Complexity |
|---|---|---|
| Single barline | Standard measure separator | Low |
| Double barline | Section boundary | Low |
| Final barline | End of piece | Low |
| Repeat barlines | Left/right repeat signs | Medium |
| Multiple repeats | Custom repeat count (e.g., 3x) | Medium |

### Multi-Voice

| Feature | Description | Complexity |
|---|---|---|
| Two voices per staff | Voice 1 (stems up) / Voice 2 (stems down) | High |
| Voice switching | Toggle between voices during input | Medium |

---

## Phase 2 — Expressive Notation

### Dynamics

| Feature | Description | Complexity |
|---|---|---|
| Static dynamics | ppp, pp, p, mp, mf, f, ff, fff | Low |
| Sforzando variants | sfz, fp, rfz | Low |
| Crescendo/diminuendo | Hairpin lines between dynamic levels | Medium |
| Pedal markings | Sustain pedal on/off | Low |

### Articulations

| Feature | Description | Complexity |
|---|---|---|
| Staccato | Shortened note | Low |
| Staccatissimo | Very shortened note | Low |
| Accent | Emphasized attack | Low |
| Marcato | Strong accent | Low |
| Tenuto | Held full duration | Low |
| Fermata | Held beyond written value | Low |
| Slurs | Curved line connecting notes | Medium |

### Ornaments

| Feature | Description | Complexity |
|---|---|---|
| Trill | Rapid alternation with upper note | Low |
| Tremolo | Rapid repetition (1, 2, 3 beams) | Medium |
| Arpeggio | Rolled chord | Low |
| Glissando | Slide between pitches | Medium |
| Mordent | Quick lower/upper neighbor | Low |
| Turn | Four-note ornamental figure | Low |
| Grace notes | Appoggiatura and acciaccatura | Medium |

### Tempo & Navigation

| Feature | Description | Complexity |
|---|---|---|
| Tempo markings | BPM + Italian terms (Allegro, Andante, etc.) | Low |
| Accelerando/ritardando | Gradual tempo changes | Medium |
| Rehearsal marks | Letter/number rehearsal indicators | Low |
| Segno, Coda | Navigation symbols | Low |
| D.C., D.S. | Da Capo, Dal Segno jump instructions | Medium |
| 1st/2nd endings | Volta brackets | Medium |

---

## Phase 3 — Text & Advanced

### Lyrics & Text

| Feature | Description | Complexity |
|---|---|---|
| Single-verse lyrics | Text aligned under notes | Medium |
| Multi-verse lyrics | Multiple lines of lyrics stacked | High |
| Chord symbols | Text chord names above staff (e.g., Cmaj7) | Medium |
| Expression text | Free text annotations (dolce, legato, etc.) | Low |

### Advanced Notation

| Feature | Description | Complexity |
|---|---|---|
| Tuplets | Triplets, quintuplets, etc. | High |
| Octave lines | 8va, 8vb, 15ma | Medium |
| Multi-measure rests | Collapsed empty measures with count | Medium |
| Slash notation | Rhythmic slash noteheads | Low |
| Ghost notes | Parenthesized noteheads | Low |
| Enharmonic switching | Respell note (e.g., F# ↔ Gb) | Low |

---

## Phase 4 — Specialized Notation (Post-MVP)

### Guitar Tablature

| Feature | Description | Complexity |
|---|---|---|
| Tab staff | 6-line (or custom) tablature staff | High |
| Fret numbers | Fret number placement on strings | Medium |
| Custom tuning | Non-standard guitar tunings | Medium |
| Capo support | Capo position affects fret numbers | Medium |
| Bends | Full bend, half bend, pre-bend, release | High |
| Slides | Slide in/out between frets | Medium |
| Hammer-on/pull-off | Legato technique indicators | Medium |
| Harmonics | Natural and artificial harmonics | Medium |
| Palm mute | Palm mute range indicator | Low |
| Let ring | Let ring range indicator | Low |
| Chord diagrams | Guitar chord grids above staff | High |

### Percussion

| Feature | Description | Complexity |
|---|---|---|
| Drum set staff | 5-line percussion staff | High |
| Noteheads | X, diamond, triangle, slash noteheads | Medium |
| Custom percussion map | Map noteheads to instruments/sounds | High |
| Drum pad input | Virtual drum pad for percussion entry | Medium |

### Microtonal

| Feature | Description | Complexity |
|---|---|---|
| Quarter tones | Half-sharp, half-flat accidentals | Medium |

---

## Data Model Considerations

Each notation element maps to a MusicXML element. Our internal score model should mirror MusicXML's hierarchy:

```
Score
├── Part[] (instruments)
│   ├── Measure[]
│   │   ├── Attributes (clef, key, time, divisions)
│   │   ├── Note[]
│   │   │   ├── pitch / rest
│   │   │   ├── duration
│   │   │   ├── type (quarter, eighth, etc.)
│   │   │   ├── dot count
│   │   │   ├── accidental
│   │   │   ├── tie (start/stop)
│   │   │   ├── beam[]
│   │   │   ├── articulations[]
│   │   │   ├── dynamics[]
│   │   │   ├── ornaments[]
│   │   │   ├── lyrics[]
│   │   │   ├── notations[] (slur, tuplet, etc.)
│   │   │   └── voice
│   │   ├── Direction[] (tempo, dynamics, wedge, words)
│   │   ├── Barline (repeat, ending)
│   │   └── Forward/Backup (voice navigation)
```

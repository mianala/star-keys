# Instrument Library

Complete list of instruments available in the score editor.

---

## Instrument Categories

### Keyboard

| Instrument | Clef | Staves | GM Program | Transposition |
|---|---|---|---|---|
| Piano | Treble + Bass | 2 | 0 | C (concert) |
| Electric Piano | Treble + Bass | 2 | 4 | C |
| Harpsichord | Treble + Bass | 2 | 6 | C |
| Organ | Treble + Bass | 2 | 19 | C |
| Accordion | Treble | 1 | 21 | C |
| Celesta | Treble | 1 | 8 | C |

### Strings (Bowed)

| Instrument | Clef | Range | GM Program | Transposition |
|---|---|---|---|---|
| Violin | Treble | G3–E7 | 40 | C |
| Viola | Alto | C3–A6 | 41 | C |
| Cello | Bass | C2–A5 | 42 | C |
| Contrabass | Bass | E1–G4 | 43 | C (sounds 8vb) |

### Strings (Plucked)

| Instrument | Clef | Tab | GM Program | Tuning |
|---|---|---|---|---|
| Acoustic Guitar | Treble | Yes | 25 | E2-A2-D3-G3-B3-E4 |
| Electric Guitar | Treble | Yes | 27 | E2-A2-D3-G3-B3-E4 |
| Bass Guitar | Bass | Yes | 33 | E1-A1-D2-G2 |
| Ukulele | Treble | Yes | 24 | G4-C4-E4-A4 |
| Harp | Treble + Bass | No | 46 | C |
| Banjo | Treble | Yes | 105 | G4-D3-G3-B3-D4 |

### Woodwinds

| Instrument | Clef | Range | GM Program | Transposition |
|---|---|---|---|---|
| Piccolo | Treble | D5–C8 | 72 | C (sounds 8va) |
| Flute | Treble | C4–D7 | 73 | C |
| Oboe | Treble | Bb3–A6 | 68 | C |
| English Horn | Treble | E3–C6 | 69 | F (-7 semitones) |
| Clarinet in Bb | Treble | D3–Bb6 | 71 | Bb (-2 semitones) |
| Clarinet in A | Treble | C#3–A6 | 71 | A (-3 semitones) |
| Bass Clarinet | Treble | Db2–G5 | 71 | Bb (-14 semitones) |
| Bassoon | Bass | Bb1–Eb5 | 70 | C |
| Contrabassoon | Bass | Bb0–Bb3 | 70 | C (sounds 8vb) |
| Recorder | Treble | C5–D7 | 74 | C |

### Saxophones

| Instrument | Clef | Range | GM Program | Transposition |
|---|---|---|---|---|
| Soprano Sax | Treble | Ab3–E6 | 64 | Bb (-2 semitones) |
| Alto Sax | Treble | Db3–A5 | 65 | Eb (-9 semitones) |
| Tenor Sax | Treble | Ab2–E5 | 66 | Bb (-14 semitones) |
| Baritone Sax | Treble | C2–A4 | 67 | Eb (-21 semitones) |

### Brass

| Instrument | Clef | Range | GM Program | Transposition |
|---|---|---|---|---|
| Trumpet in Bb | Treble | E3–Bb5 | 56 | Bb (-2 semitones) |
| Trumpet in C | Treble | E3–A5 | 56 | C |
| Horn in F | Treble | B1–F5 | 60 | F (-7 semitones) |
| Trombone | Bass | E2–Bb4 | 57 | C |
| Bass Trombone | Bass | Bb1–Bb4 | 57 | C |
| Euphonium | Bass | Bb1–Bb4 | 57 | C |
| Tuba | Bass | D1–F4 | 58 | C |

### Percussion (Pitched)

| Instrument | Clef | GM Program |
|---|---|---|
| Timpani | Bass | 47 |
| Xylophone | Treble | 13 |
| Marimba | Treble + Bass | 12 |
| Vibraphone | Treble | 11 |
| Glockenspiel | Treble | 9 |
| Tubular Bells | Treble | 14 |

### Percussion (Unpitched)

| Instrument | Staff | GM Channel |
|---|---|---|
| Drum Set | 5-line percussion | Ch. 10 |
| Snare Drum | 1-line | Ch. 10 |
| Bass Drum | 1-line | Ch. 10 |
| Cymbals | 1-line | Ch. 10 |
| Triangle | 1-line | Ch. 10 |
| Tambourine | 1-line | Ch. 10 |
| Woodblock | 1-line | Ch. 10 |
| Cowbell | 1-line | Ch. 10 |

### Voice

| Instrument | Clef | Range | GM Program |
|---|---|---|---|
| Soprano | Treble | C4–C6 | 52 |
| Mezzo-Soprano | Treble | A3–A5 | 52 |
| Alto | Treble | F3–F5 | 52 |
| Countertenor | Treble | E3–E5 | 52 |
| Tenor | Treble (8vb) | C3–C5 | 52 |
| Baritone | Bass | A2–A4 | 52 |
| Bass | Bass | E2–E4 | 52 |

---

## Score Templates

Pre-configured instrument combinations for common ensembles:

| Template | Instruments |
|---|---|
| Solo Piano | Piano |
| String Quartet | Violin 1, Violin 2, Viola, Cello |
| Woodwind Quintet | Flute, Oboe, Clarinet, Horn, Bassoon |
| Brass Quintet | Trumpet 1, Trumpet 2, Horn, Trombone, Tuba |
| Jazz Combo | Alto Sax, Trumpet, Piano, Bass, Drums |
| Rock Band | Electric Guitar, Bass Guitar, Drums, Vocals |
| SATB Choir | Soprano, Alto, Tenor, Bass + Piano |
| Concert Band | Full wind ensemble configuration |
| Orchestra | Full orchestral configuration |
| Lead Sheet | Treble clef melody + chord symbols |
| Guitar + Tab | Guitar with standard notation + tablature |

---

## Adding Custom Instruments

Users can create custom instrument configurations:

```typescript
interface CustomInstrument {
  name: string;
  abbreviation: string;
  clef: ClefType;
  staves: number;
  gmProgram: number;        // which sound to use
  transposition: {
    semitones: number;
    diatonicSteps: number;
  };
  range: { low: string; high: string };
  usesTab: boolean;
  tabTuning?: string[];
  isPercussion: boolean;
  percussionMap?: PercussionMapping[];  // for custom unpitched instruments
}
```

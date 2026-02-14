# Instruments & Sounds

Instrument library, soundfont strategy, and sound configuration.

---

## Soundfont Strategy

### Primary: smplr (CDN-hosted samples)

Use `smplr` to load high-quality instrument samples from a CDN. Zero server setup required.

**Built-in instruments in smplr:**
- Splendid Grand Piano
- Electric Piano (Rhodes, Wurlitzer)
- Mallets (Marimba, Vibraphone, Xylophone)
- Acoustic Guitar
- Strings (via General MIDI soundfont)

**General MIDI via smplr's Soundfont loader:**
- Loads any GM program number (0–127)
- Uses MusyngKite or FluidR3_GM soundfont
- Covers all 128 GM instruments + percussion

### Secondary: SpessaSynth (SF2 files)

For higher quality sounds or custom soundfonts:
- Load SF2 files directly in the browser
- Full modulator and effects support
- Heavier download but better sound quality

### Fallback: WebAudioFont

Pre-decoded Web Audio buffers for fast loading:
- 5–10 sound variations per instrument
- Hosted on GitHub Pages
- Good for quick prototyping

---

## Instrument Categories

### Keyboards (GM Programs 0–7)

| # | Name | Default Sound |
|---|---|---|
| 0 | Acoustic Grand Piano | smplr SplendidGrandPiano |
| 1 | Bright Acoustic Piano | GM Soundfont |
| 2 | Electric Grand Piano | GM Soundfont |
| 3 | Honky-tonk Piano | GM Soundfont |
| 4 | Electric Piano 1 (Rhodes) | smplr ElectricPiano |
| 5 | Electric Piano 2 (DX) | GM Soundfont |
| 6 | Harpsichord | GM Soundfont |
| 7 | Clavinet | GM Soundfont |

### Chromatic Percussion (GM 8–15)

| # | Name |
|---|---|
| 8 | Celesta |
| 9 | Glockenspiel |
| 10 | Music Box |
| 11 | Vibraphone |
| 12 | Marimba |
| 13 | Xylophone |
| 14 | Tubular Bells |
| 15 | Dulcimer |

### Organ (GM 16–23)

| # | Name |
|---|---|
| 16 | Drawbar Organ |
| 17 | Percussive Organ |
| 18 | Rock Organ |
| 19 | Church Organ |
| 20 | Reed Organ |
| 21 | Accordion |
| 22 | Harmonica |
| 23 | Tango Accordion |

### Guitar (GM 24–31)

| # | Name |
|---|---|
| 24 | Acoustic Guitar (nylon) |
| 25 | Acoustic Guitar (steel) |
| 26 | Electric Guitar (jazz) |
| 27 | Electric Guitar (clean) |
| 28 | Electric Guitar (muted) |
| 29 | Overdriven Guitar |
| 30 | Distortion Guitar |
| 31 | Guitar Harmonics |

### Bass (GM 32–39)

| # | Name |
|---|---|
| 32 | Acoustic Bass |
| 33 | Electric Bass (finger) |
| 34 | Electric Bass (pick) |
| 35 | Fretless Bass |
| 36 | Slap Bass 1 |
| 37 | Slap Bass 2 |
| 38 | Synth Bass 1 |
| 39 | Synth Bass 2 |

### Strings (GM 40–47)

| # | Name |
|---|---|
| 40 | Violin |
| 41 | Viola |
| 42 | Cello |
| 43 | Contrabass |
| 44 | Tremolo Strings |
| 45 | Pizzicato Strings |
| 46 | Orchestral Harp |
| 47 | Timpani |

### Ensemble (GM 48–55)

| # | Name |
|---|---|
| 48 | String Ensemble 1 |
| 49 | String Ensemble 2 |
| 50 | Synth Strings 1 |
| 51 | Synth Strings 2 |
| 52 | Choir Aahs |
| 53 | Voice Oohs |
| 54 | Synth Choir |
| 55 | Orchestra Hit |

### Brass (GM 56–63)

| # | Name |
|---|---|
| 56 | Trumpet |
| 57 | Trombone |
| 58 | Tuba |
| 59 | Muted Trumpet |
| 60 | French Horn |
| 61 | Brass Section |
| 62 | Synth Brass 1 |
| 63 | Synth Brass 2 |

### Reed (GM 64–71)

| # | Name |
|---|---|
| 64 | Soprano Saxophone |
| 65 | Alto Saxophone |
| 66 | Tenor Saxophone |
| 67 | Baritone Saxophone |
| 68 | Oboe |
| 69 | English Horn |
| 70 | Bassoon |
| 71 | Clarinet |

### Pipe (GM 72–79)

| # | Name |
|---|---|
| 72 | Piccolo |
| 73 | Flute |
| 74 | Recorder |
| 75 | Pan Flute |
| 76 | Blown Bottle |
| 77 | Shakuhachi |
| 78 | Whistle |
| 79 | Ocarina |

### Percussion (Channel 10)

Standard GM drum map on MIDI channel 10:

| MIDI Note | Instrument |
|---|---|
| 35 | Acoustic Bass Drum |
| 36 | Bass Drum 1 |
| 38 | Acoustic Snare |
| 40 | Electric Snare |
| 42 | Closed Hi-Hat |
| 44 | Pedal Hi-Hat |
| 46 | Open Hi-Hat |
| 49 | Crash Cymbal 1 |
| 51 | Ride Cymbal 1 |
| 41,43,45,47,48,50 | Toms (low → high) |

---

## Instrument Configuration

Each instrument in the score has:

```typescript
interface InstrumentConfig {
  id: string;              // unique identifier
  name: string;            // display name (e.g., "Violin")
  abbreviation: string;    // short name (e.g., "Vln.")
  gmProgram: number;       // General MIDI program number (0–127)
  midiChannel: number;     // MIDI channel (0-15, 9 for drums)
  clef: 'treble' | 'bass' | 'alto' | 'tenor' | 'percussion';
  transposition: {         // for transposing instruments
    semitones: number;     // e.g., -2 for Bb instruments
    diatonicSteps: number; // e.g., -1 for Bb instruments
  };
  range: {                 // playable range
    low: string;           // e.g., "G3" for violin
    high: string;          // e.g., "E7" for violin
  };
  staves: number;          // 1 for most, 2 for piano
  usesTab: boolean;        // guitar-family instruments
  tabTuning?: string[];    // e.g., ["E2","A2","D3","G3","B3","E4"]
  isPercussion: boolean;   // unpitched percussion
}
```

---

## Transposing Instruments

| Instrument | Transposition | Written C4 sounds as |
|---|---|---|
| Bb Clarinet | -2 semitones | Bb3 |
| Bb Trumpet | -2 semitones | Bb3 |
| Eb Alto Sax | -9 semitones | Eb3 |
| Bb Tenor Sax | -14 semitones | Bb2 |
| Eb Baritone Sax | -21 semitones | Eb2 |
| F Horn | -7 semitones | F3 |
| Bb Soprano Sax | -2 semitones | Bb3 |

Concert pitch toggle: when enabled, all parts display at sounding pitch. When disabled, transposing instruments show their written pitch.

---

## Sound Loading Strategy

1. **On score open:** Identify all instruments in the score
2. **Lazy load:** Begin loading instrument samples in background
3. **Priority:** Load the first part's instrument first (likely to be played first)
4. **Cache:** Store loaded instruments in memory for the session
5. **Fallback:** If a specific instrument fails to load, fall back to piano
6. **Loading indicator:** Show per-instrument loading state in the mixer

```
User opens score with Violin, Cello, Piano
→ Load Piano immediately (most common, likely cached)
→ Load Violin in background
→ Load Cello in background
→ All ready → enable Play button
```

// ─── Primitives ─────────────────────────────────────────────

export type NoteDuration =
  | 'whole'
  | 'half'
  | 'quarter'
  | 'eighth'
  | '16th'
  | '32nd'
  | '64th';

export type AccidentalType =
  | 'sharp'
  | 'flat'
  | 'natural'
  | 'double-sharp'
  | 'double-flat';

export type ClefSign = 'G' | 'F' | 'C' | 'percussion' | 'TAB';

export type BarlineType =
  | 'regular'
  | 'double'
  | 'final'
  | 'repeat-forward'
  | 'repeat-backward'
  | 'repeat-both';

export type DynamicLevel =
  | 'ppp' | 'pp' | 'p' | 'mp'
  | 'mf' | 'f' | 'ff' | 'fff'
  | 'sfz' | 'fp' | 'rfz';

export type ArticulationType =
  | 'staccato'
  | 'staccatissimo'
  | 'accent'
  | 'marcato'
  | 'tenuto'
  | 'fermata'
  | 'palm-mute'
  | 'let-ring';

export type OrnamentType =
  | 'trill'
  | 'mordent'
  | 'inverted-mordent'
  | 'turn'
  | 'inverted-turn'
  | 'tremolo-1'
  | 'tremolo-2'
  | 'tremolo-3';

// ─── Guitar Techniques ──────────────────────────────────────

export type BendType = 'full' | 'half' | 'quarter' | 'pre-bend' | 'release' | 'bend-release';

export type SlideType = 'slide-in-up' | 'slide-in-down' | 'slide-out-up' | 'slide-out-down' | 'shift-slide';

export type HarmonicType = 'natural' | 'artificial' | 'pinch' | 'tap';

export interface Bend {
  type: BendType;
  steps?: number; // For microtonal bends, in quarter-tones
}

export interface Slide {
  type: SlideType;
}

export interface Harmonic {
  type: HarmonicType;
  pitch?: Pitch; // For artificial harmonics
}

export type NoteheadType =
  | 'normal'
  | 'x'
  | 'diamond'
  | 'triangle'
  | 'slash';

// ─── Pitch ──────────────────────────────────────────────────

export type Step = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

export interface Pitch {
  step: Step;
  octave: number;
  alter?: number; // -2 to +2 (semitone alteration)
}

// ─── Note ───────────────────────────────────────────────────

// ─── Lyric ──────────────────────────────────────────────────

export interface Lyric {
  text: string;
  syllabic?: 'single' | 'begin' | 'middle' | 'end';
  verse: number; // 1-based verse number
}

// ─── Tuplet ─────────────────────────────────────────────────

export interface TupletInfo {
  actualNotes: number; // e.g. 3 (triplet)
  normalNotes: number; // e.g. 2
  bracket?: 'start' | 'stop';
}

export interface Note {
  id: string;
  type: 'note';
  pitch: Pitch;
  duration: NoteDuration;
  dots: number;
  voice: number;
  staff?: number;
  accidental?: AccidentalType;
  tie?: 'start' | 'stop' | 'start-stop';
  slur?: 'start' | 'stop' | 'start-stop';
  isChord?: boolean;
  articulations?: ArticulationType[];
  ornaments?: OrnamentType[];
  notehead?: NoteheadType;
  lyrics?: Lyric[];
  tuplet?: TupletInfo;

  // Guitar tab specific
  tabString?: number;  // 1-based string number
  tabFret?: number;    // fret number

  // Guitar techniques
  bend?: Bend;
  slide?: Slide;
  harmonic?: Harmonic;
  hammerOn?: boolean;
  pullOff?: boolean;

  // Percussion specific
  unpitched?: {
    displayStep: Step;
    displayOctave: number;
  };
}

export interface Rest {
  id: string;
  type: 'rest';
  duration: NoteDuration;
  dots: number;
  voice: number;
  staff?: number;
  isFullMeasure?: boolean;
}

export type NoteOrRest = Note | Rest;

// ─── Measure Attributes ─────────────────────────────────────

export interface Clef {
  sign: ClefSign;
  line: number;       // staff line number
  tabStrings?: number; // number of lines for TAB clef
}

export interface KeySignature {
  fifths: number; // -7 to +7 (flats to sharps)
  mode?: 'major' | 'minor';
}

export interface TimeSignature {
  beats: number;
  beatType: number;
}

export interface MeasureAttributes {
  divisions?: number;
  clef?: Clef;
  key?: KeySignature;
  time?: TimeSignature;
  staves?: number;
}

// ─── Directions ─────────────────────────────────────────────

export interface TempoDirection {
  kind: 'tempo';
  bpm: number;
  text?: string; // e.g. "Allegro"
}

export interface DynamicDirection {
  kind: 'dynamic';
  level: DynamicLevel;
}

export interface WedgeDirection {
  kind: 'wedge';
  wedgeType: 'crescendo' | 'diminuendo' | 'stop';
}

export interface RehearsalDirection {
  kind: 'rehearsal';
  text: string;
}

export interface WordsDirection {
  kind: 'words';
  text: string;
}

export interface HarmonyDirection {
  kind: 'harmony';
  root: { step: Step; alter?: number };
  chordKind: string; // 'major', 'minor', 'dominant', 'diminished', 'augmented', etc.
  bass?: { step: Step; alter?: number };
  text?: string; // display text override, e.g. "Cmaj7"
}

export type NavigationMark =
  | 'segno'
  | 'coda'
  | 'dacapo'
  | 'dalsegno'
  | 'dacapo-al-coda'
  | 'dacapo-al-fine'
  | 'dalsegno-al-coda'
  | 'dalsegno-al-fine'
  | 'fine'
  | 'tocoda';

export interface NavigationDirection {
  kind: 'navigation';
  mark: NavigationMark;
}

export type Direction =
  | TempoDirection
  | DynamicDirection
  | WedgeDirection
  | RehearsalDirection
  | WordsDirection
  | HarmonyDirection
  | NavigationDirection;

// ─── Barline ────────────────────────────────────────────────

export interface Barline {
  type: BarlineType;
  repeat?: {
    direction: 'forward' | 'backward';
    times?: number;
  };
  ending?: {
    number: number;
    type: 'start' | 'stop' | 'discontinue';
  };
}

// ─── Measure ────────────────────────────────────────────────

export interface Measure {
  number: number;
  attributes?: MeasureAttributes;
  notes: NoteOrRest[];
  directions: Direction[];
  barline?: Barline;
}

// ─── Part / Instrument ──────────────────────────────────────

export interface InstrumentConfig {
  id: string;
  name: string;
  abbreviation: string;
  gmProgram: number;        // General MIDI program (0-127)
  midiChannel: number;      // MIDI channel (0-15, 9 for drums)
  clef: Clef;
  transposition?: {
    semitones: number;
    diatonicSteps: number;
  };
  range?: {
    low: string;  // e.g. "E2"
    high: string; // e.g. "E6"
  };
  staves: number;
  usesTab: boolean;
  tabTuning?: string[];     // e.g. ["E2","A2","D3","G3","B3","E4"]
  tabCapo?: number;
  isPercussion: boolean;
}

export interface Part {
  id: string;
  instrument: InstrumentConfig;
  measures: Measure[];
}

// ─── Chord Diagrams ─────────────────────────────────────────

export interface FretMarker {
  string: number; // 1-based string number
  fret: number;   // 0 = open, -1 = muted
}

export interface ChordDiagram {
  name: string;
  instrument: string; // reference to instrument id
  frets: FretMarker[];
  barre?: {
    fret: number;
    fromString: number;
    toString: number;
  }[];
  position?: number; // Starting fret position indicator
}

// ─── Score ──────────────────────────────────────────────────

export interface ScoreMeta {
  title: string;
  composer: string;
  arranger?: string;
}

export interface Score {
  meta: ScoreMeta;
  parts: Part[];
  chordDiagrams?: ChordDiagram[];
}

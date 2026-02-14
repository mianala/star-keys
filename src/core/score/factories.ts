import type {
  Score,
  Part,
  Measure,
  Note,
  Rest,
  NoteOrRest,
  Pitch,
  NoteDuration,
  InstrumentConfig,
  Clef,
  KeySignature,
  TimeSignature,
} from '@/types/index.ts';

let idCounter = 0;
export function uid(): string {
  return `n${++idCounter}_${Date.now().toString(36)}`;
}

// ─── Preset Instruments ─────────────────────────────────────

export const PIANO: InstrumentConfig = {
  id: 'piano',
  name: 'Piano',
  abbreviation: 'Pno.',
  gmProgram: 0,
  midiChannel: 0,
  clef: { sign: 'G', line: 2 },
  staves: 1,
  usesTab: false,
  isPercussion: false,
  range: { low: 'A0', high: 'C8' },
};

export const GUITAR_STANDARD: InstrumentConfig = {
  id: 'acoustic-guitar',
  name: 'Acoustic Guitar',
  abbreviation: 'Gtr.',
  gmProgram: 25,
  midiChannel: 0,
  clef: { sign: 'TAB', line: 5, tabStrings: 6 },
  staves: 1,
  usesTab: true,
  tabTuning: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  isPercussion: false,
};

export const ELECTRIC_GUITAR: InstrumentConfig = {
  id: 'electric-guitar',
  name: 'Electric Guitar',
  abbreviation: 'E.Gtr.',
  gmProgram: 27,
  midiChannel: 0,
  clef: { sign: 'TAB', line: 5, tabStrings: 6 },
  staves: 1,
  usesTab: true,
  tabTuning: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  isPercussion: false,
};

export const BASS_GUITAR: InstrumentConfig = {
  id: 'bass-guitar',
  name: 'Bass Guitar',
  abbreviation: 'Bass',
  gmProgram: 33,
  midiChannel: 0,
  clef: { sign: 'TAB', line: 5, tabStrings: 4 },
  staves: 1,
  usesTab: true,
  tabTuning: ['E1', 'A1', 'D2', 'G2'],
  isPercussion: false,
};

export const DRUM_SET: InstrumentConfig = {
  id: 'drum-set',
  name: 'Drum Set',
  abbreviation: 'Dr.',
  gmProgram: 0,
  midiChannel: 9,
  clef: { sign: 'percussion', line: 3 },
  staves: 1,
  usesTab: false,
  isPercussion: true,
};

// Additional String Instruments
export const UKULELE: InstrumentConfig = {
  id: 'ukulele',
  name: 'Ukulele',
  abbreviation: 'Uke.',
  gmProgram: 25,
  midiChannel: 0,
  clef: { sign: 'TAB', line: 5, tabStrings: 4 },
  staves: 1,
  usesTab: true,
  tabTuning: ['G4', 'C4', 'E4', 'A4'],
  isPercussion: false,
};

export const BANJO: InstrumentConfig = {
  id: 'banjo',
  name: 'Banjo',
  abbreviation: 'Bjo.',
  gmProgram: 105,
  midiChannel: 0,
  clef: { sign: 'TAB', line: 5, tabStrings: 5 },
  staves: 1,
  usesTab: true,
  tabTuning: ['G4', 'D3', 'G3', 'B3', 'D4'],
  isPercussion: false,
};

export const MANDOLIN: InstrumentConfig = {
  id: 'mandolin',
  name: 'Mandolin',
  abbreviation: 'Mnd.',
  gmProgram: 25,
  midiChannel: 0,
  clef: { sign: 'TAB', line: 5, tabStrings: 4 },
  staves: 1,
  usesTab: true,
  tabTuning: ['G3', 'D4', 'A4', 'E5'],
  isPercussion: false,
};

// Wind Instruments
export const FLUTE: InstrumentConfig = {
  id: 'flute',
  name: 'Flute',
  abbreviation: 'Fl.',
  gmProgram: 73,
  midiChannel: 0,
  clef: { sign: 'G', line: 2 },
  staves: 1,
  usesTab: false,
  isPercussion: false,
  range: { low: 'C4', high: 'D7' },
};

export const CLARINET: InstrumentConfig = {
  id: 'clarinet',
  name: 'Clarinet',
  abbreviation: 'Cl.',
  gmProgram: 71,
  midiChannel: 0,
  clef: { sign: 'G', line: 2 },
  staves: 1,
  usesTab: false,
  isPercussion: false,
  transposition: { semitones: -2, diatonicSteps: -1 }, // Bb instrument
  range: { low: 'E3', high: 'C7' },
};

export const SAXOPHONE_ALTO: InstrumentConfig = {
  id: 'saxophone-alto',
  name: 'Alto Saxophone',
  abbreviation: 'A.Sax.',
  gmProgram: 65,
  midiChannel: 0,
  clef: { sign: 'G', line: 2 },
  staves: 1,
  usesTab: false,
  isPercussion: false,
  transposition: { semitones: -9, diatonicSteps: -5 }, // Eb instrument
  range: { low: 'Db3', high: 'F#6' },
};

export const SAXOPHONE_TENOR: InstrumentConfig = {
  id: 'saxophone-tenor',
  name: 'Tenor Saxophone',
  abbreviation: 'T.Sax.',
  gmProgram: 66,
  midiChannel: 0,
  clef: { sign: 'G', line: 2 },
  staves: 1,
  usesTab: false,
  isPercussion: false,
  transposition: { semitones: -2, diatonicSteps: -1 }, // Bb instrument
  range: { low: 'Ab2', high: 'E6' },
};

export const TRUMPET: InstrumentConfig = {
  id: 'trumpet',
  name: 'Trumpet',
  abbreviation: 'Tpt.',
  gmProgram: 56,
  midiChannel: 0,
  clef: { sign: 'G', line: 2 },
  staves: 1,
  usesTab: false,
  isPercussion: false,
  transposition: { semitones: -2, diatonicSteps: -1 }, // Bb instrument
  range: { low: 'F#3', high: 'D6' },
};

export const TROMBONE: InstrumentConfig = {
  id: 'trombone',
  name: 'Trombone',
  abbreviation: 'Tbn.',
  gmProgram: 57,
  midiChannel: 0,
  clef: { sign: 'F', line: 4 },
  staves: 1,
  usesTab: false,
  isPercussion: false,
  range: { low: 'E2', high: 'F5' },
};

// String Orchestra Instruments
export const VIOLIN: InstrumentConfig = {
  id: 'violin',
  name: 'Violin',
  abbreviation: 'Vln.',
  gmProgram: 40,
  midiChannel: 0,
  clef: { sign: 'G', line: 2 },
  staves: 1,
  usesTab: false,
  isPercussion: false,
  range: { low: 'G3', high: 'A7' },
};

export const VIOLA: InstrumentConfig = {
  id: 'viola',
  name: 'Viola',
  abbreviation: 'Vla.',
  gmProgram: 41,
  midiChannel: 0,
  clef: { sign: 'C', line: 3 },
  staves: 1,
  usesTab: false,
  isPercussion: false,
  range: { low: 'C3', high: 'E6' },
};

export const CELLO: InstrumentConfig = {
  id: 'cello',
  name: 'Cello',
  abbreviation: 'Vc.',
  gmProgram: 42,
  midiChannel: 0,
  clef: { sign: 'F', line: 4 },
  staves: 1,
  usesTab: false,
  isPercussion: false,
  range: { low: 'C2', high: 'E6' },
};

export const DOUBLE_BASS: InstrumentConfig = {
  id: 'double-bass',
  name: 'Double Bass',
  abbreviation: 'Db.',
  gmProgram: 43,
  midiChannel: 0,
  clef: { sign: 'F', line: 4 },
  staves: 1,
  usesTab: false,
  isPercussion: false,
  transposition: { semitones: -12, diatonicSteps: -7 }, // Sounds one octave lower
  range: { low: 'E1', high: 'G4' },
};

// Voice
export const VOICE_SOPRANO: InstrumentConfig = {
  id: 'soprano',
  name: 'Soprano',
  abbreviation: 'S.',
  gmProgram: 52,
  midiChannel: 0,
  clef: { sign: 'G', line: 2 },
  staves: 1,
  usesTab: false,
  isPercussion: false,
  range: { low: 'C4', high: 'C6' },
};

export const VOICE_ALTO: InstrumentConfig = {
  id: 'alto',
  name: 'Alto',
  abbreviation: 'A.',
  gmProgram: 52,
  midiChannel: 0,
  clef: { sign: 'G', line: 2 },
  staves: 1,
  usesTab: false,
  isPercussion: false,
  range: { low: 'G3', high: 'F5' },
};

export const VOICE_TENOR: InstrumentConfig = {
  id: 'tenor',
  name: 'Tenor',
  abbreviation: 'T.',
  gmProgram: 52,
  midiChannel: 0,
  clef: { sign: 'G', line: 2 },
  staves: 1,
  usesTab: false,
  isPercussion: false,
  range: { low: 'C3', high: 'G4' },
};

export const VOICE_BASS: InstrumentConfig = {
  id: 'bass-voice',
  name: 'Bass',
  abbreviation: 'B.',
  gmProgram: 52,
  midiChannel: 0,
  clef: { sign: 'F', line: 4 },
  staves: 1,
  usesTab: false,
  isPercussion: false,
  range: { low: 'E2', high: 'E4' },
};

// Keyboards
export const HARPSICHORD: InstrumentConfig = {
  id: 'harpsichord',
  name: 'Harpsichord',
  abbreviation: 'Hpschd.',
  gmProgram: 6,
  midiChannel: 0,
  clef: { sign: 'G', line: 2 },
  staves: 1,
  usesTab: false,
  isPercussion: false,
};

export const ORGAN: InstrumentConfig = {
  id: 'organ',
  name: 'Pipe Organ',
  abbreviation: 'Org.',
  gmProgram: 19,
  midiChannel: 0,
  clef: { sign: 'G', line: 2 },
  staves: 1,
  usesTab: false,
  isPercussion: false,
};

export const ACCORDION: InstrumentConfig = {
  id: 'accordion',
  name: 'Accordion',
  abbreviation: 'Acc.',
  gmProgram: 21,
  midiChannel: 0,
  clef: { sign: 'G', line: 2 },
  staves: 1,
  usesTab: false,
  isPercussion: false,
};

// All preset instruments
export const PRESET_INSTRUMENTS: InstrumentConfig[] = [
  PIANO,
  GUITAR_STANDARD,
  ELECTRIC_GUITAR,
  BASS_GUITAR,
  DRUM_SET,
  UKULELE,
  BANJO,
  MANDOLIN,
  FLUTE,
  CLARINET,
  SAXOPHONE_ALTO,
  SAXOPHONE_TENOR,
  TRUMPET,
  TROMBONE,
  VIOLIN,
  VIOLA,
  CELLO,
  DOUBLE_BASS,
  VOICE_SOPRANO,
  VOICE_ALTO,
  VOICE_TENOR,
  VOICE_BASS,
  HARPSICHORD,
  ORGAN,
  ACCORDION,
];

// ─── Score Templates ────────────────────────────────────────

export const TEMPLATES = {
  blank: {
    name: 'Blank',
    instruments: [PIANO],
  },
  soloGuitar: {
    name: 'Solo Guitar',
    instruments: [GUITAR_STANDARD],
  },
  guitarTab: {
    name: 'Guitar Tablature',
    instruments: [ELECTRIC_GUITAR],
  },
  bassTab: {
    name: 'Bass Tablature',
    instruments: [BASS_GUITAR],
  },
  drums: {
    name: 'Drum Set',
    instruments: [DRUM_SET],
  },
  jazzCombo: {
    name: 'Jazz Combo',
    instruments: [PIANO, BASS_GUITAR, DRUM_SET, SAXOPHONE_ALTO],
  },
  rockBand: {
    name: 'Rock Band',
    instruments: [ELECTRIC_GUITAR, BASS_GUITAR, DRUM_SET],
  },
  stringQuartet: {
    name: 'String Quartet',
    instruments: [VIOLIN, VIOLIN, VIOLA, CELLO],
  },
  woodwindQuintet: {
    name: 'Woodwind Quintet',
    instruments: [FLUTE, CLARINET, SAXOPHONE_ALTO, TRUMPET, TROMBONE],
  },
  brassQuintet: {
    name: 'Brass Quintet',
    instruments: [TRUMPET, TRUMPET, TROMBONE, TROMBONE, DOUBLE_BASS],
  },
  satbChoir: {
    name: 'SATB Choir',
    instruments: [VOICE_SOPRANO, VOICE_ALTO, VOICE_TENOR, VOICE_BASS],
  },
  ukuleleSolo: {
    name: 'Ukulele Solo',
    instruments: [UKULELE],
  },
  mandolinSolo: {
    name: 'Mandolin Solo',
    instruments: [MANDOLIN],
  },
  banjoSolo: {
    name: 'Banjo Solo',
    instruments: [BANJO],
  },
} as const;

export type TemplateKey = keyof typeof TEMPLATES;

// ─── Factory Functions ──────────────────────────────────────

export function createNote(
  pitch: Pitch,
  duration: NoteDuration = 'quarter',
  voice = 1,
): Note {
  return {
    id: uid(),
    type: 'note',
    pitch,
    duration,
    dots: 0,
    voice,
  };
}

export function createRest(
  duration: NoteDuration = 'quarter',
  voice = 1,
): Rest {
  return {
    id: uid(),
    type: 'rest',
    duration,
    dots: 0,
    voice,
  };
}

export function createMeasure(
  number: number,
  attributes?: {
    clef?: Clef;
    key?: KeySignature;
    time?: TimeSignature;
    divisions?: number;
  },
): Measure {
  return {
    number,
    attributes: attributes
      ? {
          divisions: attributes.divisions ?? 1,
          clef: attributes.clef,
          key: attributes.key,
          time: attributes.time,
        }
      : undefined,
    notes: [],
    directions: [],
  };
}

export function createPart(instrument: InstrumentConfig, measureCount = 4): Part {
  const defaultKey: KeySignature = { fifths: 0, mode: 'major' };
  const defaultTime: TimeSignature = { beats: 4, beatType: 4 };

  const measures: Measure[] = [];
  for (let i = 0; i < measureCount; i++) {
    const attrs =
      i === 0
        ? {
            divisions: 1,
            clef: instrument.clef,
            key: instrument.isPercussion ? undefined : defaultKey,
            time: defaultTime,
          }
        : undefined;

    const measure = createMeasure(i + 1, attrs);
    // Fill with whole-measure rest
    const rest = createRest('whole');
    rest.isFullMeasure = true;
    measure.notes.push(rest);
    measures.push(measure);
  }

  return {
    id: instrument.id + '_' + uid(),
    instrument,
    measures,
  };
}

export function createScore(
  title = 'Untitled Score',
  composer = '',
  instruments: InstrumentConfig[] = [PIANO],
  measureCount = 4,
): Score {
  return {
    meta: { title, composer },
    parts: instruments.map((inst) => createPart(inst, measureCount)),
  };
}

// ─── Mutation Helpers ───────────────────────────────────────

export function addMeasure(part: Part): Measure {
  const num = part.measures.length + 1;
  const measure = createMeasure(num);
  const rest = createRest('whole');
  rest.isFullMeasure = true;
  measure.notes.push(rest);
  part.measures.push(measure);
  return measure;
}

export function addNote(measure: Measure, note: Note | Rest): void {
  // Remove full-measure rest if present
  if (
    measure.notes.length === 1 &&
    measure.notes[0].type === 'rest' &&
    (measure.notes[0] as Rest).isFullMeasure
  ) {
    measure.notes = [];
  }
  measure.notes.push(note);
}

export function removeNote(measure: Measure, noteId: string): NoteOrRest | undefined {
  const idx = measure.notes.findIndex((n) => n.id === noteId);
  if (idx === -1) return undefined;
  const [removed] = measure.notes.splice(idx, 1);
  // If measure is now empty, add full-measure rest
  if (measure.notes.length === 0) {
    const rest = createRest('whole');
    rest.isFullMeasure = true;
    measure.notes.push(rest);
  }
  return removed;
}

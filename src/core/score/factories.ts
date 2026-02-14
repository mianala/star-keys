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

export const PRESET_INSTRUMENTS: InstrumentConfig[] = [
  PIANO,
  GUITAR_STANDARD,
  ELECTRIC_GUITAR,
  BASS_GUITAR,
  DRUM_SET,
];

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

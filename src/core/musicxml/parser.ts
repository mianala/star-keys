import type {
  Score,
  Part,
  Measure,
  Note,
  Rest,
  NoteOrRest,
  Pitch,
  NoteDuration,
  AccidentalType,
  Clef,
  ClefSign,
  KeySignature,
  TimeSignature,
  MeasureAttributes,
  Direction,
  DynamicDirection,
  Barline,
  BarlineType,
  InstrumentConfig,
} from '@/types/index.ts';
import { uid } from '@/core/score/index.ts';

// ─── Helpers ────────────────────────────────────────────────

function text(el: Element, tag: string): string | null {
  const child = el.querySelector(tag);
  return child?.textContent ?? null;
}

function num(el: Element, tag: string): number | null {
  const t = text(el, tag);
  return t !== null ? Number(t) : null;
}

function parseDurationType(typeStr: string): NoteDuration {
  const map: Record<string, NoteDuration> = {
    whole: 'whole',
    half: 'half',
    quarter: 'quarter',
    eighth: 'eighth',
    '16th': '16th',
    '32nd': '32nd',
    '64th': '64th',
  };
  return map[typeStr] ?? 'quarter';
}

function parseAccidental(accStr: string): AccidentalType | undefined {
  const map: Record<string, AccidentalType> = {
    sharp: 'sharp',
    flat: 'flat',
    natural: 'natural',
    'double-sharp': 'double-sharp',
    'sharp-sharp': 'double-sharp',
    'double-flat': 'double-flat',
    'flat-flat': 'double-flat',
  };
  return map[accStr];
}

function parseClef(el: Element): Clef {
  const sign = (text(el, 'sign') ?? 'G') as ClefSign;
  const line = num(el, 'line') ?? 2;
  return { sign, line };
}

function parseBarlineType(str: string): BarlineType {
  const map: Record<string, BarlineType> = {
    'light-light': 'double',
    'light-heavy': 'final',
    'heavy-light': 'repeat-forward',
    'heavy-heavy': 'repeat-both',
    regular: 'regular',
  };
  return map[str] ?? 'regular';
}

// ─── Parse Instrument Config ────────────────────────────────

function parsePartList(partListEl: Element): Map<string, InstrumentConfig> {
  const map = new Map<string, InstrumentConfig>();

  for (const sp of partListEl.querySelectorAll('score-part')) {
    const id = sp.getAttribute('id') ?? uid();
    const name = text(sp, 'part-name') ?? 'Instrument';
    const abbrev = text(sp, 'part-abbreviation') ?? name.slice(0, 4);
    const midiProgram = num(sp, 'midi-program');
    const midiChannel = num(sp, 'midi-channel');

    const isPercussion = midiChannel === 10;
    const usesTab = false; // Will be updated when we see a TAB clef in the score

    map.set(id, {
      id,
      name,
      abbreviation: abbrev,
      gmProgram: midiProgram ? midiProgram - 1 : 0, // MusicXML is 1-based
      midiChannel: midiChannel ? midiChannel - 1 : 0, // 0-based
      clef: isPercussion
        ? { sign: 'percussion', line: 3 }
        : { sign: 'G', line: 2 },
      staves: 1,
      usesTab,
      isPercussion,
    });
  }

  return map;
}

// ─── Parse Measure ──────────────────────────────────────────

function parseMeasure(
  measureEl: Element,
  measureNumber: number,
): { measure: Measure; attributes?: MeasureAttributes } {
  let attributes: MeasureAttributes | undefined;
  const notes: NoteOrRest[] = [];
  const directions: Direction[] = [];
  let barline: Barline | undefined;

  // Attributes
  const attrEl = measureEl.querySelector('attributes');
  if (attrEl) {
    attributes = {};
    const div = num(attrEl, 'divisions');
    if (div !== null) attributes.divisions = div;

    const clefEl = attrEl.querySelector('clef');
    if (clefEl) attributes.clef = parseClef(clefEl);

    const keyEl = attrEl.querySelector('key');
    if (keyEl) {
      const fifths = num(keyEl, 'fifths') ?? 0;
      const mode = text(keyEl, 'mode') as 'major' | 'minor' | undefined;
      attributes.key = { fifths, mode: mode ?? 'major' } satisfies KeySignature;
    }

    const timeEl = attrEl.querySelector('time');
    if (timeEl) {
      attributes.time = {
        beats: num(timeEl, 'beats') ?? 4,
        beatType: num(timeEl, 'beat-type') ?? 4,
      } satisfies TimeSignature;
    }

    const stavesNum = num(attrEl, 'staves');
    if (stavesNum !== null) attributes.staves = stavesNum;
  }

  // Notes
  for (const noteEl of measureEl.querySelectorAll('note')) {
    const isRest = noteEl.querySelector('rest') !== null;
    const voice = num(noteEl, 'voice') ?? 1;
    const typeStr = text(noteEl, 'type') ?? 'quarter';
    const duration = parseDurationType(typeStr);
    const dots = noteEl.querySelectorAll('dot').length;
    const isChord = noteEl.querySelector('chord') !== null;

    if (isRest) {
      const rest: Rest = {
        id: uid(),
        type: 'rest',
        duration,
        dots,
        voice,
      };
      notes.push(rest);
    } else {
      const pitchEl = noteEl.querySelector('pitch');
      const unpitchedEl = noteEl.querySelector('unpitched');

      let pitch: Pitch;
      let unpitched: Note['unpitched'];

      if (pitchEl) {
        pitch = {
          step: (text(pitchEl, 'step') ?? 'C') as Pitch['step'],
          octave: num(pitchEl, 'octave') ?? 4,
          alter: num(pitchEl, 'alter') ?? undefined,
        };
      } else if (unpitchedEl) {
        const ds = (text(unpitchedEl, 'display-step') ?? 'C') as Pitch['step'];
        const doct = num(unpitchedEl, 'display-octave') ?? 4;
        pitch = { step: ds, octave: doct };
        unpitched = { displayStep: ds, displayOctave: doct };
      } else {
        pitch = { step: 'C', octave: 4 };
      }

      const accEl = noteEl.querySelector('accidental');
      const accidental = accEl
        ? parseAccidental(accEl.textContent ?? '')
        : undefined;

      // Tie
      let tie: Note['tie'];
      const tieEls = noteEl.querySelectorAll('tie');
      const tieTypes = Array.from(tieEls).map((t) => t.getAttribute('type'));
      if (tieTypes.includes('start') && tieTypes.includes('stop')) {
        tie = 'start-stop';
      } else if (tieTypes.includes('start')) {
        tie = 'start';
      } else if (tieTypes.includes('stop')) {
        tie = 'stop';
      }

      // Tab notation
      const techEl = noteEl.querySelector('notations technical');
      const tabString = techEl ? num(techEl, 'string') ?? undefined : undefined;
      const tabFret = techEl ? num(techEl, 'fret') ?? undefined : undefined;

      const note: Note = {
        id: uid(),
        type: 'note',
        pitch,
        duration,
        dots,
        voice,
        accidental,
        tie,
        isChord: isChord || undefined,
        unpitched,
        tabString: tabString ?? undefined,
        tabFret: tabFret ?? undefined,
      };
      notes.push(note);
    }
  }

  // Directions
  for (const dirEl of measureEl.querySelectorAll('direction')) {
    const soundEl = dirEl.querySelector('sound');
    if (soundEl) {
      const tempo = soundEl.getAttribute('tempo');
      if (tempo) {
        directions.push({
          kind: 'tempo',
          bpm: Number(tempo),
        });
      }
      const dynamics = soundEl.getAttribute('dynamics');
      if (dynamics) {
        // dynamics in MusicXML sound is a number; map approximately
        const val = Number(dynamics);
        let level: DynamicDirection['level'];
        if (val <= 25) level = 'pp';
        else if (val <= 50) level = 'p';
        else if (val <= 75) level = 'mp';
        else if (val <= 90) level = 'mf';
        else if (val <= 105) level = 'f';
        else level = 'ff';
        directions.push({ kind: 'dynamic', level });
      }
    }

    const dynEl = dirEl.querySelector('direction-type dynamics');
    if (dynEl) {
      const child = dynEl.firstElementChild;
      if (child) {
        directions.push({
          kind: 'dynamic',
          level: child.tagName as DynamicDirection['level'],
        });
      }
    }

    const rehearsalEl = dirEl.querySelector('direction-type rehearsal');
    if (rehearsalEl) {
      directions.push({
        kind: 'rehearsal',
        text: rehearsalEl.textContent ?? '',
      });
    }

    const wedgeEl = dirEl.querySelector('direction-type wedge');
    if (wedgeEl) {
      const wType = wedgeEl.getAttribute('type') ?? 'crescendo';
      directions.push({
        kind: 'wedge',
        wedgeType: wType as 'crescendo' | 'diminuendo' | 'stop',
      });
    }
  }

  // Barline
  const barlineEl = measureEl.querySelector('barline');
  if (barlineEl) {
    const barStyleStr = text(barlineEl, 'bar-style') ?? 'regular';
    const repeatEl = barlineEl.querySelector('repeat');
    const endingEl = barlineEl.querySelector('ending');

    barline = {
      type: parseBarlineType(barStyleStr),
      repeat: repeatEl
        ? {
            direction: (repeatEl.getAttribute('direction') ?? 'forward') as
              | 'forward'
              | 'backward',
            times: repeatEl.getAttribute('times')
              ? Number(repeatEl.getAttribute('times'))
              : undefined,
          }
        : undefined,
      ending: endingEl
        ? {
            number: Number(endingEl.getAttribute('number') ?? '1'),
            type: (endingEl.getAttribute('type') ?? 'start') as
              | 'start'
              | 'stop'
              | 'discontinue',
          }
        : undefined,
    };
  }

  return {
    measure: {
      number: measureNumber,
      attributes,
      notes,
      directions,
      barline,
    },
    attributes,
  };
}

// ─── Main Parser ────────────────────────────────────────────

export function parseMusicXML(xmlString: string): Score {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');

  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    throw new Error(`MusicXML parse error: ${errorNode.textContent}`);
  }

  const root = doc.querySelector('score-partwise');
  if (!root) {
    throw new Error('Unsupported MusicXML format: expected <score-partwise>');
  }

  // Metadata
  const title = text(root, 'work work-title') ?? text(root, 'movement-title') ?? 'Untitled';
  const composer =
    root
      .querySelector('identification creator[type="composer"]')
      ?.textContent ?? '';

  // Part list
  const partListEl = root.querySelector('part-list');
  const instrumentMap = partListEl
    ? parsePartList(partListEl)
    : new Map<string, InstrumentConfig>();

  // Parts
  const parts: Part[] = [];
  for (const partEl of root.querySelectorAll('part')) {
    const partId = partEl.getAttribute('id') ?? uid();
    const instrument = instrumentMap.get(partId) ?? {
      id: partId,
      name: 'Unknown',
      abbreviation: 'Unk.',
      gmProgram: 0,
      midiChannel: 0,
      clef: { sign: 'G' as ClefSign, line: 2 },
      staves: 1,
      usesTab: false,
      isPercussion: false,
    };

    const measures: Measure[] = [];
    let measureNum = 0;
    for (const measureEl of partEl.querySelectorAll('measure')) {
      measureNum++;
      const { measure, attributes } = parseMeasure(measureEl, measureNum);
      measures.push(measure);

      // Update instrument config from first measure's clef
      if (measureNum === 1 && attributes?.clef) {
        instrument.clef = attributes.clef;
        if (attributes.clef.sign === 'TAB') {
          instrument.usesTab = true;
        }
        if (attributes.clef.sign === 'percussion') {
          instrument.isPercussion = true;
          instrument.midiChannel = 9;
        }
      }
    }

    parts.push({
      id: partId,
      instrument,
      measures,
    });
  }

  return {
    meta: { title, composer },
    parts,
  };
}

import type {
  Score,
  Part,
  Measure,
  Note,
  Rest,
  NoteOrRest,
  MeasureAttributes,
  Direction,
  Barline,
} from '@/types/index.ts';

// ─── XML Helpers ────────────────────────────────────────────

function el(tag: string, children: string = '', attrs: Record<string, string> = {}): string {
  const attrStr = Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${escapeXml(v)}"`)
    .join('');
  if (!children) return `<${tag}${attrStr}/>`;
  return `<${tag}${attrStr}>${children}</${tag}>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Duration to divisions ──────────────────────────────────

const DURATION_DIVISIONS: Record<string, number> = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  '16th': 0.25,
  '32nd': 0.125,
  '64th': 0.0625,
};

function durationToDivisions(dur: string, dots: number, divisions: number): number {
  let base = (DURATION_DIVISIONS[dur] ?? 1) * divisions;
  let add = base;
  for (let i = 0; i < dots; i++) {
    add /= 2;
    base += add;
  }
  return Math.round(base);
}

// ─── Serialize Components ───────────────────────────────────

function serializeAttributes(attrs: MeasureAttributes, divisions: number): string {
  const parts: string[] = [];

  if (attrs.divisions !== undefined) {
    parts.push(el('divisions', String(divisions)));
  }

  if (attrs.key) {
    parts.push(
      el('key', el('fifths', String(attrs.key.fifths)) + (attrs.key.mode ? el('mode', attrs.key.mode) : ''))
    );
  }

  if (attrs.time) {
    parts.push(
      el('time', el('beats', String(attrs.time.beats)) + el('beat-type', String(attrs.time.beatType)))
    );
  }

  if (attrs.staves !== undefined) {
    parts.push(el('staves', String(attrs.staves)));
  }

  if (attrs.clef) {
    const clefContent = el('sign', attrs.clef.sign) + el('line', String(attrs.clef.line));
    parts.push(el('clef', clefContent));
  }

  return el('attributes', parts.join(''));
}

function serializeNote(noteOrRest: NoteOrRest, divisions: number): string {
  const parts: string[] = [];

  if (noteOrRest.type === 'note') {
    const note = noteOrRest as Note;

    if (note.isChord) {
      parts.push('<chord/>');
    }

    if (note.unpitched) {
      parts.push(
        el(
          'unpitched',
          el('display-step', note.unpitched.displayStep) +
            el('display-octave', String(note.unpitched.displayOctave)),
        ),
      );
    } else {
      const pitchParts = [
        el('step', note.pitch.step),
        ...(note.pitch.alter !== undefined ? [el('alter', String(note.pitch.alter))] : []),
        el('octave', String(note.pitch.octave)),
      ];
      parts.push(el('pitch', pitchParts.join('')));
    }

    parts.push(el('duration', String(durationToDivisions(note.duration, note.dots, divisions))));

    if (note.tie) {
      if (note.tie === 'start' || note.tie === 'start-stop') {
        parts.push(el('tie', '', { type: 'start' }));
      }
      if (note.tie === 'stop' || note.tie === 'start-stop') {
        parts.push(el('tie', '', { type: 'stop' }));
      }
    }

    parts.push(el('voice', String(note.voice)));
    parts.push(el('type', note.duration));

    for (let i = 0; i < note.dots; i++) {
      parts.push('<dot/>');
    }

    if (note.accidental) {
      parts.push(el('accidental', note.accidental));
    }

    // Notations (tied, technical)
    const notations: string[] = [];
    if (note.tie) {
      if (note.tie === 'start' || note.tie === 'start-stop') {
        notations.push(el('tied', '', { type: 'start' }));
      }
      if (note.tie === 'stop' || note.tie === 'start-stop') {
        notations.push(el('tied', '', { type: 'stop' }));
      }
    }

    if (note.tabString !== undefined || note.tabFret !== undefined) {
      const tech: string[] = [];
      if (note.tabString !== undefined) tech.push(el('string', String(note.tabString)));
      if (note.tabFret !== undefined) tech.push(el('fret', String(note.tabFret)));
      notations.push(el('technical', tech.join('')));
    }

    if (notations.length > 0) {
      parts.push(el('notations', notations.join('')));
    }
  } else {
    // Rest
    const rest = noteOrRest as Rest;
    parts.push('<rest/>');
    parts.push(el('duration', String(durationToDivisions(rest.duration, rest.dots, divisions))));
    parts.push(el('voice', String(rest.voice)));
    parts.push(el('type', rest.duration));
    for (let i = 0; i < rest.dots; i++) {
      parts.push('<dot/>');
    }
  }

  return el('note', parts.join(''));
}

function serializeDirection(dir: Direction): string {
  const parts: string[] = [];

  switch (dir.kind) {
    case 'tempo':
      parts.push(el('direction-type', el('words', dir.text ?? `♩ = ${dir.bpm}`)));
      parts.push(el('sound', '', { tempo: String(dir.bpm) }));
      break;
    case 'dynamic':
      parts.push(el('direction-type', el('dynamics', `<${dir.level}/>`)));
      break;
    case 'wedge':
      parts.push(el('direction-type', el('wedge', '', { type: dir.wedgeType })));
      break;
    case 'rehearsal':
      parts.push(el('direction-type', el('rehearsal', dir.text)));
      break;
  }

  return el('direction', parts.join(''));
}

function serializeBarline(barline: Barline): string {
  const parts: string[] = [];

  const barStyleMap: Record<string, string> = {
    regular: 'regular',
    double: 'light-light',
    final: 'light-heavy',
    'repeat-forward': 'heavy-light',
    'repeat-backward': 'light-heavy',
    'repeat-both': 'heavy-heavy',
  };
  parts.push(el('bar-style', barStyleMap[barline.type] ?? 'regular'));

  if (barline.repeat) {
    const attrs: Record<string, string> = { direction: barline.repeat.direction };
    if (barline.repeat.times) attrs.times = String(barline.repeat.times);
    parts.push(el('repeat', '', attrs));
  }

  if (barline.ending) {
    parts.push(
      el('ending', '', {
        number: String(barline.ending.number),
        type: barline.ending.type,
      }),
    );
  }

  const location = barline.type === 'repeat-forward' ? 'left' : 'right';
  return el('barline', parts.join(''), { location });
}

function serializeMeasure(measure: Measure, divisions: number): string {
  const parts: string[] = [];

  if (measure.attributes) {
    parts.push(serializeAttributes(measure.attributes, divisions));
  }

  for (const dir of measure.directions) {
    parts.push(serializeDirection(dir));
  }

  for (const note of measure.notes) {
    parts.push(serializeNote(note, divisions));
  }

  if (measure.barline) {
    parts.push(serializeBarline(measure.barline));
  }

  return el('measure', parts.join(''), { number: String(measure.number) });
}

function serializePart(part: Part, divisions: number): string {
  const measures = part.measures.map((m) => serializeMeasure(m, divisions)).join('');
  return el('part', measures, { id: part.id });
}

function serializePartList(parts: Part[]): string {
  const scoreParts = parts.map((part) => {
    const inst = part.instrument;
    const midiParts = [
      el('midi-channel', String(inst.midiChannel + 1)),
      el('midi-program', String(inst.gmProgram + 1)),
    ];
    return el(
      'score-part',
      el('part-name', inst.name) +
        el('part-abbreviation', inst.abbreviation) +
        el('midi-instrument', midiParts.join(''), { id: `${part.id}-inst` }),
      { id: part.id },
    );
  });
  return el('part-list', scoreParts.join(''));
}

// ─── Main Serializer ────────────────────────────────────────

export function serializeToMusicXML(score: Score): string {
  const divisions = 4; // quarter note = 4 divisions

  const header = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const doctype =
    '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN"\n  "http://www.musicxml.org/dtds/partwise.dtd">\n';

  const work = score.meta.title ? el('work', el('work-title', score.meta.title)) : '';

  const identification = score.meta.composer
    ? el('identification', el('creator', score.meta.composer, { type: 'composer' }))
    : '';

  const partList = serializePartList(score.parts);
  const parts = score.parts.map((p) => serializePart(p, divisions)).join('');

  const body = [work, identification, partList, parts].filter(Boolean).join('');
  const scoreXml = el('score-partwise', body, { version: '4.0' });

  return header + doctype + scoreXml;
}

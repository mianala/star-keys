import type {
  Score,
  Part,
  Measure,
  Note,
  Rest,
  Pitch,
  NoteDuration,
  Step,
  TimeSignature,
  Direction,
  TempoDirection,
} from '@/types/index.ts';
import { uid, PIANO } from '@/core/score/index.ts';

// ─── Constants ──────────────────────────────────────────────

/** Standard PPQ reference used internally for quantization. */
const REFERENCE_PPQ = 480;

/** Map from MIDI note number mod 12 to pitch step + alter (using sharps). */
const MIDI_TO_PITCH: { step: Step; alter?: number }[] = [
  { step: 'C' },
  { step: 'C', alter: 1 },
  { step: 'D' },
  { step: 'D', alter: 1 },
  { step: 'E' },
  { step: 'F' },
  { step: 'F', alter: 1 },
  { step: 'G' },
  { step: 'G', alter: 1 },
  { step: 'A' },
  { step: 'A', alter: 1 },
  { step: 'B' },
];

/** Duration values in ticks at REFERENCE_PPQ (480). */
const DURATION_TICK_TABLE: { name: NoteDuration; ticks: number }[] = [
  { name: 'whole', ticks: 1920 },
  { name: 'half', ticks: 960 },
  { name: 'quarter', ticks: 480 },
  { name: 'eighth', ticks: 240 },
  { name: '16th', ticks: 120 },
  { name: '32nd', ticks: 60 },
  { name: '64th', ticks: 30 },
];

/** Dotted duration table (base + half = 1.5x). */
const DOTTED_TICK_TABLE: { name: NoteDuration; dots: number; ticks: number }[] = [
  // Double-dotted values (1.75x)
  { name: 'whole', dots: 2, ticks: 3360 },
  { name: 'half', dots: 2, ticks: 1680 },
  { name: 'quarter', dots: 2, ticks: 840 },
  { name: 'eighth', dots: 2, ticks: 420 },
  { name: '16th', dots: 2, ticks: 210 },
  { name: '32nd', dots: 2, ticks: 105 },
  // Single-dotted values (1.5x)
  { name: 'whole', dots: 1, ticks: 2880 },
  { name: 'half', dots: 1, ticks: 1440 },
  { name: 'quarter', dots: 1, ticks: 720 },
  { name: 'eighth', dots: 1, ticks: 360 },
  { name: '16th', dots: 1, ticks: 180 },
  { name: '32nd', dots: 1, ticks: 90 },
  // Plain values
  ...DURATION_TICK_TABLE.map((d) => ({ ...d, dots: 0 })),
];

// ─── Low-Level MIDI Parsing ─────────────────────────────────

/** DataView reader with a moving cursor. */
class MidiReader {
  private readonly view: DataView;
  private _pos = 0;

  constructor(buffer: ArrayBuffer) {
    this.view = new DataView(buffer);
  }

  get pos(): number {
    return this._pos;
  }
  set pos(v: number) {
    this._pos = v;
  }

  get remaining(): number {
    return this.view.byteLength - this._pos;
  }

  readUint8(): number {
    const v = this.view.getUint8(this._pos);
    this._pos += 1;
    return v;
  }

  readUint16(): number {
    const v = this.view.getUint16(this._pos, false);
    this._pos += 2;
    return v;
  }

  readUint32(): number {
    const v = this.view.getUint32(this._pos, false);
    this._pos += 4;
    return v;
  }

  readString(length: number): string {
    let s = '';
    for (let i = 0; i < length; i++) {
      s += String.fromCharCode(this.view.getUint8(this._pos + i));
    }
    this._pos += length;
    return s;
  }

  readBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(this.view.buffer, this.view.byteOffset + this._pos, length);
    this._pos += length;
    return new Uint8Array(bytes); // Copy to detach from source
  }

  /** Read a MIDI variable-length quantity. */
  readVLQ(): number {
    let value = 0;
    let byte: number;
    do {
      byte = this.readUint8();
      value = (value << 7) | (byte & 0x7f);
    } while (byte & 0x80);
    return value;
  }
}

// ─── Parsed Event Types ─────────────────────────────────────

interface MidiNoteOn {
  kind: 'noteOn';
  tick: number;
  channel: number;
  note: number;
  velocity: number;
}

interface MidiNoteOff {
  kind: 'noteOff';
  tick: number;
  channel: number;
  note: number;
}

interface MidiTempo {
  kind: 'tempo';
  tick: number;
  bpm: number;
}

interface MidiTimeSig {
  kind: 'timeSig';
  tick: number;
  numerator: number;
  denominator: number;
}

interface MidiProgramChange {
  kind: 'programChange';
  tick: number;
  channel: number;
  program: number;
}

interface MidiTrackName {
  kind: 'trackName';
  tick: number;
  name: string;
}

interface MidiEndOfTrack {
  kind: 'endOfTrack';
  tick: number;
}

type MidiEvent =
  | MidiNoteOn
  | MidiNoteOff
  | MidiTempo
  | MidiTimeSig
  | MidiProgramChange
  | MidiTrackName
  | MidiEndOfTrack;

// ─── Header Parsing ─────────────────────────────────────────

interface MidiHeader {
  format: number;
  numTracks: number;
  ppq: number;
}

function parseHeader(reader: MidiReader): MidiHeader {
  const chunk = reader.readString(4);
  if (chunk !== 'MThd') {
    throw new Error(`Invalid MIDI file: expected MThd, got "${chunk}"`);
  }
  const headerLength = reader.readUint32();
  if (headerLength < 6) {
    throw new Error(`Invalid MThd header length: ${headerLength}`);
  }
  const format = reader.readUint16();
  const numTracks = reader.readUint16();
  const division = reader.readUint16();

  // Skip any extra header bytes beyond the standard 6
  if (headerLength > 6) {
    reader.pos += headerLength - 6;
  }

  // We only support ticks-per-quarter (bit 15 = 0)
  if (division & 0x8000) {
    throw new Error('SMPTE time division is not supported; only ticks-per-quarter-note is supported');
  }

  return { format, numTracks, ppq: division };
}

// ─── Track Parsing ──────────────────────────────────────────

function parseTrack(reader: MidiReader): MidiEvent[] {
  const chunk = reader.readString(4);
  if (chunk !== 'MTrk') {
    throw new Error(`Expected MTrk chunk, got "${chunk}"`);
  }
  const trackLength = reader.readUint32();
  const trackEnd = reader.pos + trackLength;

  const events: MidiEvent[] = [];
  let tick = 0;
  let runningStatus = 0;

  while (reader.pos < trackEnd) {
    const delta = reader.readVLQ();
    tick += delta;

    let statusByte = reader.readUint8();

    // Handle running status: if high bit not set, it's a data byte
    if (statusByte < 0x80) {
      // Re-use previous status; back up one byte
      reader.pos -= 1;
      statusByte = runningStatus;
    } else {
      // Don't update running status for system messages
      if (statusByte < 0xf0) {
        runningStatus = statusByte;
      }
    }

    const type = statusByte & 0xf0;
    const channel = statusByte & 0x0f;

    if (statusByte === 0xff) {
      // Meta event
      const metaType = reader.readUint8();
      const metaLength = reader.readVLQ();
      const metaStart = reader.pos;

      if (metaType === 0x03) {
        // Track name
        const name = reader.readString(metaLength);
        events.push({ kind: 'trackName', tick, name });
      } else if (metaType === 0x51 && metaLength === 3) {
        // Tempo
        const b0 = reader.readUint8();
        const b1 = reader.readUint8();
        const b2 = reader.readUint8();
        const usPerBeat = (b0 << 16) | (b1 << 8) | b2;
        const bpm = Math.round(60_000_000 / usPerBeat);
        events.push({ kind: 'tempo', tick, bpm });
      } else if (metaType === 0x58 && metaLength >= 2) {
        // Time signature
        const numerator = reader.readUint8();
        const denomLog = reader.readUint8();
        const denominator = 1 << denomLog;
        events.push({ kind: 'timeSig', tick, numerator, denominator });
        // Skip remaining bytes (clocks per click, 32nds per quarter)
        reader.pos = metaStart + metaLength;
      } else if (metaType === 0x2f) {
        // End of track
        events.push({ kind: 'endOfTrack', tick });
        reader.pos = metaStart + metaLength;
        break;
      } else {
        // Skip unknown meta events
        reader.pos = metaStart + metaLength;
      }
    } else if (statusByte === 0xf0 || statusByte === 0xf7) {
      // SysEx event - skip
      const sysexLength = reader.readVLQ();
      reader.pos += sysexLength;
    } else if (type === 0x90) {
      // Note on
      const note = reader.readUint8();
      const velocity = reader.readUint8();
      if (velocity === 0) {
        // Note on with velocity 0 is treated as note off
        events.push({ kind: 'noteOff', tick, channel, note });
      } else {
        events.push({ kind: 'noteOn', tick, channel, note, velocity });
      }
    } else if (type === 0x80) {
      // Note off
      const note = reader.readUint8();
      reader.readUint8(); // velocity (ignored)
      events.push({ kind: 'noteOff', tick, channel, note });
    } else if (type === 0xc0) {
      // Program change (1 data byte)
      const program = reader.readUint8();
      events.push({ kind: 'programChange', tick, channel, program });
    } else if (type === 0xd0) {
      // Channel pressure (1 data byte) - skip
      reader.readUint8();
    } else if (type === 0xa0 || type === 0xb0 || type === 0xe0) {
      // Poly aftertouch, control change, pitch bend (2 data bytes) - skip
      reader.readUint8();
      reader.readUint8();
    } else {
      // Unknown status, try to skip - this shouldn't normally happen
      // in well-formed MIDI files
    }
  }

  // Ensure reader is at the end of the track chunk
  reader.pos = trackEnd;

  return events;
}

// ─── Tick Scaling ───────────────────────────────────────────

/** Scale all tick values from file PPQ to reference PPQ (480). */
function scaleEvents(events: MidiEvent[], filePpq: number): MidiEvent[] {
  if (filePpq === REFERENCE_PPQ) return events;
  const ratio = REFERENCE_PPQ / filePpq;
  return events.map((e) => {
    const scaled = { ...e, tick: Math.round(e.tick * ratio) };
    return scaled;
  });
}

// ─── Note Pairing ───────────────────────────────────────────

interface PairedNote {
  channel: number;
  midiNote: number;
  velocity: number;
  startTick: number;
  endTick: number;
  durationTicks: number;
}

function pairNotes(events: MidiEvent[]): PairedNote[] {
  const paired: PairedNote[] = [];
  // Map: channel -> note -> array of pending note-on events
  const pending = new Map<number, Map<number, MidiNoteOn[]>>();

  for (const ev of events) {
    if (ev.kind === 'noteOn') {
      let channelMap = pending.get(ev.channel);
      if (!channelMap) {
        channelMap = new Map();
        pending.set(ev.channel, channelMap);
      }
      let noteStack = channelMap.get(ev.note);
      if (!noteStack) {
        noteStack = [];
        channelMap.set(ev.note, noteStack);
      }
      noteStack.push(ev);
    } else if (ev.kind === 'noteOff') {
      const channelMap = pending.get(ev.channel);
      if (!channelMap) continue;
      const noteStack = channelMap.get(ev.note);
      if (!noteStack || noteStack.length === 0) continue;
      // FIFO: match earliest pending note-on
      const noteOn = noteStack.shift()!;
      paired.push({
        channel: ev.channel,
        midiNote: ev.note,
        velocity: noteOn.velocity,
        startTick: noteOn.tick,
        endTick: ev.tick,
        durationTicks: ev.tick - noteOn.tick,
      });
    }
  }

  // Sort by start time, then by pitch ascending
  paired.sort((a, b) => a.startTick - b.startTick || a.midiNote - b.midiNote);

  return paired;
}

// ─── Quantization ───────────────────────────────────────────

interface QuantizedDuration {
  name: NoteDuration;
  dots: number;
}

/**
 * Quantize a tick duration to the nearest standard rhythmic value.
 * Considers plain and dotted durations.
 */
function quantizeDuration(ticks: number): QuantizedDuration {
  if (ticks <= 0) {
    return { name: '32nd', dots: 0 };
  }

  let bestMatch = DOTTED_TICK_TABLE[DOTTED_TICK_TABLE.length - 1];
  let bestDiff = Math.abs(ticks - bestMatch.ticks);

  for (const entry of DOTTED_TICK_TABLE) {
    const diff = Math.abs(ticks - entry.ticks);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestMatch = entry;
    }
  }

  return { name: bestMatch.name, dots: bestMatch.dots };
}

/**
 * Quantize a tick position to the nearest grid position.
 * Grid resolution is 32nd notes (60 ticks at PPQ=480).
 */
function quantizePosition(tick: number): number {
  const grid = 60; // 32nd note resolution
  return Math.round(tick / grid) * grid;
}

// ─── MIDI Note to Pitch ─────────────────────────────────────

function midiNoteToPitch(midiNote: number): Pitch {
  const octave = Math.floor(midiNote / 12) - 1;
  const pitchClass = midiNote % 12;
  const mapping = MIDI_TO_PITCH[pitchClass];
  return {
    step: mapping.step,
    octave,
    ...(mapping.alter !== undefined ? { alter: mapping.alter } : {}),
  };
}

// ─── Tempo / Time Signature Extraction ──────────────────────

interface TempoChange {
  tick: number;
  bpm: number;
}

interface TimeSigChange {
  tick: number;
  numerator: number;
  denominator: number;
}

function extractTempoChanges(allTrackEvents: MidiEvent[][]): TempoChange[] {
  const changes: TempoChange[] = [];
  for (const track of allTrackEvents) {
    for (const ev of track) {
      if (ev.kind === 'tempo') {
        changes.push({ tick: ev.tick, bpm: ev.bpm });
      }
    }
  }
  changes.sort((a, b) => a.tick - b.tick);
  // Default: 120 BPM if none specified
  if (changes.length === 0) {
    changes.push({ tick: 0, bpm: 120 });
  }
  return changes;
}

function extractTimeSigChanges(allTrackEvents: MidiEvent[][]): TimeSigChange[] {
  const changes: TimeSigChange[] = [];
  for (const track of allTrackEvents) {
    for (const ev of track) {
      if (ev.kind === 'timeSig') {
        changes.push({ tick: ev.tick, numerator: ev.numerator, denominator: ev.denominator });
      }
    }
  }
  changes.sort((a, b) => a.tick - b.tick);
  // Default: 4/4 if none specified
  if (changes.length === 0) {
    changes.push({ tick: 0, numerator: 4, denominator: 4 });
  }
  return changes;
}

function extractTitle(allTrackEvents: MidiEvent[][]): string {
  // Title is usually the track name of the first track (or tempo track)
  for (const track of allTrackEvents) {
    for (const ev of track) {
      if (ev.kind === 'trackName' && ev.name.trim()) {
        return ev.name.trim();
      }
    }
  }
  return 'Imported MIDI';
}

// ─── Measure Builder ────────────────────────────────────────

/**
 * Calculate the length of a measure in ticks given its time signature.
 * At PPQ=480: a quarter note is 480 ticks.
 */
function measureTickLength(timeSig: TimeSignature): number {
  // Each beat unit = (REFERENCE_PPQ * 4) / beatType ticks
  // Total = beats * (REFERENCE_PPQ * 4) / beatType
  return timeSig.beats * Math.round((REFERENCE_PPQ * 4) / timeSig.beatType);
}

/**
 * Get the active time signature at a given tick.
 */
function getTimeSigAtTick(tick: number, changes: TimeSigChange[]): TimeSigChange {
  let active = changes[0];
  for (const change of changes) {
    if (change.tick <= tick) {
      active = change;
    } else {
      break;
    }
  }
  return active;
}

/**
 * Compute measure boundaries (start ticks) for the entire piece.
 * Returns an array of { startTick, timeSig } for each measure.
 */
interface MeasureBoundary {
  startTick: number;
  timeSig: TimeSignature;
}

function computeMeasureBoundaries(
  totalTicks: number,
  timeSigChanges: TimeSigChange[],
): MeasureBoundary[] {
  const boundaries: MeasureBoundary[] = [];
  let tick = 0;

  while (tick <= totalTicks) {
    const sigChange = getTimeSigAtTick(tick, timeSigChanges);
    const timeSig: TimeSignature = {
      beats: sigChange.numerator,
      beatType: sigChange.denominator,
    };
    boundaries.push({ startTick: tick, timeSig });
    const mLen = measureTickLength(timeSig);
    tick += mLen;
  }

  return boundaries;
}

/**
 * Find the measure index for a given tick.
 */
function findMeasureIndex(tick: number, boundaries: MeasureBoundary[]): number {
  for (let i = boundaries.length - 1; i >= 0; i--) {
    if (tick >= boundaries[i].startTick) {
      return i;
    }
  }
  return 0;
}

// ─── Duration Fitting ───────────────────────────────────────

/** Get tick count for a NoteDuration + dots. */
function durationToTicks(dur: NoteDuration, dots: number): number {
  const entry = DURATION_TICK_TABLE.find((d) => d.name === dur);
  if (!entry) return REFERENCE_PPQ;
  let total = entry.ticks;
  let add = total;
  for (let i = 0; i < dots; i++) {
    add = Math.floor(add / 2);
    total += add;
  }
  return total;
}

/**
 * Split a duration in ticks into a sequence of notes/rests that fit within
 * measure boundaries. This handles notes that cross barlines by splitting
 * them with ties (for notes) or multiple rests.
 */
function splitDurationIntoSegments(
  startTick: number,
  totalTicks: number,
  boundaries: MeasureBoundary[],
): { measureIndex: number; offsetInMeasure: number; duration: NoteDuration; dots: number }[] {
  const segments: { measureIndex: number; offsetInMeasure: number; duration: NoteDuration; dots: number }[] = [];
  let remaining = totalTicks;
  let currentTick = startTick;

  while (remaining > 0) {
    const mIdx = findMeasureIndex(currentTick, boundaries);
    const boundary = boundaries[mIdx];
    const mLen = measureTickLength(boundary.timeSig);
    const offsetInMeasure = currentTick - boundary.startTick;
    const ticksLeftInMeasure = mLen - offsetInMeasure;

    const segmentTicks = Math.min(remaining, ticksLeftInMeasure);
    const quantized = quantizeDuration(segmentTicks);

    // Ensure the quantized duration does not exceed the remaining ticks
    let actualTicks = durationToTicks(quantized.name, quantized.dots);
    let finalDuration = quantized.name;
    let finalDots = quantized.dots;
    if (actualTicks > remaining || actualTicks > ticksLeftInMeasure) {
      // Fall back to the largest fitting undotted duration
      const cap = Math.min(remaining, ticksLeftInMeasure);
      for (const entry of DURATION_TICK_TABLE) {
        if (entry.ticks <= cap) {
          finalDuration = entry.name;
          finalDots = 0;
          actualTicks = entry.ticks;
          break;
        }
      }
    }

    segments.push({
      measureIndex: mIdx,
      offsetInMeasure,
      duration: finalDuration,
      dots: finalDots,
    });

    remaining -= actualTicks;
    currentTick += actualTicks;
  }

  return segments;
}

// ─── Building Score from Paired Notes ───────────────────────

/**
 * Build measures for a single part from paired notes.
 */
function buildMeasures(
  pairedNotes: PairedNote[],
  boundaries: MeasureBoundary[],
  tempoChanges: TempoChange[],
  timeSigChanges: TimeSigChange[],
): Measure[] {
  const measures: Measure[] = [];

  // Pre-create all measures
  for (let i = 0; i < boundaries.length; i++) {
    const boundary = boundaries[i];
    const isFirst = i === 0;

    // Check if there's a time sig change at this boundary
    const timeSigHere = timeSigChanges.find((ts) => ts.tick === boundary.startTick);
    const tempoHere = tempoChanges.find((t) => t.tick === boundary.startTick);

    const measure: Measure = {
      number: i + 1,
      notes: [],
      directions: [],
    };

    // Set attributes on first measure or when time sig changes
    if (isFirst || timeSigHere) {
      measure.attributes = {
        divisions: 1,
        clef: isFirst ? { sign: 'G', line: 2 } : undefined,
        key: isFirst ? { fifths: 0, mode: 'major' } : undefined,
        time: {
          beats: boundary.timeSig.beats,
          beatType: boundary.timeSig.beatType,
        },
      };
    }

    // Add tempo direction if there's a tempo change here
    if (tempoHere) {
      const tempoDir: TempoDirection = {
        kind: 'tempo',
        bpm: tempoHere.bpm,
      };
      measure.directions.push(tempoDir);
    }

    measures.push(measure);
  }

  // Group notes by their quantized start position to detect chords
  const notesByStart = new Map<number, PairedNote[]>();
  for (const pn of pairedNotes) {
    const qStart = quantizePosition(pn.startTick);
    let group = notesByStart.get(qStart);
    if (!group) {
      group = [];
      notesByStart.set(qStart, group);
    }
    group.push(pn);
  }

  // Sort start positions
  const sortedStarts = Array.from(notesByStart.keys()).sort((a, b) => a - b);

  for (const startTick of sortedStarts) {
    const group = notesByStart.get(startTick)!;

    for (let ni = 0; ni < group.length; ni++) {
      const pn = group[ni];
      const qStart = quantizePosition(pn.startTick);
      const qDuration = Math.max(quantizePosition(pn.durationTicks), 60); // minimum 32nd note

      const segments = splitDurationIntoSegments(qStart, qDuration, boundaries);

      for (let si = 0; si < segments.length; si++) {
        const seg = segments[si];
        if (seg.measureIndex >= measures.length) continue;

        const pitch = midiNoteToPitch(pn.midiNote);
        const note: Note = {
          id: uid(),
          type: 'note',
          pitch,
          duration: seg.duration,
          dots: seg.dots,
          voice: 1,
          isChord: ni > 0,
        };

        // Handle ties for split notes
        if (segments.length > 1) {
          if (si === 0) {
            note.tie = 'start';
          } else if (si === segments.length - 1) {
            note.tie = 'stop';
          } else {
            note.tie = 'start-stop';
          }
        }

        // Add accidental display for altered pitches
        if (pitch.alter === 1) {
          note.accidental = 'sharp';
        } else if (pitch.alter === -1) {
          note.accidental = 'flat';
        }

        measures[seg.measureIndex].notes.push(note);
      }
    }
  }

  // Fill empty measures with whole rests
  for (let i = 0; i < measures.length; i++) {
    if (measures[i].notes.length === 0) {
      const rest: Rest = {
        id: uid(),
        type: 'rest',
        duration: 'whole',
        dots: 0,
        voice: 1,
        isFullMeasure: true,
      };
      measures[i].notes.push(rest);
    }
  }

  // Add final barline to last measure
  if (measures.length > 0) {
    measures[measures.length - 1].barline = { type: 'final' };
  }

  return measures;
}

// ─── Track Grouping for Format 1 ────────────────────────────

interface TrackGroup {
  name: string;
  channel: number;
  program: number;
  notes: PairedNote[];
}

/**
 * For Format 1 files: group note events by track.
 * Track 0 is typically the tempo/meta track.
 */
function groupTracksByPart(
  allTrackEvents: MidiEvent[][],
  format: number,
): TrackGroup[] {
  const groups: TrackGroup[] = [];

  if (format === 0) {
    // Format 0: single track, group by channel
    const channelNotes = new Map<number, PairedNote[]>();
    const channelPrograms = new Map<number, number>();
    const paired = pairNotes(allTrackEvents[0]);

    for (const ev of allTrackEvents[0]) {
      if (ev.kind === 'programChange') {
        channelPrograms.set(ev.channel, ev.program);
      }
    }

    for (const note of paired) {
      let notes = channelNotes.get(note.channel);
      if (!notes) {
        notes = [];
        channelNotes.set(note.channel, notes);
      }
      notes.push(note);
    }

    for (const [channel, notes] of channelNotes) {
      if (notes.length === 0) continue;
      groups.push({
        name: `Channel ${channel + 1}`,
        channel,
        program: channelPrograms.get(channel) ?? 0,
        notes,
      });
    }
  } else {
    // Format 1: each track (after tempo track) becomes a part
    for (let t = 0; t < allTrackEvents.length; t++) {
      const trackEvents = allTrackEvents[t];
      const paired = pairNotes(trackEvents);
      if (paired.length === 0) continue; // Skip empty tracks (e.g. tempo track)

      let name = `Track ${t + 1}`;
      let program = 0;
      let channel = 0;

      for (const ev of trackEvents) {
        if (ev.kind === 'trackName' && ev.name.trim()) {
          name = ev.name.trim();
        }
        if (ev.kind === 'programChange') {
          program = ev.program;
          channel = ev.channel;
        }
      }

      // Infer channel from note events if no program change
      if (paired.length > 0) {
        channel = paired[0].channel;
      }

      groups.push({ name, channel, program, notes: paired });
    }
  }

  return groups;
}

// ─── Main Import Function ───────────────────────────────────

/**
 * Parse a binary MIDI file (Format 0 or 1) from an ArrayBuffer and convert
 * it to the app's Score model.
 *
 * @param buffer - The raw MIDI file content as an ArrayBuffer
 * @returns A Score object ready for use in the application
 */
export function importMidi(buffer: ArrayBuffer): Score {
  const reader = new MidiReader(buffer);

  // 1. Parse header
  const header = parseHeader(reader);
  if (header.format > 1) {
    throw new Error(`MIDI Format ${header.format} is not supported; only Format 0 and 1 are supported`);
  }

  // 2. Parse all tracks
  const allTrackEvents: MidiEvent[][] = [];
  for (let t = 0; t < header.numTracks; t++) {
    if (reader.remaining < 8) break;
    const events = parseTrack(reader);
    // Scale ticks to reference PPQ
    allTrackEvents.push(scaleEvents(events, header.ppq));
  }

  // 3. Extract global metadata
  const title = extractTitle(allTrackEvents);
  const tempoChanges = extractTempoChanges(allTrackEvents);
  const timeSigChanges = extractTimeSigChanges(allTrackEvents);

  // 4. Group notes into parts
  const trackGroups = groupTracksByPart(allTrackEvents, header.format);

  // 5. Find total tick span
  let maxTick = 0;
  for (const group of trackGroups) {
    for (const note of group.notes) {
      if (note.endTick > maxTick) maxTick = note.endTick;
    }
  }

  // 6. Compute measure boundaries
  const boundaries = computeMeasureBoundaries(maxTick, timeSigChanges);

  // 7. Build parts
  const parts = trackGroups.map((group): Part => {
    const instrument = {
      ...PIANO,
      id: `midi-${group.channel}-${uid()}`,
      name: group.name,
      abbreviation: group.name.substring(0, 4) + '.',
      gmProgram: group.program,
      midiChannel: group.channel,
      isPercussion: group.channel === 9,
      clef: group.channel === 9
        ? { sign: 'percussion' as const, line: 3 }
        : { sign: 'G' as const, line: 2 },
    };

    const measures = buildMeasures(
      group.notes,
      boundaries,
      tempoChanges,
      timeSigChanges,
    );

    return {
      id: `part_${uid()}`,
      instrument,
      measures,
    };
  });

  // 8. If no parts found, create an empty one
  if (parts.length === 0) {
    const emptyMeasure: Measure = {
      number: 1,
      attributes: {
        divisions: 1,
        clef: PIANO.clef,
        key: { fifths: 0, mode: 'major' },
        time: { beats: 4, beatType: 4 },
      },
      notes: [{
        id: uid(),
        type: 'rest',
        duration: 'whole',
        dots: 0,
        voice: 1,
        isFullMeasure: true,
      }],
      directions: [],
      barline: { type: 'final' },
    };

    parts.push({
      id: `part_${uid()}`,
      instrument: PIANO,
      measures: [emptyMeasure],
    });
  }

  // 9. Add initial tempo direction to first measure if not already present
  if (parts.length > 0 && tempoChanges.length > 0) {
    const firstMeasure = parts[0].measures[0];
    const hasTempo = firstMeasure.directions.some(
      (d: Direction) => d.kind === 'tempo',
    );
    if (!hasTempo) {
      const tempoDir: TempoDirection = {
        kind: 'tempo',
        bpm: tempoChanges[0].bpm,
      };
      firstMeasure.directions.unshift(tempoDir);
    }
  }

  return {
    meta: {
      title,
      composer: '',
    },
    parts,
  };
}

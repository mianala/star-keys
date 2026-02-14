import type { Score, Note, NoteOrRest } from '@/types/index.ts';

// Simple MIDI file writer (Format 1)
// Each track is a separate part + one tempo track

const STEP_TO_MIDI: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};

const DURATION_TICKS: Record<string, number> = {
  whole: 1920,
  half: 960,
  quarter: 480,
  eighth: 240,
  '16th': 120,
  '32nd': 60,
  '64th': 30,
};

function noteToMidi(note: Note): number {
  const step = STEP_TO_MIDI[note.pitch.step] ?? 0;
  return (note.pitch.octave + 1) * 12 + step + (note.pitch.alter ?? 0);
}

function durationTicks(noteOrRest: NoteOrRest): number {
  let base = DURATION_TICKS[noteOrRest.duration] ?? 480;
  let add = base;
  for (let i = 0; i < noteOrRest.dots; i++) {
    add = Math.floor(add / 2);
    base += add;
  }
  return base;
}

// Variable-length quantity encoder
function writeVLQ(value: number): number[] {
  if (value < 0) value = 0;
  const bytes: number[] = [];
  bytes.push(value & 0x7f);
  value >>= 7;
  while (value > 0) {
    bytes.push((value & 0x7f) | 0x80);
    value >>= 7;
  }
  return bytes.reverse();
}

function writeUint32(value: number): number[] {
  return [
    (value >> 24) & 0xff,
    (value >> 16) & 0xff,
    (value >> 8) & 0xff,
    value & 0xff,
  ];
}

function writeUint16(value: number): number[] {
  return [
    (value >> 8) & 0xff,
    value & 0xff,
  ];
}

function writeString(str: string): number[] {
  return Array.from(str).map((c) => c.charCodeAt(0));
}

function buildTempoTrack(score: Score, bpm: number): number[] {
  const events: number[] = [];

  // Track name: score title
  const titleBytes = writeString(score.meta.title || 'Untitled');
  events.push(...writeVLQ(0)); // delta=0
  events.push(0xff, 0x03); // Track name meta
  events.push(...writeVLQ(titleBytes.length));
  events.push(...titleBytes);

  // Tempo: microseconds per quarter note
  const usPerBeat = Math.round(60_000_000 / bpm);
  events.push(...writeVLQ(0)); // delta=0
  events.push(0xff, 0x51, 0x03); // Tempo meta
  events.push((usPerBeat >> 16) & 0xff, (usPerBeat >> 8) & 0xff, usPerBeat & 0xff);

  // Time signature from first measure
  const firstPart = score.parts[0];
  const time = firstPart?.measures[0]?.attributes?.time;
  const beats = time?.beats ?? 4;
  const beatType = time?.beatType ?? 4;
  const denomLog = Math.round(Math.log2(beatType));
  events.push(...writeVLQ(0));
  events.push(0xff, 0x58, 0x04); // Time sig meta
  events.push(beats, denomLog, 24, 8);

  // End of track
  events.push(...writeVLQ(0));
  events.push(0xff, 0x2f, 0x00);

  return events;
}

function buildPartTrack(score: Score, partIndex: number): number[] {
  const part = score.parts[partIndex];
  if (!part) return [];

  const events: number[] = [];
  const channel = Math.min(part.instrument.midiChannel, 15);

  // Track name
  const nameBytes = writeString(part.instrument.name);
  events.push(...writeVLQ(0));
  events.push(0xff, 0x03);
  events.push(...writeVLQ(nameBytes.length));
  events.push(...nameBytes);

  // Program change
  events.push(...writeVLQ(0));
  events.push(0xc0 | channel, part.instrument.gmProgram);

  // Walk through measures
  let tickPos = 0;
  let lastEventTick = 0;

  // Collect note-on/off events then sort
  const midiEvents: { tick: number; data: number[] }[] = [];

  for (const measure of part.measures) {
    let measureTick = tickPos;

    for (const noteOrRest of measure.notes) {
      const dur = durationTicks(noteOrRest);

      if (noteOrRest.type === 'note') {
        const note = noteOrRest as Note;
        if (!note.isChord) {
          tickPos = measureTick;
        }
        const midi = noteToMidi(note);
        const velocity = 80;

        midiEvents.push({
          tick: tickPos,
          data: [0x90 | channel, midi, velocity], // note on
        });
        midiEvents.push({
          tick: tickPos + dur,
          data: [0x80 | channel, midi, 0], // note off
        });
      }

      if (!noteOrRest.type || noteOrRest.type !== 'note' || !(noteOrRest as Note).isChord) {
        measureTick += dur;
      }
    }

    // Advance tick to at least the measure duration
    const time = measure.attributes?.time;
    const beatsInMeasure = time?.beats ?? 4;
    const beatType = time?.beatType ?? 4;
    const measureDuration = Math.round(beatsInMeasure * (1920 / beatType));
    tickPos = Math.max(measureTick, tickPos) ;
    if (tickPos < (tickPos - (tickPos % measureDuration)) + measureDuration) {
      // Ensure we align to measure boundaries
    }
    tickPos = Math.max(tickPos, measureTick);
  }

  // Sort events by tick
  midiEvents.sort((a, b) => a.tick - b.tick || (a.data[0] & 0xf0) - (b.data[0] & 0xf0));

  // Write sorted events with delta times
  for (const ev of midiEvents) {
    const delta = ev.tick - lastEventTick;
    events.push(...writeVLQ(delta));
    events.push(...ev.data);
    lastEventTick = ev.tick;
  }

  // End of track
  events.push(...writeVLQ(0));
  events.push(0xff, 0x2f, 0x00);

  return events;
}

export function exportMidi(score: Score, bpm: number): Uint8Array {
  const ppq = 480; // ticks per quarter note
  const numTracks = score.parts.length + 1; // +1 for tempo track

  // Build all tracks
  const tracks: number[][] = [];
  tracks.push(buildTempoTrack(score, bpm));
  for (let i = 0; i < score.parts.length; i++) {
    tracks.push(buildPartTrack(score, i));
  }

  // Calculate total size
  let totalSize = 14; // MThd header (14 bytes)
  for (const track of tracks) {
    totalSize += 8 + track.length; // MTrk header (8 bytes) + data
  }

  const buffer = new Uint8Array(totalSize);
  let pos = 0;

  // MThd header
  const mthd = [...writeString('MThd'), ...writeUint32(6), ...writeUint16(1), ...writeUint16(numTracks), ...writeUint16(ppq)];
  for (const b of mthd) buffer[pos++] = b;

  // Write each track
  for (const trackData of tracks) {
    const header = [...writeString('MTrk'), ...writeUint32(trackData.length)];
    for (const b of header) buffer[pos++] = b;
    for (const b of trackData) buffer[pos++] = b;
  }

  return buffer;
}

export function downloadMidi(score: Score, bpm: number, filename: string): void {
  const data = exportMidi(score, bpm);
  const blob = new Blob([data.buffer as ArrayBuffer], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.mid') ? filename : `${filename}.mid`;
  a.click();
  URL.revokeObjectURL(url);
}

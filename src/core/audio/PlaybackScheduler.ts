import type { Score, Note, NoteOrRest, DynamicLevel } from '@/types/index.ts';

// ─── Types ──────────────────────────────────────────────────

export interface ScheduledNoteEvent {
  time: number;       // seconds from start
  duration: number;   // seconds
  pitch: number;      // MIDI note number
  velocity: number;   // 0-127
  partIndex: number;
  channel: number;    // MIDI channel (9 for percussion)
}

export interface PositionEvent {
  time: number;
  measureIndex: number;
  noteIndex: number;
  partIndex: number;
}

export interface TempoMapEntry {
  measureOrderIndex: number; // index into measureOrder
  bpm: number;
  timeOffset: number;        // cumulative seconds at this measure start
}

// ─── Constants ──────────────────────────────────────────────

const STEP_TO_MIDI: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};

const DURATION_BEATS: Record<string, number> = {
  whole: 4, half: 2, quarter: 1, eighth: 0.5,
  '16th': 0.25, '32nd': 0.125, '64th': 0.0625,
};

const DYNAMIC_VELOCITY: Record<DynamicLevel, number> = {
  ppp: 16, pp: 33, p: 49, mp: 64,
  mf: 80, f: 96, ff: 112, fff: 127,
  sfz: 120, fp: 96, rfz: 112,
};

const UNPITCHED_MIDI: Record<string, number> = {
  // GM percussion map (display step+octave → MIDI note)
  'F5': 42,  // Closed Hi-Hat
  'G5': 44,  // Pedal Hi-Hat
  'A5': 46,  // Open Hi-Hat
  'C5': 49,  // Crash Cymbal
  'D5': 51,  // Ride Cymbal
  'E5': 53,  // Ride Bell
  'F4': 36,  // Bass Drum
  'C4': 38,  // Snare
  'E4': 40,  // Electric Snare
  'D4': 37,  // Side Stick
  'A4': 45,  // Low Tom
  'B4': 47,  // Mid Tom
  'G4': 43,  // High Floor Tom
  'B3': 41,  // Low Floor Tom
};

// ─── Helpers ────────────────────────────────────────────────

function noteToMidi(note: Note): number {
  const step = STEP_TO_MIDI[note.pitch.step] ?? 0;
  return (note.pitch.octave + 1) * 12 + step + (note.pitch.alter ?? 0);
}

function unpitchedToMidi(note: Note): number {
  if (!note.unpitched) return 38; // default snare
  const key = `${note.unpitched.displayStep}${note.unpitched.displayOctave}`;
  return UNPITCHED_MIDI[key] ?? 38;
}

function durationBeats(noteOrRest: NoteOrRest): number {
  let base = DURATION_BEATS[noteOrRest.duration] ?? 1;
  let add = base;
  for (let i = 0; i < noteOrRest.dots; i++) {
    add /= 2;
    base += add;
  }
  if (noteOrRest.type === 'note' && (noteOrRest as Note).tuplet) {
    const t = (noteOrRest as Note).tuplet!;
    base = base * t.normalNotes / t.actualNotes;
  }
  return base;
}

function hasFermata(noteOrRest: NoteOrRest): boolean {
  if (noteOrRest.type !== 'note') return false;
  return (noteOrRest as Note).articulations?.includes('fermata') ?? false;
}

// ─── Repeat / Navigation Resolution ────────────────────────

function resolveMeasureOrder(score: Score): number[] {
  const firstPart = score.parts[0];
  if (!firstPart) return [];

  const measureCount = firstPart.measures.length;
  const order: number[] = [];

  let i = 0;
  let repeatStart = 0;
  let repeated = false;

  // Track navigation marks
  let segnoIdx = -1;
  let codaIdx = -1;
  let fineIdx = -1;
  let navJump: string | null = null;

  // First pass: scan for segno, coda, fine positions
  for (let m = 0; m < measureCount; m++) {
    const measure = firstPart.measures[m];
    for (const dir of measure.directions) {
      if (dir.kind === 'navigation') {
        if (dir.mark === 'segno') segnoIdx = m;
        if (dir.mark === 'coda') codaIdx = m;
        if (dir.mark === 'fine') fineIdx = m;
      }
    }
  }

  // Walk through measures handling repeats
  while (i < measureCount) {
    const measure = firstPart.measures[i];

    // Check for repeat-forward barline
    if (measure.barline?.type === 'repeat-forward' || measure.barline?.repeat?.direction === 'forward') {
      repeatStart = i;
      repeated = false;
    }

    order.push(i);

    // Check for navigation jumps at this measure
    for (const dir of measure.directions) {
      if (dir.kind === 'navigation') {
        if (dir.mark === 'dacapo' || dir.mark === 'dacapo-al-fine' || dir.mark === 'dacapo-al-coda') {
          navJump = dir.mark;
        } else if (dir.mark === 'dalsegno' || dir.mark === 'dalsegno-al-fine' || dir.mark === 'dalsegno-al-coda') {
          navJump = dir.mark;
        } else if (dir.mark === 'tocoda') {
          // Jump to coda
          if (codaIdx >= 0) {
            i = codaIdx;
            continue;
          }
        }
      }
    }

    // Check for repeat-backward barline
    if (measure.barline?.type === 'repeat-backward' || measure.barline?.repeat?.direction === 'backward') {
      if (!repeated) {
        repeated = true;
        i = repeatStart;
        continue;
      }
      repeated = false;
    }

    // Check repeat-both (end + start)
    if (measure.barline?.type === 'repeat-both') {
      if (!repeated) {
        repeated = true;
        i = repeatStart;
        continue;
      }
      repeated = false;
      repeatStart = i;
    }

    i++;
  }

  // Handle navigation jumps after reaching the end
  if (navJump) {
    const jumpTarget = navJump.startsWith('dacapo') ? 0
      : navJump.startsWith('dalsegno') && segnoIdx >= 0 ? segnoIdx
      : -1;

    if (jumpTarget >= 0) {
      const endAt = navJump.includes('al-fine') && fineIdx >= 0 ? fineIdx
        : navJump.includes('al-coda') && codaIdx >= 0 ? codaIdx
        : measureCount - 1;

      for (let m = jumpTarget; m <= endAt; m++) {
        order.push(m);
      }

      // If al-coda, jump to coda section after tocoda
      if (navJump.includes('al-coda') && codaIdx >= 0) {
        for (let m = codaIdx; m < measureCount; m++) {
          order.push(m);
        }
      }
    }
  }

  return order;
}

// ─── PlaybackScheduler ─────────────────────────────────────

export class PlaybackScheduler {
  readonly events: ScheduledNoteEvent[] = [];
  readonly positionEvents: PositionEvent[] = [];
  readonly tempoMap: TempoMapEntry[] = [];
  readonly measureOrder: number[] = [];
  totalTime = 0;

  schedule(score: Score, initialBpm: number): void {
    this.events.length = 0;
    this.positionEvents.length = 0;
    this.tempoMap.length = 0;

    // Resolve play order
    const order = resolveMeasureOrder(score);
    (this.measureOrder as number[]) = order;

    if (order.length === 0) return;

    // Build tempo map
    let currentBpm = initialBpm;
    let cumulativeTime = 0;

    // Pre-scan for initial tempo from first measure
    const firstMeasure = score.parts[0]?.measures[order[0]];
    if (firstMeasure) {
      for (const dir of firstMeasure.directions) {
        if (dir.kind === 'tempo') {
          currentBpm = dir.bpm;
        }
      }
    }

    // Build tempo entries per measure in play order
    for (let oi = 0; oi < order.length; oi++) {
      const mi = order[oi];
      const measure = score.parts[0]?.measures[mi];
      if (!measure) continue;

      // Check for tempo changes in this measure
      for (const dir of measure.directions) {
        if (dir.kind === 'tempo') {
          currentBpm = dir.bpm;
        }
      }

      this.tempoMap.push({
        measureOrderIndex: oi,
        bpm: currentBpm,
        timeOffset: cumulativeTime,
      });

      // Compute measure duration in beats
      const timeSig = measure.attributes?.time;
      const beatsInMeasure = timeSig ? timeSig.beats : 4;
      const secPerBeat = 60 / currentBpm;
      cumulativeTime += beatsInMeasure * secPerBeat;
    }

    // Schedule events for each part
    for (let p = 0; p < score.parts.length; p++) {
      const part = score.parts[p];
      const isPerc = part.instrument.isPercussion;
      const channel = part.instrument.midiChannel;
      let runningVelocity = 80;

      for (let oi = 0; oi < order.length; oi++) {
        const mi = order[oi];
        const measure = part.measures[mi];
        if (!measure) continue;

        const tempoEntry = this.tempoMap[oi];
        if (!tempoEntry) continue;
        const secPerBeat = 60 / tempoEntry.bpm;
        const measureStartTime = tempoEntry.timeOffset;

        // Update dynamics from this measure's directions
        for (const dir of measure.directions) {
          if (dir.kind === 'dynamic') {
            runningVelocity = DYNAMIC_VELOCITY[dir.level] ?? 80;
          }
        }

        let beatOffset = 0;

        for (let ni = 0; ni < measure.notes.length; ni++) {
          const noteOrRest = measure.notes[ni];
          let durBeats = durationBeats(noteOrRest);
          const fermataMultiplier = hasFermata(noteOrRest) ? 1.75 : 1.0;
          const effectiveDurBeats = durBeats * fermataMultiplier;

          const eventTime = measureStartTime + beatOffset * secPerBeat;

          // Record position event (from first part only to avoid duplicates)
          if (p === 0) {
            this.positionEvents.push({
              time: eventTime,
              measureIndex: mi,
              noteIndex: ni,
              partIndex: 0,
            });
          }

          if (noteOrRest.type === 'note') {
            const note = noteOrRest as Note;

            // Skip chord notes for beat advancement (they share timing)
            if (note.isChord) {
              const prevTime = this.events.length > 0
                ? this.events[this.events.length - 1].time
                : eventTime;

              const midi = isPerc ? unpitchedToMidi(note) : noteToMidi(note);
              this.events.push({
                time: prevTime,
                duration: effectiveDurBeats * secPerBeat * 0.9,
                pitch: midi,
                velocity: runningVelocity,
                partIndex: p,
                channel,
              });
              continue; // Don't advance beat position for chords
            }

            const midi = isPerc ? unpitchedToMidi(note) : noteToMidi(note);
            this.events.push({
              time: eventTime,
              duration: effectiveDurBeats * secPerBeat * 0.9,
              pitch: midi,
              velocity: runningVelocity,
              partIndex: p,
              channel,
            });
          }

          beatOffset += durBeats;
        }
      }
    }

    // Calculate total time
    this.totalTime = this.events.reduce(
      (max, e) => Math.max(max, e.time + e.duration),
      0,
    );

    // Sort position events by time for binary search
    this.positionEvents.sort((a, b) => a.time - b.time);
  }

  /**
   * Binary search to find the position event for a given time.
   */
  getPositionAtTime(time: number): PositionEvent | null {
    const events = this.positionEvents;
    if (events.length === 0) return null;

    let lo = 0;
    let hi = events.length - 1;

    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      if (events[mid].time <= time) {
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    return hi >= 0 ? events[hi] : events[0];
  }

  /**
   * Get beats-per-measure and BPM info for metronome scheduling.
   */
  getMetronomeBeats(score: Score): Array<{ time: number; bpm: number; beat: number; beatsInMeasure: number }> {
    const beats: Array<{ time: number; bpm: number; beat: number; beatsInMeasure: number }> = [];
    const firstPart = score.parts[0];
    if (!firstPart) return beats;

    for (let oi = 0; oi < this.measureOrder.length; oi++) {
      const mi = this.measureOrder[oi];
      const measure = firstPart.measures[mi];
      if (!measure) continue;

      const tempoEntry = this.tempoMap[oi];
      if (!tempoEntry) continue;

      const timeSig = measure.attributes?.time;
      const beatsInMeasure = timeSig?.beats ?? 4;
      const secPerBeat = 60 / tempoEntry.bpm;

      for (let b = 0; b < beatsInMeasure; b++) {
        beats.push({
          time: tempoEntry.timeOffset + b * secPerBeat,
          bpm: tempoEntry.bpm,
          beat: b,
          beatsInMeasure,
        });
      }
    }

    return beats;
  }
}

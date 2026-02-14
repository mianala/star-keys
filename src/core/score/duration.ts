import type { NoteDuration, NoteOrRest, Measure, TimeSignature } from '@/types/index.ts';

// Duration values in quarter notes (divisions)
const DURATION_VALUES: Record<NoteDuration, number> = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  '16th': 0.25,
  '32nd': 0.125,
  '64th': 0.0625,
};

/**
 * Calculate the duration of a note or rest in quarter notes
 * Accounts for dots (each dot adds half the previous value)
 */
export function getDurationInQuarters(noteOrRest: NoteOrRest): number {
  const baseDuration = DURATION_VALUES[noteOrRest.duration];
  let total = baseDuration;

  // Add dot values (each dot adds half of the previous value)
  for (let i = 0; i < noteOrRest.dots; i++) {
    total += baseDuration / Math.pow(2, i + 1);
  }

  return total;
}

/**
 * Calculate the total duration of all notes in a measure in quarter notes
 * Treats a single full-measure rest as 0 duration (it's a placeholder)
 */
export function getMeasureDuration(measure: Measure): number {
  // If measure only contains a full-measure rest, treat as empty (0 duration)
  // because the full-measure rest will be removed when adding actual notes
  if (
    measure.notes.length === 1 &&
    measure.notes[0].type === 'rest' &&
    measure.notes[0].isFullMeasure
  ) {
    return 0;
  }

  return measure.notes.reduce((total, note) => {
    // Skip chord notes (they don't add to duration)
    if (note.type === 'note' && note.isChord) {
      return total;
    }
    return total + getDurationInQuarters(note);
  }, 0);
}

/**
 * Get the time signature for a measure, looking backwards if not defined locally
 */
export function getEffectiveTimeSignature(measure: Measure, previousMeasures: Measure[]): TimeSignature {
  // First check the measure's own attributes
  if (measure.attributes?.time) {
    return measure.attributes.time;
  }

  // Look backwards through previous measures
  for (let i = previousMeasures.length - 1; i >= 0; i--) {
    const prevMeasure = previousMeasures[i];
    if (prevMeasure?.attributes?.time) {
      return prevMeasure.attributes.time;
    }
  }

  // Default to 4/4
  return { beats: 4, beatType: 4 };
}

/**
 * Calculate the capacity of a measure in quarter notes based on its time signature
 */
export function getMeasureCapacity(timeSignature: TimeSignature): number {
  // Capacity = (beats / beatType) * 4 quarter notes
  // For 4/4: (4 / 4) * 4 = 4 quarter notes
  // For 3/4: (3 / 4) * 4 = 3 quarter notes
  // For 6/8: (6 / 8) * 4 = 3 quarter notes
  return (timeSignature.beats / timeSignature.beatType) * 4;
}

/**
 * Check if a measure has room for a note/rest of the given duration
 */
export function canAddToMeasure(
  measure: Measure,
  noteOrRest: NoteOrRest,
  previousMeasures: Measure[] = []
): boolean {
  const currentDuration = getMeasureDuration(measure);
  const newNoteDuration = getDurationInQuarters(noteOrRest);
  const timeSignature = getEffectiveTimeSignature(measure, previousMeasures);
  const capacity = getMeasureCapacity(timeSignature);

  return currentDuration + newNoteDuration <= capacity;
}

/**
 * Check if a measure is full (reached or exceeded capacity)
 */
export function isMeasureFull(measure: Measure, previousMeasures: Measure[] = []): boolean {
  const currentDuration = getMeasureDuration(measure);
  const timeSignature = getEffectiveTimeSignature(measure, previousMeasures);
  const capacity = getMeasureCapacity(timeSignature);

  return currentDuration >= capacity;
}

/**
 * Calculate remaining space in a measure in quarter notes
 */
export function getRemainingSpace(measure: Measure, previousMeasures: Measure[] = []): number {
  const currentDuration = getMeasureDuration(measure);
  const timeSignature = getEffectiveTimeSignature(measure, previousMeasures);
  const capacity = getMeasureCapacity(timeSignature);

  return Math.max(0, capacity - currentDuration);
}

/**
 * Find the next measure that has room for a note of the given duration
 * Returns the measure index or -1 if none found
 */
export function findNextAvailableMeasure(
  measures: Measure[],
  startIndex: number,
  noteOrRest: NoteOrRest
): number {
  for (let i = startIndex; i < measures.length; i++) {
    const measure = measures[i];
    if (!measure) continue;

    if (canAddToMeasure(measure, noteOrRest, measures.slice(0, i))) {
      return i;
    }
  }
  return -1;
}

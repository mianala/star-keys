import type { Note, NoteOrRest, NoteDuration } from '@/types/index.ts';

// Durations that can be beamed (eighth notes and shorter)
const BEAMABLE_DURATIONS: NoteDuration[] = ['eighth', '16th', '32nd', '64th'];

/**
 * Check if a note can be beamed (must be eighth note or shorter, and not a rest)
 */
export function isBeamable(note: NoteOrRest): note is Note {
  if (note.type !== 'note') return false;
  return BEAMABLE_DURATIONS.includes(note.duration);
}

/**
 * Get the number of beams needed for a duration
 */
export function getBeamCount(duration: NoteDuration): number {
  switch (duration) {
    case 'eighth': return 1;
    case '16th': return 2;
    case '32nd': return 3;
    case '64th': return 4;
    default: return 0;
  }
}

/**
 * Beam position in a group
 */
export type BeamPosition = 'begin' | 'continue' | 'end' | 'forward-hook' | 'backward-hook';

/**
 * Beam information attached to a note
 */
export interface BeamInfo {
  number: number; // 1 = main beam, 2 = secondary beam, etc.
  position: BeamPosition;
}

/**
 * Group consecutive beamable notes into beaming groups
 * Returns array of note indices grouped together
 */
export function findBeamGroups(notes: NoteOrRest[]): number[][] {
  const groups: number[][] = [];
  let currentGroup: number[] = [];

  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];

    if (isBeamable(note)) {
      currentGroup.push(i);
    } else {
      // Non-beamable note - close current group if it has 2+ notes
      if (currentGroup.length >= 2) {
        groups.push([...currentGroup]);
      }
      currentGroup = [];
    }
  }

  // Don't forget the last group
  if (currentGroup.length >= 2) {
    groups.push(currentGroup);
  }

  return groups;
}

/**
 * Calculate beam positions for a group of beamable notes
 * Returns map of note index to array of beam info (for each beam level)
 */
export function calculateBeamPositions(
  groupIndices: number[],
  notes: NoteOrRest[]
): Map<number, BeamInfo[]> {
  const result = new Map<number, BeamInfo[]>();

  if (groupIndices.length < 2) return result;

  // Get minimum beam count in the group
  let minBeamCount = Infinity;
  for (const idx of groupIndices) {
    const note = notes[idx];
    if (note?.type === 'note') {
      minBeamCount = Math.min(minBeamCount, getBeamCount(note.duration));
    }
  }

  // Assign beam positions for each beam level
  for (let beamLevel = 1; beamLevel <= minBeamCount; beamLevel++) {
    for (let i = 0; i < groupIndices.length; i++) {
      const noteIdx = groupIndices[i];
      const note = notes[noteIdx];

      if (note?.type !== 'note') continue;
      const noteBeamCount = getBeamCount(note.duration);

      let position: BeamPosition;
      if (beamLevel === 1) {
        // Main beam level
        if (i === 0) position = 'begin';
        else if (i === groupIndices.length - 1) position = 'end';
        else position = 'continue';
      } else {
        // Secondary beam levels
        if (beamLevel <= noteBeamCount) {
          if (i === 0) position = 'begin';
          else if (i === groupIndices.length - 1) position = 'end';
          else position = 'continue';
        } else {
          // This note doesn't have this beam level
          continue;
        }
      }

      if (!result.has(noteIdx)) {
        result.set(noteIdx, []);
      }
      result.get(noteIdx)!.push({ number: beamLevel, position });
    }
  }

  return result;
}

/**
 * Process all notes in a measure and return beam information for each note
 * Returns map of note index to array of beam info
 */
export function processMeasureBeaming(notes: NoteOrRest[]): Map<number, BeamInfo[]> {
  const groups = findBeamGroups(notes);
  const result = new Map<number, BeamInfo[]>();

  for (const group of groups) {
    const positions = calculateBeamPositions(group, notes);
    for (const [idx, beams] of positions) {
      result.set(idx, beams);
    }
  }

  return result;
}

import type { Score, Note, Rest, NoteOrRest, Measure, CursorPosition, KeySignature, TimeSignature, Clef } from '@/types/index.ts';
import type { Command } from './commands.ts';
import { addNote, removeNote, createMeasure, createRest } from './factories.ts';

export class InsertNoteCommand implements Command {
  description: string;
  score: Score;
  position: CursorPosition;
  note: Note;
  #previousNotes: NoteOrRest[] | null = null;

  constructor(score: Score, position: CursorPosition, note: Note) {
    this.score = score;
    this.position = position;
    this.note = note;
    this.description = `Insert note ${note.pitch.step}${note.pitch.octave}`;
  }

  execute(): void {
    const measure = this.score.parts[this.position.partIndex]
      ?.measures[this.position.measureIndex];
    if (!measure) return;
    this.#previousNotes = [...measure.notes];
    addNote(measure, this.note);
  }

  undo(): void {
    const measure = this.score.parts[this.position.partIndex]
      ?.measures[this.position.measureIndex];
    if (!measure || !this.#previousNotes) return;
    measure.notes = this.#previousNotes;
  }
}

export class InsertRestCommand implements Command {
  description: string;
  score: Score;
  position: CursorPosition;
  rest: Rest;
  #previousNotes: NoteOrRest[] | null = null;

  constructor(score: Score, position: CursorPosition, rest: Rest) {
    this.score = score;
    this.position = position;
    this.rest = rest;
    this.description = `Insert ${rest.duration} rest`;
  }

  execute(): void {
    const measure = this.score.parts[this.position.partIndex]
      ?.measures[this.position.measureIndex];
    if (!measure) return;
    this.#previousNotes = [...measure.notes];
    addNote(measure, this.rest);
  }

  undo(): void {
    const measure = this.score.parts[this.position.partIndex]
      ?.measures[this.position.measureIndex];
    if (!measure || !this.#previousNotes) return;
    measure.notes = this.#previousNotes;
  }
}

export class DeleteNoteCommand implements Command {
  description = 'Delete note';
  score: Score;
  position: CursorPosition;
  noteId: string;
  #previousNotes: NoteOrRest[] | null = null;

  constructor(score: Score, position: CursorPosition, noteId: string) {
    this.score = score;
    this.position = position;
    this.noteId = noteId;
  }

  execute(): void {
    const measure = this.score.parts[this.position.partIndex]
      ?.measures[this.position.measureIndex];
    if (!measure) return;
    this.#previousNotes = [...measure.notes];
    removeNote(measure, this.noteId);
  }

  undo(): void {
    const measure = this.score.parts[this.position.partIndex]
      ?.measures[this.position.measureIndex];
    if (!measure || !this.#previousNotes) return;
    measure.notes = this.#previousNotes;
  }
}

export class ReplaceNoteCommand implements Command {
  description: string;
  score: Score;
  position: CursorPosition;
  oldNoteId: string;
  newNote: Note | Rest;
  #previousNotes: NoteOrRest[] | null = null;

  constructor(score: Score, position: CursorPosition, oldNoteId: string, newNote: Note | Rest) {
    this.score = score;
    this.position = position;
    this.oldNoteId = oldNoteId;
    this.newNote = newNote;
    this.description = 'Replace note';
  }

  execute(): void {
    const measure = this.score.parts[this.position.partIndex]
      ?.measures[this.position.measureIndex];
    if (!measure) return;
    this.#previousNotes = [...measure.notes];
    const idx = measure.notes.findIndex((n) => n.id === this.oldNoteId);
    if (idx !== -1) {
      measure.notes[idx] = this.newNote;
    }
  }

  undo(): void {
    const measure = this.score.parts[this.position.partIndex]
      ?.measures[this.position.measureIndex];
    if (!measure || !this.#previousNotes) return;
    measure.notes = this.#previousNotes;
  }
}

export class ModifyNoteCommand implements Command {
  description = 'Modify note';
  score: Score;
  position: CursorPosition;
  noteIndex: number;
  #previousNote: NoteOrRest | null = null;
  updater: (note: NoteOrRest) => NoteOrRest;

  constructor(score: Score, position: CursorPosition, noteIndex: number, updater: (note: NoteOrRest) => NoteOrRest) {
    this.score = score;
    this.position = position;
    this.noteIndex = noteIndex;
    this.updater = updater;
  }

  execute(): void {
    const measure = this.score.parts[this.position.partIndex]
      ?.measures[this.position.measureIndex];
    if (!measure) return;
    const note = measure.notes[this.noteIndex];
    if (!note) return;
    this.#previousNote = { ...note } as NoteOrRest;
    // Deep copy pitch for notes
    if (note.type === 'note') {
      (this.#previousNote as Note).pitch = { ...(note as Note).pitch };
    }
    measure.notes[this.noteIndex] = this.updater(note);
  }

  undo(): void {
    const measure = this.score.parts[this.position.partIndex]
      ?.measures[this.position.measureIndex];
    if (!measure || !this.#previousNote) return;
    measure.notes[this.noteIndex] = this.#previousNote;
  }
}

export class InsertMeasureCommand implements Command {
  description = 'Insert measure';
  score: Score;
  partIndex: number;
  measureIndex: number;
  #inserted = false;

  constructor(score: Score, partIndex: number, measureIndex: number) {
    this.score = score;
    this.partIndex = partIndex;
    this.measureIndex = measureIndex;
  }

  execute(): void {
    // Insert for all parts at the same position
    for (const part of this.score.parts) {
      const num = this.measureIndex + 1;
      const measure = createMeasure(num);
      const rest = createRest('whole');
      rest.isFullMeasure = true;
      measure.notes.push(rest);
      part.measures.splice(this.measureIndex, 0, measure);
      // Renumber subsequent measures
      for (let i = this.measureIndex + 1; i < part.measures.length; i++) {
        part.measures[i].number = i + 1;
      }
    }
    this.#inserted = true;
  }

  undo(): void {
    if (!this.#inserted) return;
    for (const part of this.score.parts) {
      part.measures.splice(this.measureIndex, 1);
      for (let i = this.measureIndex; i < part.measures.length; i++) {
        part.measures[i].number = i + 1;
      }
    }
  }
}

export class DeleteMeasureCommand implements Command {
  description = 'Delete measure';
  score: Score;
  measureIndex: number;
  #removedMeasures: Measure[] = [];

  constructor(score: Score, measureIndex: number) {
    this.score = score;
    this.measureIndex = measureIndex;
  }

  execute(): void {
    this.#removedMeasures = [];
    for (const part of this.score.parts) {
      if (part.measures.length <= 1) continue; // Don't delete last measure
      const [removed] = part.measures.splice(this.measureIndex, 1);
      this.#removedMeasures.push(removed);
      for (let i = this.measureIndex; i < part.measures.length; i++) {
        part.measures[i].number = i + 1;
      }
    }
  }

  undo(): void {
    for (let p = 0; p < this.score.parts.length; p++) {
      const part = this.score.parts[p];
      const measure = this.#removedMeasures[p];
      if (!measure) continue;
      part.measures.splice(this.measureIndex, 0, measure);
      for (let i = this.measureIndex; i < part.measures.length; i++) {
        part.measures[i].number = i + 1;
      }
    }
  }
}

export class ChangeAttributesCommand implements Command {
  description = 'Change measure attributes';
  score: Score;
  partIndex: number;
  measureIndex: number;
  changes: { key?: KeySignature; time?: TimeSignature; clef?: Clef };
  #previousAttributes: Measure['attributes'] = undefined;

  constructor(
    score: Score,
    partIndex: number,
    measureIndex: number,
    changes: { key?: KeySignature; time?: TimeSignature; clef?: Clef },
  ) {
    this.score = score;
    this.partIndex = partIndex;
    this.measureIndex = measureIndex;
    this.changes = changes;
  }

  execute(): void {
    const measure = this.score.parts[this.partIndex]?.measures[this.measureIndex];
    if (!measure) return;
    this.#previousAttributes = measure.attributes ? { ...measure.attributes } : undefined;
    if (!measure.attributes) {
      measure.attributes = {};
    }
    if (this.changes.key) measure.attributes.key = this.changes.key;
    if (this.changes.time) measure.attributes.time = this.changes.time;
    if (this.changes.clef) measure.attributes.clef = this.changes.clef;
  }

  undo(): void {
    const measure = this.score.parts[this.partIndex]?.measures[this.measureIndex];
    if (!measure) return;
    measure.attributes = this.#previousAttributes;
  }
}

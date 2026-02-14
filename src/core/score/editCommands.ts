import type { Score, Note, Rest, NoteOrRest, CursorPosition } from '@/types/index.ts';
import type { Command } from './commands.ts';
import { addNote, removeNote } from './factories.ts';

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

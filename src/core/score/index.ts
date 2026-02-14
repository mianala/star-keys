export {
  uid,
  createNote,
  createRest,
  createMeasure,
  createPart,
  createScore,
  addMeasure,
  addNote,
  removeNote,
  PIANO,
  GUITAR_STANDARD,
  ELECTRIC_GUITAR,
  BASS_GUITAR,
  DRUM_SET,
  PRESET_INSTRUMENTS,
} from './factories.ts';

export { CommandHistory } from './commands.ts';
export type { Command } from './commands.ts';

export {
  InsertNoteCommand,
  InsertRestCommand,
  DeleteNoteCommand,
  ReplaceNoteCommand,
  ModifyNoteCommand,
  InsertMeasureCommand,
  DeleteMeasureCommand,
  ChangeAttributesCommand,
} from './editCommands.ts';

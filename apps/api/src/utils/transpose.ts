const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const FLAT_TO_SHARP: Record<string, string> = {
  Db: 'C#',
  Eb: 'D#',
  Fb: 'E',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
  Cb: 'B',
};

function normalizeNote(note: string): string {
  return FLAT_TO_SHARP[note] ?? note;
}

function transposeNote(note: string, semitones: number): string {
  const normalized = normalizeNote(note);
  const idx = CHROMATIC.indexOf(normalized);
  if (idx === -1) return note;
  return CHROMATIC[(idx + semitones + 12) % 12];
}

function transposeChord(chord: string, semitones: number): string {
  // Matches root (e.g. C, C#, Db), quality (e.g. m7, maj7), and optional bass (/G)
  const match = chord.match(/^([A-G][b#]?)(.*?)(?:\/([A-G][b#]?))?$/);
  if (!match) return chord;
  const [, root, quality, bass] = match;
  const newRoot = transposeNote(root, semitones);
  const newBass = bass ? '/' + transposeNote(bass, semitones) : '';
  return newRoot + (quality ?? '') + newBass;
}

/**
 * Transposes all chords in a ChordPro string by the given number of semitones.
 */
export function transposeChordPro(content: string, semitones: number): string {
  if (semitones === 0) return content;
  return content.replace(/\[([^\]]+)\]/g, (_, chord) => `[${transposeChord(chord, semitones)}]`);
}

/**
 * Calculates the number of semitones from one key to another.
 */
export function getSemitones(fromKey: string, toKey: string): number {
  const from = CHROMATIC.indexOf(normalizeNote(fromKey));
  const to = CHROMATIC.indexOf(normalizeNote(toKey));
  if (from === -1 || to === -1) return 0;
  return (to - from + 12) % 12;
}

export const VALID_KEYS = CHROMATIC;

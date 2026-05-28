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
  const norm = normalizeNote(note);
  const idx = CHROMATIC.indexOf(norm);
  if (idx === -1) return note;
  return CHROMATIC[(idx + semitones + 12) % 12];
}

function transposeChord(chord: string, semitones: number): string {
  const match = chord.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return chord;
  const [, root, quality] = match;
  const bassMatch = quality.match(/^(.*)\/(([A-G][b#]?).*)$/);
  if (bassMatch) {
    const [, q, , bass] = bassMatch;
    return `${transposeNote(root, semitones)}${q}/${transposeNote(bass, semitones)}${bassMatch[2].slice(transposeNote(bass, semitones).length)}`;
  }
  return `${transposeNote(root, semitones)}${quality}`;
}

export function transposeChordPro(content: string, semitones: number): string {
  if (semitones === 0) return content;
  return content.replace(/\[([^\]]+)\]/g, (_, chord) => `[${transposeChord(chord, semitones)}]`);
}

export function getSemitones(fromKey: string, toKey: string): number {
  const from = CHROMATIC.indexOf(normalizeNote(fromKey));
  const to = CHROMATIC.indexOf(normalizeNote(toKey));
  if (from === -1 || to === -1) return 0;
  return (to - from + 12) % 12;
}

export const KEYS = CHROMATIC;

const EASY_KEYS = new Set(['C', 'D', 'E', 'G', 'A']);

export interface CapoSuggestion {
  capo: number;
  playKey: string;
}

export function getCapoSuggestions(targetKey: string): CapoSuggestion[] {
  const targetIdx = CHROMATIC.indexOf(normalizeNote(targetKey));
  if (targetIdx === -1) return [];

  const suggestions: CapoSuggestion[] = [];
  for (let capo = 1; capo <= 7; capo++) {
    const playIdx = (targetIdx - capo + 12) % 12;
    const playKey = CHROMATIC[playIdx];
    if (EASY_KEYS.has(playKey)) {
      suggestions.push({ capo, playKey });
    }
  }
  return suggestions;
}

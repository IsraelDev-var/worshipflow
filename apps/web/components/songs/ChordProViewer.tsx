'use client';

interface ChordToken {
  chord: string;
  lyric: string;
}

function parseLine(line: string): ChordToken[] {
  const tokens: ChordToken[] = [];
  const parts = line.split(/(\[[^\]]+\])/);

  let currentChord = '';
  for (const part of parts) {
    if (part.startsWith('[') && part.endsWith(']')) {
      currentChord = part.slice(1, -1);
    } else {
      tokens.push({ chord: currentChord, lyric: part });
      currentChord = '';
    }
  }

  // Trailing chord with no lyric
  if (currentChord) {
    tokens.push({ chord: currentChord, lyric: '' });
  }

  return tokens;
}

function hasChords(line: string): boolean {
  return /\[[^\]]+\]/.test(line);
}

interface ChordProViewerProps {
  content: string;
  className?: string;
}

export function ChordProViewer({ content, className = '' }: ChordProViewerProps) {
  const lines = content.split('\n');

  return (
    <div className={`font-mono text-sm leading-relaxed ${className}`}>
      {lines.map((line, lineIdx) => {
        if (!line.trim()) {
          return <div key={lineIdx} className="h-4" />;
        }

        if (!hasChords(line)) {
          // Pure lyric or comment line
          return (
            <div key={lineIdx} className="text-gray-700">
              {line}
            </div>
          );
        }

        const tokens = parseLine(line);

        return (
          <div key={lineIdx} className="flex flex-wrap items-end leading-none mb-1">
            {tokens.map((token, i) => (
              <span key={i} className="inline-flex flex-col items-start mr-1">
                <span className="text-blue-600 font-semibold text-xs leading-tight min-w-[0.5rem]">
                  {token.chord || ' '}
                </span>
                <span className="text-gray-800 leading-tight whitespace-pre">
                  {token.lyric || (token.chord ? ' ' : '')}
                </span>
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

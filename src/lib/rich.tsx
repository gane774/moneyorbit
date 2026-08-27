import React from 'react';

/**
 * Minimal inline formatter for content strings: **bold** only.
 * Deliberately not a markdown engine — content authors get one
 * emphasis tool so screens cannot drift into formatted articles.
 */
export function rich(text: string, key = 'r'): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <b key={`${key}-${i}`}>{part.slice(2, -2)}</b>
      : <React.Fragment key={`${key}-${i}`}>{part}</React.Fragment>,
  );
}

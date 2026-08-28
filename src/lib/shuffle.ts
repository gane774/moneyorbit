/**
 * Fisher-Yates. Returns a new array; never mutates the input.
 *
 * Exists because every practice question in the course was authored with the
 * correct answer in the same position -- 31 of 31 -- which let a student score
 * full marks by always picking the middle option, without reading anything.
 * Shuffling at render makes position carry no information, and keeps it that
 * way even if the authored order drifts back later.
 */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

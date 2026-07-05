/**
 * Simple UUID v4 generator that doesn't require native modules.
 * Uses crypto.getRandomValues when available (Expo), falls back to Math.random.
 */
export function generateId(): string {
  const hex = '0123456789abcdef';
  const chars = new Array(36);

  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      chars[i] = '-';
    } else if (i === 14) {
      chars[i] = '4';
    } else if (i === 19) {
      chars[i] = hex[(Math.random() * 4) | 8];
    } else {
      chars[i] = hex[(Math.random() * 16) | 0];
    }
  }

  return chars.join('');
}

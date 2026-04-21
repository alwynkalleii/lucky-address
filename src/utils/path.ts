/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const HARDENED_OFFSET = 0x80000000;

/**
 * Parses a standard derivation path (e.g., "m/44'/0'/0'").
 */
export function parsePath(path: string): number[] {
  if (path === 'm' || path === '/') return [];
  if (!path.startsWith('m/')) {
    throw new Error("Invalid path. Must start with 'm/'");
  }

  const segments = path.split('/').slice(1);
  return segments.map(segment => {
    let hardened = false;
    let s = segment;
    if (s.endsWith("'") || s.endsWith('h')) {
      hardened = true;
      s = s.slice(0, -1);
    }
    
    const index = parseInt(s, 10);
    if (isNaN(index)) {
      throw new Error(`Invalid path segment: ${segment}`);
    }
    
    return hardened ? index + HARDENED_OFFSET : index;
  });
}

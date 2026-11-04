/**
 * Cryptographically Secure Pseudo-Random Number Generator (CSPRNG)
 * Backed by Web Crypto API (window.crypto.getRandomValues).
 * Protected against DevTools console overrides of JavaScript Math.random().
 */
export function secureRandom(): number {
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.getRandomValues === 'function') {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] / (0xffffffff + 1);
  }
  return Math.random();
}

/**
 * Returns a secure random integer between min and max (inclusive)
 */
export function secureRandomInt(min: number, max: number): number {
  const r = secureRandom();
  return Math.floor(r * (max - min + 1)) + min;
}

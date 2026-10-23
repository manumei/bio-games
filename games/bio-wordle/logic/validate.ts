/**
 * Check if a guess is valid against the loaded allowed-words Set.
 * If allowedSet is null (because network fetch failed), accepts any lowercase a-z string of the expected length.
 */
export function isValidGuess(
  guess: string,
  allowedSet: ReadonlySet<string> | null,
  expectedLength?: number
): boolean {
  const normalized = guess.trim().toLowerCase();
  if (expectedLength !== undefined && normalized.length !== expectedLength) {
    return false;
  }
  if (!/^[a-z]{4,7}$/.test(normalized)) {
    return false;
  }
  if (allowedSet === null) {
    return true;
  }
  return allowedSet.has(normalized);
}

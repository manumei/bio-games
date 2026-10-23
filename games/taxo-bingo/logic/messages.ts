/**
 * Exact loss message per filled cell count (0..11) from original GameScreen.tsx:223-240.
 */
export function getLossMessage(
  filledCount: number,
  unfilledCategoryLabel?: string
): string {
  if (filledCount === 11 && unfilledCategoryLabel) {
    return `ikr, that one "${unfilledCategoryLabel}" you probably skimmed through or just didn't wanna show up`;
  }
  if (filledCount >= 9) {
    return "You came quite close, even I couldn't do all 12 cells at first, and I made this game by hand";
  }
  if (filledCount >= 6) {
    return `${filledCount} cells... not great, not terrible`;
  }
  if (filledCount >= 3) {
    return `${filledCount} out of 12, tough luck I guess, im sure it's just a warm up gamr tho`;
  }
  if (filledCount >= 1) {
    return `${filledCount}/12, I guess it was a pretty hard game, maybe check out the Cheat Sheet`;
  }
  return "0 out of 12, vayan a estudiar";
}

/**
 * Exact follow-up message from original GameOver.tsx:56-75.
 */
export function getFollowUpMessage(won: boolean, hardMode: boolean): string {
  if (won) {
    return hardMode
      ? "And you even beat it on Hard Mode! You, are the greatest biological mind I've ever known."
      : "Try Hard Mode if you're up for a bigger challenge";
  }
  return hardMode
    ? "Don't give up! Hard mode is tough, but you can do it!"
    : "Remember, failure is the starting point for learning.";
}

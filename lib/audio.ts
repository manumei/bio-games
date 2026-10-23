/**
 * Audio helpers for sound effects and celebration tracks.
 */

let currentCelebrationAudio: HTMLAudioElement | null = null;

/**
 * Plays "Celebration" by Kool & the Gang when the player beats any game on Hard Mode.
 */
export function playHardModeCelebration(): void {
  if (typeof window === "undefined") return;
  try {
    if (currentCelebrationAudio) {
      currentCelebrationAudio.pause();
      currentCelebrationAudio.currentTime = 0;
    }
    const audio = new Audio("/assets/audio/celebration.mp3");
    audio.volume = 0.75;
    currentCelebrationAudio = audio;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Autoplay policies may suppress audio if unprompted by a direct user gesture
        console.warn("Celebration audio playback prevented:", err);
      });
    }
  } catch (e) {
    console.warn("Could not play celebration audio:", e);
  }
}

/**
 * Stop any currently playing celebration track (e.g. on modal close or restart).
 */
export function stopCelebration(): void {
  if (currentCelebrationAudio) {
    currentCelebrationAudio.pause();
    currentCelebrationAudio.currentTime = 0;
    currentCelebrationAudio = null;
  }
}


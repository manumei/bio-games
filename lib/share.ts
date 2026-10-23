/**
 * Share text using the Web Share API on touch devices when available,
 * falling back to Clipboard API, then a hidden-textarea execCommand('copy').
 */
export async function shareText(
  text: string
): Promise<"shared" | "copied" | "failed"> {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "failed";
  }

  const isTouchDevice =
    navigator.maxTouchPoints > 0 ||
    /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  if (isTouchDevice && typeof navigator.share === "function") {
    try {
      await navigator.share({ text });
      return "shared";
    } catch {
      // User cancelled or share failed; fall through to clipboard copy
    }
  }

  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return "copied";
    } catch {
      // Fall through to execCommand fallback
    }
  }

  if (typeof document !== "undefined") {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (ok) {
        return "copied";
      }
    } catch {
      return "failed";
    }
  }

  return "failed";
}

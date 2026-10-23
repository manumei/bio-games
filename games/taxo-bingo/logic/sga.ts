const SGA_MAP: Readonly<Record<string, string>> = {
  a: "ᔑ",
  b: "ʖ",
  c: "ᓵ",
  d: "↸",
  e: "ᒷ",
  f: "⎓",
  g: "⊣",
  h: "⍑",
  i: "╎",
  j: "⋮",
  k: "ꖌ",
  l: "ꖎ",
  m: "ᒲ",
  n: "リ",
  o: "𝙹",
  p: "!¡",
  q: "ᑑ",
  r: "∷",
  s: "ᓭ",
  t: "ℸ ̣",
  u: "⚍",
  v: "⍊",
  w: "∴",
  x: " ̇/",
  y: "||",
  z: "⨅",
};

/**
 * Convert Latin text into the Standard Galactic Alphabet (Minecraft enchanting table glyphs).
 */
export function toStandardGalactic(text: string): string {
  return text
    .toLowerCase()
    .split("")
    .map((char) => SGA_MAP[char] ?? char)
    .join("");
}

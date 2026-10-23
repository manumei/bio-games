/**
 * AnimalCell SVG Diagram (`viewBox="0 0 400 300"`).
 *
 * CONTRACT FOR ARTISTS / REDRAWS:
 * - Every interactive organelle or cell structure MUST be wrapped in a `<g data-part="<partId>">` element.
 * - Repeated structures (e.g. multiple mitochondria or ribosomes) share the same `data-part` attribute.
 * - Required `data-part` IDs for AnimalCell (14 total):
 *   `cytoplasm`, `cell_membrane`, `nucleus`, `nuclear_envelope`, `nucleolus`,
 *   `rough_er`, `smooth_er`, `golgi`, `mitochondrion`, `lysosome`,
 *   `ribosome`, `centriole`, `vesicle`, `peroxisome`.
 * - Draw `cytoplasm` first (bottom layer), then internal organelles, and give thin outlines
 *   (`cell_membrane`, `nuclear_envelope`) and tiny structures (`ribosome`, `centriole`, `vesicle`, `peroxisome`)
 *   transparent hit-target shapes (strokeWidth >= 14 or radius >= 12) so mobile tap targets remain >= 24px.
 */
"use client";

import { getPartGroupProps, type CellDiagramProps } from "./diagramProps";

const ANIMAL_CALLOUTS: readonly {
  id: string;
  label: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
}[] = [
  { id: "cell_membrane", label: "Cell membrane", x: 64, y: 80, tx: 10, ty: 24 },
  { id: "cytoplasm", label: "Cytoplasm", x: 140, y: 225, tx: 10, ty: 284 },
  { id: "nucleus", label: "Nucleus", x: 190, y: 130, tx: 145, ty: 18 },
  { id: "nuclear_envelope", label: "Nuclear envelope", x: 222, y: 112, tx: 255, ty: 18 },
  { id: "nucleolus", label: "Nucleolus", x: 175, y: 142, tx: 10, ty: 48 },
  { id: "rough_er", label: "Rough ER", x: 130, y: 135, tx: 10, ty: 118 },
  { id: "smooth_er", label: "Smooth ER", x: 112, y: 178, tx: 10, ty: 188 },
  { id: "golgi", label: "Golgi apparatus", x: 280, y: 195, tx: 300, ty: 284 },
  { id: "mitochondrion", label: "Mitochondrion", x: 295, y: 95, tx: 305, ty: 42 },
  { id: "lysosome", label: "Lysosome", x: 245, y: 235, tx: 175, ty: 284 },
  { id: "centriole", label: "Centrioles", x: 252, y: 85, tx: 295, ty: 68 },
  { id: "ribosome", label: "Ribosome", x: 160, y: 205, tx: 10, ty: 252 },
  { id: "vesicle", label: "Vesicle", x: 325, y: 165, tx: 325, ty: 142 },
  { id: "peroxisome", label: "Peroxisome", x: 105, y: 102, tx: 10, ty: 84 },
];

export function AnimalCell(props: CellDiagramProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      className="h-auto w-full max-w-[520px] select-none overflow-visible"
      role="img"
      aria-label="Animal cell diagram"
    >
      <defs>
        <filter id="glow-highlight" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#FACC15" floodOpacity="0.95" />
          <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#FDE047" floodOpacity="0.7" />
        </filter>
        <filter id="glow-correct" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#22C55E" floodOpacity="0.95" />
        </filter>
        <filter id="glow-wrong" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#EF4444" floodOpacity="0.95" />
        </filter>
      </defs>

      {/* 1. Cytoplasm (interior fill) */}
      <g {...getPartGroupProps("cytoplasm", props)}>
        <path
          d="M 55 150 C 52 72, 125 32, 208 35 C 292 38, 352 78, 350 152 C 348 225, 286 268, 198 265 C 112 262, 58 220, 55 150 Z"
          fill="#1E293B"
        />
      </g>

      {/* 2. Cell membrane (outer boundary with wide invisible hit stroke) */}
      <g {...getPartGroupProps("cell_membrane", props)}>
        <path
          d="M 55 150 C 52 72, 125 32, 208 35 C 292 38, 352 78, 350 152 C 348 225, 286 268, 198 265 C 112 262, 58 220, 55 150 Z"
          fill="none"
          stroke="transparent"
          strokeWidth="18"
        />
        <path
          d="M 55 150 C 52 72, 125 32, 208 35 C 292 38, 352 78, 350 152 C 348 225, 286 268, 198 265 C 112 262, 58 220, 55 150 Z"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="5"
        />
      </g>

      {/* 3. Rough ER (wrapping left side of nucleus, studded with dots) */}
      <g {...getPartGroupProps("rough_er", props)}>
        <rect x="115" y="92" width="38" height="75" rx="8" fill="transparent" />
        <path
          d="M 145 96 C 122 108, 122 158, 148 168 M 136 102 C 114 115, 114 152, 138 162 M 127 110 C 108 122, 108 146, 129 156"
          fill="none"
          stroke="#06B6D4"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="128" cy="112" r="2" fill="#FDE047" />
        <circle cx="122" cy="128" r="2" fill="#FDE047" />
        <circle cx="125" cy="145" r="2" fill="#FDE047" />
        <circle cx="135" cy="158" r="2" fill="#FDE047" />
      </g>

      {/* 4. Smooth ER (tubular network below rough ER) */}
      <g {...getPartGroupProps("smooth_er", props)}>
        <rect x="92" y="162" width="44" height="40" rx="8" fill="transparent" />
        <path
          d="M 100 170 Q 115 162 128 174 T 118 192 Q 102 198 98 182 Z"
          fill="#22D3EE"
          fillOpacity="0.35"
          stroke="#22D3EE"
          strokeWidth="3.5"
        />
      </g>

      {/* 5. Nucleus (chromatin interior) */}
      <g {...getPartGroupProps("nucleus", props)}>
        <circle cx="186" cy="135" r="42" fill="#4F46E5" fillOpacity="0.55" />
        <path
          d="M 162 120 Q 185 108 205 125 M 165 152 Q 190 162 210 142"
          stroke="#A5B4FC"
          strokeWidth="2"
          fill="none"
        />
      </g>

      {/* 6. Nuclear envelope (double membrane rim around nucleus) */}
      <g {...getPartGroupProps("nuclear_envelope", props)}>
        <circle
          cx="186"
          cy="135"
          r="44"
          fill="none"
          stroke="transparent"
          strokeWidth="14"
        />
        <circle
          cx="186"
          cy="135"
          r="44"
          fill="none"
          stroke="#818CF8"
          strokeWidth="4"
          strokeDasharray="16 4"
        />
      </g>

      {/* 7. Nucleolus (dense core inside nucleus) */}
      <g {...getPartGroupProps("nucleolus", props)}>
        <circle cx="176" cy="140" r="16" fill="transparent" />
        <circle
          cx="176"
          cy="140"
          r="13"
          fill="#C084FC"
          stroke="#F3E8FF"
          strokeWidth="2"
        />
      </g>

      {/* 8. Mitochondria (two organelles with cristae) */}
      <g {...getPartGroupProps("mitochondrion", props)}>
        <g transform="translate(295 95) rotate(25)">
          <rect
            x="-26"
            y="-14"
            width="52"
            height="28"
            rx="14"
            fill="#F97316"
            stroke="#FDBA74"
            strokeWidth="2.5"
          />
          <path
            d="M -16 0 L -9 -7 L -2 7 L 5 -7 L 12 7 L 18 0"
            fill="none"
            stroke="#FFF7ED"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
        <g transform="translate(175 232) rotate(-15)">
          <rect
            x="-24"
            y="-12"
            width="48"
            height="24"
            rx="12"
            fill="#F97316"
            stroke="#FDBA74"
            strokeWidth="2.5"
          />
          <path
            d="M -14 0 L -7 -6 L 0 6 L 7 -6 L 14 0"
            fill="none"
            stroke="#FFF7ED"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </g>

      {/* 9. Golgi apparatus (flattened cisternae stack) */}
      <g {...getPartGroupProps("golgi", props)}>
        <rect x="252" y="168" width="60" height="54" rx="10" fill="transparent" />
        <path
          d="M 260 178 Q 282 168 304 182 M 256 190 Q 282 180 308 194 M 260 202 Q 282 192 304 206 M 265 214 Q 282 206 298 216"
          fill="none"
          stroke="#10B981"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>

      {/* 10. Centrioles (paired perpendicular barrels) */}
      <g {...getPartGroupProps("centriole", props)}>
        <circle cx="248" cy="82" r="18" fill="transparent" />
        <rect
          x="236"
          y="74"
          width="18"
          height="9"
          rx="2"
          fill="#FACC15"
          stroke="#FEF08A"
          strokeWidth="1.5"
        />
        <rect
          x="248"
          y="70"
          width="9"
          height="18"
          rx="2"
          fill="#EAB308"
          stroke="#FEF08A"
          strokeWidth="1.5"
        />
      </g>

      {/* 11. Lysosome */}
      <g {...getPartGroupProps("lysosome", props)}>
        <circle cx="245" cy="235" r="18" fill="transparent" />
        <circle
          cx="245"
          cy="235"
          r="13"
          fill="#EC4899"
          stroke="#FBCFE8"
          strokeWidth="2.5"
        />
        <circle cx="241" cy="232" r="2" fill="#FCE7F3" />
        <circle cx="249" cy="237" r="2" fill="#FCE7F3" />
      </g>

      {/* 12. Peroxisome */}
      <g {...getPartGroupProps("peroxisome", props)}>
        <circle cx="105" cy="102" r="17" fill="transparent" />
        <circle
          cx="105"
          cy="102"
          r="11"
          fill="#14B8A6"
          stroke="#99F6E4"
          strokeWidth="2.5"
        />
        <rect x="101" y="98" width="8" height="8" rx="1" fill="#CCFBF1" />
      </g>

      {/* 13. Vesicle */}
      <g {...getPartGroupProps("vesicle", props)}>
        <circle cx="322" cy="162" r="16" fill="transparent" />
        <circle
          cx="322"
          cy="162"
          r="9"
          fill="#34D399"
          stroke="#A7F3D0"
          strokeWidth="2"
        />
      </g>

      {/* 14. Free Ribosomes */}
      <g {...getPartGroupProps("ribosome", props)}>
        <circle cx="155" cy="202" r="15" fill="transparent" />
        <circle cx="150" cy="200" r="3.5" fill="#FDE047" />
        <circle cx="160" cy="205" r="3.5" fill="#FDE047" />
        <circle cx="154" cy="193" r="3.5" fill="#FDE047" />
        <circle cx="220" cy="198" r="14" fill="transparent" />
        <circle cx="218" cy="198" r="3.5" fill="#FDE047" />
        <circle cx="225" cy="203" r="3.5" fill="#FDE047" />
      </g>

      {/* Optional Study Mode Labels */}
      {props.showLabels && (
        <g className="pointer-events-none" aria-hidden="true">
          {ANIMAL_CALLOUTS.map((c) => (
            <g key={c.id}>
              <line
                x1={c.x}
                y1={c.y}
                x2={c.tx + 28}
                y2={c.ty - 3}
                stroke="#94A3B8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <rect
                x={c.tx}
                y={c.ty - 11}
                width={c.label.length * 5.4 + 10}
                height="14"
                rx="3"
                fill="#0F172A"
                fillOpacity="0.9"
                stroke="#334155"
                strokeWidth="0.8"
              />
              <text
                x={c.tx + 5}
                y={c.ty - 1}
                fill="#F8FAFC"
                fontSize="8.5"
                fontWeight="600"
                fontFamily="system-ui, sans-serif"
              >
                {c.label}
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}


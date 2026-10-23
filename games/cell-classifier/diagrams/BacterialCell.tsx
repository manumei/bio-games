/**
 * BacterialCell SVG Diagram (`viewBox="0 0 400 300"`).
 *
 * CONTRACT FOR ARTISTS / REDRAWS:
 * - Every interactive organelle or cell structure MUST be wrapped in a `<g data-part="<partId>">` element.
 * - Repeated structures (e.g. plasmids, ribosomes, pili) share the same `data-part`.
 * - Required `data-part` IDs for BacterialCell (9 total):
 *   `capsule`, `cell_wall`, `cell_membrane`, `cytoplasm`,
 *   `nucleoid`, `plasmid`, `ribosome`, `flagellum`, `pili`.
 */
"use client";

import { getPartGroupProps, type CellDiagramProps } from "./diagramProps";

const BACTERIA_CALLOUTS: readonly {
  id: string;
  label: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
}[] = [
  { id: "capsule", label: "Capsule", x: 112, y: 68, tx: 18, ty: 24 },
  { id: "cell_wall", label: "Cell wall", x: 145, y: 78, tx: 110, ty: 24 },
  { id: "cell_membrane", label: "Cell membrane", x: 185, y: 88, tx: 200, ty: 24 },
  { id: "pili", label: "Pili", x: 252, y: 62, tx: 310, ty: 24 },
  { id: "nucleoid", label: "Nucleoid", x: 165, y: 150, tx: 22, ty: 280 },
  { id: "plasmid", label: "Plasmid", x: 248, y: 142, tx: 280, ty: 88 },
  { id: "ribosome", label: "Ribosome", x: 125, y: 182, tx: 120, ty: 280 },
  { id: "cytoplasm", label: "Cytoplasm", x: 215, y: 192, tx: 215, ty: 280 },
  { id: "flagellum", label: "Flagellum", x: 345, y: 165, tx: 315, ty: 245 },
];

export function BacterialCell(props: CellDiagramProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      className="h-auto w-full max-w-[520px] select-none overflow-visible"
      role="img"
      aria-label="Bacterial cell diagram"
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

      {/* 1. Pili (hair-like projections around the capsule) */}
      <g {...getPartGroupProps("pili", props)}>
        <circle cx="195" cy="54" r="18" fill="transparent" />
        <circle cx="250" cy="58" r="18" fill="transparent" />
        <path
          d="M 110 72 L 96 52 M 150 66 L 144 44 M 195 66 L 195 42 M 240 68 L 250 45 M 272 86 L 292 68 M 115 228 L 98 248 M 165 234 L 160 256 M 220 234 L 226 256 M 265 222 L 284 242"
          stroke="#A78BFA"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </g>

      {/* 2. Flagellum (long whip tail extending right) */}
      <g {...getPartGroupProps("flagellum", props)}>
        <path
          d="M 292 150 C 318 118, 342 188, 368 148 C 382 126, 392 162, 396 142"
          fill="none"
          stroke="transparent"
          strokeWidth="22"
        />
        <path
          d="M 292 150 C 318 118, 342 188, 368 148 C 382 126, 392 162, 396 142"
          fill="none"
          stroke="#F472B6"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>

      {/* 3. Cytoplasm (interior fill) */}
      <g {...getPartGroupProps("cytoplasm", props)}>
        <rect
          x="84"
          y="88"
          width="192"
          height="124"
          rx="62"
          fill="#1E1B4B"
        />
      </g>

      {/* 4. Capsule (outermost halo ring) */}
      <g {...getPartGroupProps("capsule", props)}>
        <rect
          x="64"
          y="68"
          width="232"
          height="164"
          rx="82"
          fill="none"
          stroke="transparent"
          strokeWidth="16"
        />
        <rect
          x="64"
          y="68"
          width="232"
          height="164"
          rx="82"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="7"
          strokeDasharray="18 5"
        />
      </g>

      {/* 5. Cell wall (middle layer) */}
      <g {...getPartGroupProps("cell_wall", props)}>
        <rect
          x="74"
          y="78"
          width="212"
          height="144"
          rx="72"
          fill="none"
          stroke="transparent"
          strokeWidth="14"
        />
        <rect
          x="74"
          y="78"
          width="212"
          height="144"
          rx="72"
          fill="none"
          stroke="#4ADE80"
          strokeWidth="5"
        />
      </g>

      {/* 6. Cell membrane (innermost envelope layer) */}
      <g {...getPartGroupProps("cell_membrane", props)}>
        <rect
          x="84"
          y="88"
          width="192"
          height="124"
          rx="62"
          fill="none"
          stroke="transparent"
          strokeWidth="12"
        />
        <rect
          x="84"
          y="88"
          width="192"
          height="124"
          rx="62"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="3.5"
        />
      </g>

      {/* 7. Nucleoid (coiled circular chromosomal DNA in center-left) */}
      <g {...getPartGroupProps("nucleoid", props)}>
        <ellipse cx="164" cy="148" rx="44" ry="30" fill="transparent" />
        <path
          d="M 128 142 C 138 118, 168 122, 175 145 C 182 168, 206 125, 200 155 C 194 182, 160 176, 152 152 C 144 128, 122 168, 142 172 C 162 176, 185 135, 165 130 Z"
          fill="#EC4899"
          fillOpacity="0.25"
          stroke="#F43F5E"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>

      {/* 8. Plasmids (small circular DNA rings) */}
      <g {...getPartGroupProps("plasmid", props)}>
        <circle cx="242" cy="136" r="18" fill="transparent" />
        <circle
          cx="242"
          cy="136"
          r="11"
          fill="none"
          stroke="#22D3EE"
          strokeWidth="3.5"
        />
        <circle cx="115" cy="122" r="14" fill="transparent" />
        <circle
          cx="115"
          cy="122"
          r="7.5"
          fill="none"
          stroke="#22D3EE"
          strokeWidth="3"
        />
      </g>

      {/* 9. Ribosomes */}
      <g {...getPartGroupProps("ribosome", props)}>
        <circle cx="122" cy="182" r="16" fill="transparent" />
        <circle cx="118" cy="180" r="3.5" fill="#FDE047" />
        <circle cx="127" cy="184" r="3.5" fill="#FDE047" />
        <circle cx="121" cy="188" r="3.5" fill="#FDE047" />
        <circle cx="232" cy="178" r="14" fill="transparent" />
        <circle cx="230" cy="178" r="3.5" fill="#FDE047" />
        <circle cx="237" cy="182" r="3.5" fill="#FDE047" />
      </g>

      {/* Optional Study Mode Labels */}
      {props.showLabels && (
        <g className="pointer-events-none" aria-hidden="true">
          {BACTERIA_CALLOUTS.map((c) => (
            <g key={c.id}>
              <line
                x1={c.x}
                y1={c.y}
                x2={c.tx + 24}
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


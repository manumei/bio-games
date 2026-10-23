/**
 * PlantCell SVG Diagram (`viewBox="0 0 400 300"`).
 *
 * CONTRACT FOR ARTISTS / REDRAWS:
 * - Every interactive organelle or cell structure MUST be wrapped in a `<g data-part="<partId>">` element.
 * - Repeated structures (e.g. chloroplasts, mitochondria, ribosomes, plasmodesmata) share the same `data-part`.
 * - Required `data-part` IDs for PlantCell (16 total):
 *   `cell_wall`, `cell_membrane`, `cytoplasm`, `central_vacuole`, `chloroplast`,
 *   `plasmodesmata`, `nucleus`, `nuclear_envelope`, `nucleolus`, `rough_er`,
 *   `smooth_er`, `golgi`, `mitochondrion`, `ribosome`, `vesicle`, `peroxisome`.
 */
"use client";

import { getPartGroupProps, type CellDiagramProps } from "./diagramProps";

const PLANT_CALLOUTS: readonly {
  id: string;
  label: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
}[] = [
  { id: "cell_wall", label: "Cell wall", x: 52, y: 42, tx: 6, ty: 16 },
  { id: "cell_membrane", label: "Cell membrane", x: 64, y: 65, tx: 6, ty: 34 },
  { id: "plasmodesmata", label: "Plasmodesmata", x: 46, y: 150, tx: 6, ty: 150 },
  { id: "central_vacuole", label: "Central vacuole", x: 245, y: 145, tx: 280, ty: 16 },
  { id: "chloroplast", label: "Chloroplast", x: 285, y: 235, tx: 295, ty: 288 },
  { id: "nucleus", label: "Nucleus", x: 128, y: 112, tx: 105, ty: 16 },
  { id: "nuclear_envelope", label: "Nuclear envelope", x: 155, y: 95, tx: 185, ty: 16 },
  { id: "nucleolus", label: "Nucleolus", x: 120, y: 118, tx: 6, ty: 95 },
  { id: "rough_er", label: "Rough ER", x: 96, y: 148, tx: 6, ty: 124 },
  { id: "smooth_er", label: "Smooth ER", x: 95, y: 182, tx: 6, ty: 182 },
  { id: "golgi", label: "Golgi apparatus", x: 145, y: 215, tx: 6, ty: 240 },
  { id: "mitochondrion", label: "Mitochondrion", x: 198, y: 235, tx: 165, ty: 288 },
  { id: "peroxisome", label: "Peroxisome", x: 172, y: 72, tx: 6, ty: 65 },
  { id: "vesicle", label: "Vesicle", x: 112, y: 238, tx: 6, ty: 266 },
  { id: "ribosome", label: "Ribosome", x: 152, y: 175, tx: 6, ty: 212 },
  { id: "cytoplasm", label: "Cytoplasm", x: 115, y: 252, tx: 78, ty: 288 },
];

export function PlantCell(props: CellDiagramProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      className="h-auto w-full max-w-[520px] select-none overflow-visible"
      role="img"
      aria-label="Plant cell diagram"
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

      {/* 1. Cytoplasm (interior fill inside plasma membrane) */}
      <g {...getPartGroupProps("cytoplasm", props)}>
        <rect
          x="62"
          y="46"
          width="276"
          height="208"
          rx="26"
          fill="#14332B"
        />
      </g>

      {/* 2. Cell wall (thick outer polygonal/rounded-rect wall) */}
      <g {...getPartGroupProps("cell_wall", props)}>
        <rect
          x="48"
          y="34"
          width="304"
          height="232"
          rx="32"
          fill="none"
          stroke="transparent"
          strokeWidth="18"
        />
        <rect
          x="48"
          y="34"
          width="304"
          height="232"
          rx="32"
          fill="none"
          stroke="#4ADE80"
          strokeWidth="10"
        />
      </g>

      {/* 3. Cell membrane (inner boundary just inside cell wall) */}
      <g {...getPartGroupProps("cell_membrane", props)}>
        <rect
          x="62"
          y="46"
          width="276"
          height="208"
          rx="26"
          fill="none"
          stroke="transparent"
          strokeWidth="14"
        />
        <rect
          x="62"
          y="46"
          width="276"
          height="208"
          rx="26"
          fill="none"
          stroke="#FACC15"
          strokeWidth="3.5"
        />
      </g>

      {/* 4. Plasmodesmata (channels cutting through cell wall) */}
      <g {...getPartGroupProps("plasmodesmata", props)}>
        <circle cx="54" cy="150" r="16" fill="transparent" />
        <rect x="42" y="144" width="24" height="10" rx="3" fill="#86EFAC" stroke="#166534" strokeWidth="1.5" />
        <circle cx="346" cy="150" r="16" fill="transparent" />
        <rect x="334" y="144" width="24" height="10" rx="3" fill="#86EFAC" stroke="#166534" strokeWidth="1.5" />
      </g>

      {/* 5. Central vacuole (large fluid sac occupying right/center) */}
      <g {...getPartGroupProps("central_vacuole", props)}>
        <path
          d="M 195 65 C 245 58, 318 68, 322 132 C 325 188, 282 204, 224 198 C 188 194, 178 158, 182 115 C 185 82, 185 68, 195 65 Z"
          fill="#0EA5E9"
          fillOpacity="0.45"
          stroke="#7DD3FC"
          strokeWidth="3"
        />
      </g>

      {/* 6. Nucleus */}
      <g {...getPartGroupProps("nucleus", props)}>
        <circle cx="128" cy="112" r="34" fill="#6366F1" fillOpacity="0.55" />
      </g>

      {/* 7. Nuclear envelope */}
      <g {...getPartGroupProps("nuclear_envelope", props)}>
        <circle
          cx="128"
          cy="112"
          r="35"
          fill="none"
          stroke="transparent"
          strokeWidth="14"
        />
        <circle
          cx="128"
          cy="112"
          r="35"
          fill="none"
          stroke="#A5B4FC"
          strokeWidth="3.5"
          strokeDasharray="14 4"
        />
      </g>

      {/* 8. Nucleolus */}
      <g {...getPartGroupProps("nucleolus", props)}>
        <circle cx="120" cy="116" r="15" fill="transparent" />
        <circle
          cx="120"
          cy="116"
          r="11"
          fill="#C084FC"
          stroke="#F3E8FF"
          strokeWidth="2"
        />
      </g>

      {/* 9. Rough ER */}
      <g {...getPartGroupProps("rough_er", props)}>
        <rect x="82" y="138" width="54" height="28" rx="6" fill="transparent" />
        <path
          d="M 90 146 Q 112 158 134 148 M 88 156 Q 112 168 132 158"
          fill="none"
          stroke="#06B6D4"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <circle cx="96" cy="148" r="2" fill="#FDE047" />
        <circle cx="112" cy="153" r="2" fill="#FDE047" />
        <circle cx="126" cy="150" r="2" fill="#FDE047" />
      </g>

      {/* 10. Smooth ER */}
      <g {...getPartGroupProps("smooth_er", props)}>
        <rect x="78" y="168" width="42" height="32" rx="6" fill="transparent" />
        <path
          d="M 84 176 Q 98 168 112 178 T 104 194 Q 88 196 84 184 Z"
          fill="#22D3EE"
          fillOpacity="0.35"
          stroke="#22D3EE"
          strokeWidth="3"
        />
      </g>

      {/* 11. Golgi apparatus */}
      <g {...getPartGroupProps("golgi", props)}>
        <rect x="122" y="196" width="50" height="40" rx="8" fill="transparent" />
        <path
          d="M 128 205 Q 146 198 164 208 M 126 215 Q 146 208 166 218 M 130 225 Q 146 218 162 228"
          fill="none"
          stroke="#F472B6"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      </g>

      {/* 12. Chloroplasts (green ovals with thylakoid grana stacks) */}
      <g {...getPartGroupProps("chloroplast", props)}>
        <g transform="translate(282 228) rotate(-12)">
          <ellipse
            cx="0"
            cy="0"
            rx="28"
            ry="15"
            fill="#16A34A"
            stroke="#86EFAC"
            strokeWidth="2.5"
          />
          <rect x="-16" y="-8" width="8" height="16" rx="2" fill="#4ADE80" />
          <rect x="-3" y="-8" width="8" height="16" rx="2" fill="#4ADE80" />
          <rect x="10" y="-8" width="8" height="16" rx="2" fill="#4ADE80" />
        </g>
        <g transform="translate(238 228) rotate(8)">
          <ellipse
            cx="0"
            cy="0"
            rx="22"
            ry="12"
            fill="#16A34A"
            stroke="#86EFAC"
            strokeWidth="2"
          />
          <rect x="-11" y="-6" width="6" height="12" rx="1.5" fill="#4ADE80" />
          <rect x="3" y="-6" width="6" height="12" rx="1.5" fill="#4ADE80" />
        </g>
      </g>

      {/* 13. Mitochondrion */}
      <g {...getPartGroupProps("mitochondrion", props)}>
        <g transform="translate(194 232) rotate(-18)">
          <rect
            x="-22"
            y="-11"
            width="44"
            height="22"
            rx="11"
            fill="#F97316"
            stroke="#FDBA74"
            strokeWidth="2.5"
          />
          <path
            d="M -13 0 L -6 -6 L 0 6 L 6 -6 L 13 0"
            fill="none"
            stroke="#FFF7ED"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </g>

      {/* 14. Peroxisome */}
      <g {...getPartGroupProps("peroxisome", props)}>
        <circle cx="172" cy="70" r="16" fill="transparent" />
        <circle
          cx="172"
          cy="70"
          r="10"
          fill="#14B8A6"
          stroke="#99F6E4"
          strokeWidth="2"
        />
      </g>

      {/* 15. Vesicle */}
      <g {...getPartGroupProps("vesicle", props)}>
        <circle cx="105" cy="232" r="15" fill="transparent" />
        <circle
          cx="105"
          cy="232"
          r="8.5"
          fill="#FBBF24"
          stroke="#FEF08A"
          strokeWidth="2"
        />
      </g>

      {/* 16. Ribosomes */}
      <g {...getPartGroupProps("ribosome", props)}>
        <circle cx="154" cy="176" r="15" fill="transparent" />
        <circle cx="150" cy="174" r="3.5" fill="#FDE047" />
        <circle cx="158" cy="179" r="3.5" fill="#FDE047" />
        <circle cx="153" cy="182" r="3.5" fill="#FDE047" />
      </g>

      {/* Optional Study Mode Labels */}
      {props.showLabels && (
        <g className="pointer-events-none" aria-hidden="true">
          {PLANT_CALLOUTS.map((c) => (
            <g key={c.id}>
              <line
                x1={c.x}
                y1={c.y}
                x2={c.tx + 25}
                y2={c.ty - 3}
                stroke="#94A3B8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <rect
                x={c.tx}
                y={c.ty - 11}
                width={c.label.length * 5.2 + 10}
                height="13"
                rx="3"
                fill="#0F172A"
                fillOpacity="0.9"
                stroke="#334155"
                strokeWidth="0.8"
              />
              <text
                x={c.tx + 4}
                y={c.ty - 1.5}
                fill="#F8FAFC"
                fontSize="8"
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


import type { KeyboardEvent, MouseEvent } from "react";
import { getPart } from "../data/parts";

export interface CellDiagramProps {
  highlight?: string | null;
  correct?: string | null;
  wrong?: string | null;
  onPartClick?: (partId: string) => void;
  showLabels?: boolean;
}

export function getPartGroupProps(
  partId: string,
  props: CellDiagramProps,
): {
  "data-part": string;
  role?: string;
  tabIndex?: number;
  "aria-label"?: string;
  className: string;
  filter?: string;
  onClick?: (e: MouseEvent<SVGGElement>) => void;
  onKeyDown?: (e: KeyboardEvent<SVGGElement>) => void;
} {
  const { highlight, correct, wrong, onPartClick, showLabels } = props;
  const isHighlight = highlight === partId;
  const isCorrect = correct === partId;
  const isWrong = wrong === partId;
  const clickable = Boolean(onPartClick);

  let filter: string | undefined;
  let stateClass = "transition-all duration-200";
  if (isCorrect) {
    filter = "url(#glow-correct)";
    stateClass += " brightness-125";
  } else if (isWrong) {
    filter = "url(#glow-wrong)";
    stateClass += " brightness-125";
  } else if (isHighlight) {
    filter = "url(#glow-highlight)";
    stateClass += " motion-safe:animate-pulse brightness-125";
  }

  if (clickable) {
    stateClass += " cursor-pointer hover:brightness-110";
  }

  const label = showLabels ? getPart(partId).name : undefined;

  return {
    "data-part": partId,
    ...(clickable
      ? {
          role: "button",
          tabIndex: 0,
          "aria-label": label ?? `Cell structure`,
          onClick: (e: MouseEvent<SVGGElement>) => {
            e.stopPropagation();
            onPartClick?.(partId);
          },
          onKeyDown: (e: KeyboardEvent<SVGGElement>) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onPartClick?.(partId);
            }
          },
        }
      : {}),
    className: stateClass,
    ...(filter ? { filter } : {}),
  };
}


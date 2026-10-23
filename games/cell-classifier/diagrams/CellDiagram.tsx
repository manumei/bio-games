"use client";

import type { CellType } from "../data/parts";
import { AnimalCell } from "./AnimalCell";
import { BacterialCell } from "./BacterialCell";
import { PlantCell } from "./PlantCell";
import type { CellDiagramProps } from "./diagramProps";

export interface TypedCellDiagramProps extends CellDiagramProps {
  cell: CellType;
}

export function CellDiagram({ cell, ...rest }: TypedCellDiagramProps) {
  switch (cell) {
    case "animal":
      return <AnimalCell {...rest} />;
    case "plant":
      return <PlantCell {...rest} />;
    case "bacteria":
      return <BacterialCell {...rest} />;
  }
}

export type { CellDiagramProps };


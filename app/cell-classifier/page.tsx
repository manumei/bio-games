import CellClassifierGame from "@/games/cell-classifier/CellClassifierGame";
import { gameMetadata } from "@/games/registry";

export const metadata = gameMetadata("cell-classifier");

export default function CellClassifierPage() {
  return <CellClassifierGame />;
}


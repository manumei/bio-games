import BioWordleGame from "@/games/bio-wordle/BioWordleGame";
import { gameMetadata } from "@/games/registry";

export const metadata = gameMetadata("bio-wordle");

export default function BioWordlePage() {
  return <BioWordleGame />;
}

import BioGuesserGame from "@/games/bio-guesser/BioGuesserGame";
import { gameMetadata } from "@/games/registry";

export const metadata = gameMetadata("bio-guesser");

export default function BioGuesserPage() {
  return <BioGuesserGame />;
}


import { gameMetadata } from "@/games/registry";
import TaxoBingoGame from "@/games/taxo-bingo/TaxoBingoGame";

export const metadata = gameMetadata("taxo-bingo");

export default function TaxoBingoPage() {
  return <TaxoBingoGame />;
}

import AnimalTicTacToeGame from "@/games/animal-tictactoe/AnimalTicTacToeGame";
import { gameMetadata } from "@/games/registry";

export const metadata = gameMetadata("animal-tictactoe");

export default function AnimalTicTacToePage() {
  return <AnimalTicTacToeGame />;
}


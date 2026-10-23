import SymptomsLinkGame from "@/games/symptoms-link/SymptomsLinkGame";
import { gameMetadata } from "@/games/registry";

export const metadata = gameMetadata("symptoms-link");

export default function SymptomsLinkPage() {
  return <SymptomsLinkGame />;
}

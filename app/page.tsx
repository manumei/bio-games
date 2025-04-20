import Button from "./components/Button";

export default function Home() {
  return (
    <main className="h-dvh bg-[#08162b]">
      <div className="w-fit mx-auto grid grid-cols-3 gap-8 p-5">
        <Button title="Taxo-Bingo" />
        <Button title="Bio Wordle" coming_soon />
        <Button title="Symptoms Link" coming_soon />
        <Button title="Animal Tic-Tac-Toe" coming_soon />
        <Button title="Bio Top 8" coming_soon />
        <Button title="Bio-Linxicon" coming_soon />
      </div>
    </main>
  );
}

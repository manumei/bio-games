import Button from "./components/Button";

export default function Home() {
  return (
    <main className="min-h-[80vh] bg-custom-2 flex flex-col">
      <h2 className="mt-8 text-xl font-thin text-center">
        Select the bio-game you want to play:
      </h2>
      <div className="grid grid-cols-3 gap-8 p-5 mx-auto w-fit">
        <Button title="Taxo-Bingo" isNew />
        <Button title="Bio Wordle" coming_soon />
        <Button title="Symptoms Link" coming_soon />
        <Button title="Animal Tic-Tac-Toe" coming_soon />
        <Button title="Bio Top 8" coming_soon />
        <Button title="Bio-Linxicon" coming_soon />
      </div>
    </main>
  );
}

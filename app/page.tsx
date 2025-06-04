import Panel from "./components/Panel";

export default function Home() {
  return (
    <main className="min-h-[80vh] bg-custom-2 flex flex-col">
      <h2 className="px-2 sm:px-0 mt-8 mb-4 text-md sm:text-xl font-thin text-center">
        Select the game you want to play:
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-8 p-2 sm:p-5 mx-auto w-fit">
        <Panel
          title="Taxo-Bingo"
          isNew
          route="/taxo-bingo"
          imgSrc="/assets/img/covers/home/taxo.png"
        />
        <Panel
          title="Bio Wordle"
          isNew
          route="/bio-wordle"
          imgSrc="/assets/img/covers/home/wordle.png"
        />
        <Panel title="Symptoms Link" coming_soon />
        <Panel title="Animal Tic-Tac-Toe" coming_soon />
        <Panel title="Bio Top 8" coming_soon />
        <Panel title="Cell Classifier" coming_soon />
      </div>
    </main>
  );
}

import Panel from "./components/Panel";

export default function Home() {
  return (
    <main className="min-h-[80vh] bg-custom-2 flex flex-col">
      <h2 className="mt-8 text-xl font-thin text-center">
        Select the biology game you want to play:
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 p-5 mx-auto w-fit">
        <Panel
          title="Taxo-Bingo"
          isNew
          route="/taxo-bingo"
          imgSrc="/assets/img/covers/home/taxo.png"
        />
        <Panel title="Bio Wordle" coming_soon />
        <Panel title="Symptoms Link" coming_soon />
        <Panel title="Animal Tic-Tac-Toe" coming_soon />
        <Panel title="Bio Top 8" coming_soon />
        <Panel title="Bio-Linxicon" coming_soon />
      </div>
    </main>
  );
}

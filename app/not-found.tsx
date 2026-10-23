import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-bold">This page went extinct 🦤</h1>
      <Link
        href="/"
        className="px-6 py-2 bg-[#6574fd] hover:bg-[#4755d4] text-white font-bold rounded transition-colors duration-300"
      >
        Go back to home
      </Link>
    </main>
  );
}

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface GameOverProps {
  won: boolean;
  hard: boolean;
  message: React.ReactNode;
  onClose: () => void;
}

export default function GameOver({
  won,
  hard,
  message,
  onClose,
}: GameOverProps) {
  const router = useRouter();

  // Optional: disable keyboard/game input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault(); // disables skip etc.
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Overlay to block background interactions */}
      <div className="fixed inset-0 bg-[#0000006f] z-[999]" />

      {/* Popup panel */}
      <div
        className="absolute top-1/2 left-1/2 w-[30rem] -translate-x-1/2 -translate-y-1/2 
      bg-[rgb(207,200,200)] text-black p-8 rounded-xl shadow-lg z-[1000] text-center"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-red-600 text-3xl hover:text-red-800 transition cursor-pointer"
          title="Close to see your game"
        >
          ✖
        </button>

        {/* Title */}
        <h2 className="text-3xl font-bold mb-4">
          {won ? "You Won! 🎉" : "You Lost 🥀"}
        </h2>

        {/* Message */}
        <p className="text-lg font-medium">{message}</p>
        <br />
        {won ? (
          hard ? (
            <p className="text-lg font-medium">
              And you even beat it on Hard Mode! You, are the greatest
              biological mind I've ever known.
            </p>
          ) : (
            <p className="text-lg font-medium">
              Try Hard Mode if you're up for a bigger challenge
            </p>
          )
        ) : hard ? (
          <p className="text-lg font-medium">
            Don't give up! Hard mode is tough, but you can do it!
          </p>
        ) : (
          <p className="text-lg font-medium">
            Remember, failure is the starting point for learning.
          </p>
        )}

        {/* Go Back */}
        <button
          onClick={() => router.push("/")}
          className="inline-block mt-6 px-6 py-2 bg-[#6574fd] hover:bg-[#4755d4] text-white font-bold rounded cursor-pointer transition-colors duration-300"
        >
          Go back to home
        </button>
      </div>
    </>
  );
}

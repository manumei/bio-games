import React from "react";

interface GuessRowsProps {
  wordLength: number;
  guesses: string[];
  currentGuess: string;
  shake: boolean;
}

const GuessRows: React.FC<GuessRowsProps> = ({
  wordLength,
  guesses,
  currentGuess,
  shake,
}) => {
  const totalRows = 6;

  return (
    <div className="flex flex-col items-center gap-1.5">
      {Array.from({ length: totalRows }).map((_, rowIndex) => {
        const guess =
          rowIndex < guesses.length
            ? guesses[rowIndex]
            : rowIndex === guesses.length
            ? currentGuess
            : "";

        return (
          <div
            key={rowIndex}
            className={`relative flex items-center justify-center ${
              rowIndex === guesses.length && shake ? "animate-shake" : ""
            }`}
          >
            {rowIndex === guesses.length && (
              <div className="absolute left-[-30px] text-white text-xl select-none lg:left-[-45px] lg:text-4xl hidden sm:block">
                →
              </div>
            )}
            {Array.from({ length: wordLength }).map((_, letterIndex) => (
              <div
                key={letterIndex}
                className={`  w-8 h-8 
                              md:w-9 md:h-9 
                              lg:w-12 lg:h-12 
                              xl:w-15 xl:h-15 
                              flex items-center justify-center 
                              text-[1rem] md:text-lg lg:text-xl xl:text-2xl 
                              font-bold uppercase mx-0.5 box-border ${
                                guess[letterIndex]
                                  ? "border-2 border-white"
                                  : "border-2 border-gray-400 border-opacity-40"
                              }`}
              >
                {guess[letterIndex] || ""}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default GuessRows;

import React from 'react';

interface GuessRowsProps {
  wordLength: number;
  guesses: string[];
  currentGuess: string;
}

const GuessRows: React.FC<GuessRowsProps> = ({ wordLength, guesses, currentGuess }) => {
  const totalRows = 6;

  return (
    <div className="flex flex-col items-center gap-1.5">
      {Array.from({ length: totalRows }).map((_, rowIndex) => {
        const guess =
          rowIndex < guesses.length
            ? guesses[rowIndex]
            : rowIndex === guesses.length
              ? currentGuess
              : '';

        return (
          <div key={rowIndex} className="flex">
            {Array.from({ length: wordLength }).map((_, letterIndex) => (
              <div
                key={letterIndex}
                className="w-12 h-12 border-2 border-gray-300 flex items-center justify-center text-xl font-bold uppercase mx-0.5 box-border"
              >
                {guess[letterIndex] || ''}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default GuessRows;

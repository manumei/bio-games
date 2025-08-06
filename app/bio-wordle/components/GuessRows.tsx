import React from 'react';

interface GuessRowsProps {
  wordLength: number;
  guesses: string[];
  currentGuess: string;
  shake: boolean;
}

const GuessRows: React.FC<GuessRowsProps> = ({ wordLength, guesses, currentGuess, shake }) => {
  const totalRows = 6;

  return (
    <div className="flex flex-col items-center gap-2.5">
      {Array.from({ length: totalRows }).map((_, rowIndex) => {
        const guess =
          rowIndex < guesses.length
            ? guesses[rowIndex]
            : rowIndex === guesses.length
              ? currentGuess
              : '';

        return (
          <div key={rowIndex}
            className={`flex ${rowIndex === guesses.length && shake ? 'animate-shake' : ''}`}>
            {Array.from({ length: wordLength }).map((_, letterIndex) => (
              <div
                key={letterIndex}
                className={`w-12 h-12 flex items-center justify-center text-xl font-bold uppercase mx-0.5 box-border ${
                guess[letterIndex]
                    ? 'border-2 border-white'
                    : 'border-2 border-gray-400 border-opacity-40'
                }`}
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


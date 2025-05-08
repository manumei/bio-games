'use client';

interface GiveUpButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function GiveUpButton({ onClick, disabled = false }: GiveUpButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title="Give up?"
      className={`mb-4 px-3 py-1.5 border-2 border-green-800 
        rounded-md font-bold bg-transparent hover:bg-[#335833a6] 
        transition duration-300 text-white cursor-pointer
        ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      🏳️
    </button>
  );
}


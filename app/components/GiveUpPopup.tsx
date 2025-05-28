'use client';
import { useEffect } from 'react';

interface GiveUpPopupProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function GiveUpPopup({ onConfirm, onCancel }: GiveUpPopupProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <>
      {/* Overlay blocker */}
      <div
        className="fixed inset-0 bg-[#00000064] z-[999]"
        onClick={onCancel}
      />

      {/* Popup */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[rgb(241,234,234)] text-black p-6 rounded-lg shadow-lg z-[1000] text-center">
        <p className="mb-2 font-semibold text-lg">Are you sure you want to give up?</p>
        <div className="flex justify-center gap-6 mt-4">
          <button
            className="giveup-opt-btn bg-[#73f5ce] hover:bg-[#4ec7a0] text-black font-bold px-4 py-2 rounded cursor-pointer"
            onClick={onConfirm}
          >
            Yes
          </button>
          <button
            className="giveup-opt-btn bg-[#73f5ce] hover:bg-[#4ec7a0] text-black font-bold px-4 py-2 rounded cursor-pointer"
            onClick={onCancel}
          >
            No
          </button>
        </div>
      </div>
    </>
  );
}

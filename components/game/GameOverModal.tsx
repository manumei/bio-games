"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import Modal from "@/components/ui/Modal";

export interface GameOverModalProps {
  won: boolean;
  title?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
}

export default function GameOverModal({
  won,
  title,
  children,
  actions,
  onClose,
}: GameOverModalProps) {
  const resolvedTitle = title ?? (won ? "You Won! 🎉" : "You Lost 🥀");

  return (
    <Modal
      title={resolvedTitle}
      showCloseButton
      closeButtonTitle="Close to see your game"
      dismissible
      onClose={onClose}
      className="bg-[rgb(207,200,200)] p-8 text-center"
    >
      <div className="space-y-4">{children}</div>

      <div className="mt-6">
        {actions ?? (
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-[#6574fd] hover:bg-[#4755d4] text-white font-bold rounded cursor-pointer transition-colors duration-300"
          >
            Go back to home
          </Link>
        )}
      </div>
    </Modal>
  );
}

"use client";

import type { ReactNode } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export interface ConfirmDialogProps {
  title?: ReactNode;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Yes",
  cancelLabel = "No",
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      title={title}
      ariaLabel={typeof title === "string" ? title : "Confirmation"}
      dismissible
      onClose={onCancel}
      className="w-auto max-w-[90vw] sm:w-auto p-6 text-center"
    >
      <p className="mb-2 font-semibold text-lg">{message}</p>
      <div className="flex justify-center gap-6 mt-4">
        <Button
          variant={tone === "danger" ? "danger" : "teal"}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
        <Button variant="teal" onClick={onCancel}>
          {cancelLabel}
        </Button>
      </div>
    </Modal>
  );
}

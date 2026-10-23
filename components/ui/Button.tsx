import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "warning"
  | "info"
  | "teal"
  | "ghost";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-green-300 hover:bg-green-500 text-black font-medium transition-transform transform hover:scale-105",
  secondary: "bg-gray-700 hover:bg-gray-600 text-white font-medium",
  danger: "bg-red-600 hover:bg-red-700 text-white font-bold",
  warning:
    "bg-orange-400 hover:bg-orange-500 text-black font-bold transition duration-300",
  info: "bg-[#6574fd] hover:bg-[#4755d4] text-white font-bold transition-colors duration-300",
  teal: "bg-[#73f5ce] hover:bg-[#4ec7a0] text-black font-bold",
  ghost:
    "border-2 border-green-800 bg-transparent hover:bg-[#335833a6] text-white font-bold transition duration-300",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm rounded inline-flex items-center justify-center",
  md: "h-10 px-4 text-sm sm:text-base rounded inline-flex items-center justify-center",
  lg: "h-12 px-6 text-base rounded inline-flex items-center justify-center",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  disabled,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        disabled
          ? "opacity-50 pointer-events-none cursor-not-allowed"
          : "cursor-pointer",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

import { cn } from "@/lib/cn";

export interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin",
        className
      )}
    />
  );
}

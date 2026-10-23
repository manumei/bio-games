export interface TimerDisplayProps {
  secondsLeft: number | null;
}

export default function TimerDisplay({ secondsLeft }: TimerDisplayProps) {
  if (secondsLeft === null) return null;

  return (
    <div className="text-yellow-300 font-bold text-sm sm:text-base text-center">
      <span className="hidden sm:inline">Time Left:</span>
      <span className="inline sm:hidden">Timer:</span>
      <span> {secondsLeft}s</span>
    </div>
  );
}

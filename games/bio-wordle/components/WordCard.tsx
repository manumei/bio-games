import { TOPICS } from "@/games/bio-wordle/config";
import type { Answer } from "@/games/bio-wordle/data/answers";

export interface WordCardProps {
  answer: Answer;
}

export default function WordCard({ answer }: WordCardProps) {
  const topicInfo = TOPICS[answer.topic];

  return (
    <div className="bg-panel text-white rounded-xl p-4 space-y-2.5 border-2 border-primary shadow-md">
      <div className="flex items-center justify-center gap-1.5">
        {answer.word.split("").map((ch, idx) => (
          <span
            key={idx}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded bg-[#228101] text-white font-extrabold text-base sm:text-lg uppercase flex items-center justify-center"
          >
            {ch}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-center">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface text-accent border border-accent/40">
          {topicInfo.emoji} {topicInfo.label}
        </span>
      </div>

      <p className="text-xs sm:text-sm text-gray-100 leading-relaxed">
        {answer.definition}
      </p>
    </div>
  );
}

import React from "react";
import { RisoTheme } from "../../types";

interface WordCountProps {
  count: number;
  theme: RisoTheme;
}

const WordCount: React.FC<WordCountProps> = ({ count, theme }) => {
  return (
    <div
      className="flex items-end gap-2 flex-shrink-0 min-w-0"
      role="status"
      aria-live="polite"
    >
      <span
        className="text-3xl md:text-[3.6rem] font-bold font-mono tracking-[-0.06em] leading-[0.88]"
        style={{ color: theme.text }}
      >
        {count}
      </span>
      <span className="pb-1 text-[10px] md:text-[0.75rem] uppercase tracking-[0.32em] opacity-45">
        words
      </span>
    </div>
  );
};

export default WordCount;

import React, { useState, useEffect, useRef } from "react";
import { RisoTheme } from "../../types";

interface WordCountProps {
  count: number;
  theme: RisoTheme;
}

const WordCount: React.FC<WordCountProps> = ({ count, theme }) => {
  const [faded, setFaded] = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCountRef = useRef(count);

  useEffect(() => {
    if (count !== prevCountRef.current) {
      setFaded(false);
      prevCountRef.current = count;
    }

    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = setTimeout(() => setFaded(true), 2000);

    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [count]);

  return (
    <div
      className="liquid-glass px-3 py-1 md:px-4 md:py-2 flex-shrink-0 transition-opacity duration-500"
      style={{
        opacity: faded ? 0.4 : 1,
        border: `1px solid ${theme.text}15`,
      }}
      role="status"
      aria-live="polite"
    >
      <span
        className="text-xl md:text-3xl font-bold font-mono tracking-tighter"
        style={{ color: theme.text }}
      >
        {count}
      </span>
      <span className="text-[10px] md:text-xs uppercase tracking-widest ml-2 opacity-50">
        words
      </span>
    </div>
  );
};

export default WordCount;

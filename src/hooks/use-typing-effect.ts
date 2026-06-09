"use client";

import { useEffect, useRef, useState } from "react";

export interface TypingLine {
  /** Text typed out character by character. */
  text: string;
  /** Optional class applied to this line's text. */
  className?: string;
  /** Delay (ms) before this line starts typing. */
  delayBefore?: number;
}

interface UseTypingEffectOptions {
  /** ms per character. */
  speed?: number;
  /** Called once every line has finished typing. */
  onComplete?: () => void;
}

interface RenderedLine {
  text: string;
  className?: string;
  done: boolean;
}

/**
 * Types an array of lines sequentially. Returns the lines rendered so far,
 * the index of the line currently typing, and whether the whole sequence
 * has finished. Used by the terminal intro.
 */
export function useTypingEffect(
  lines: TypingLine[],
  { speed = 45, onComplete }: UseTypingEffectOptions = {},
) {
  const [rendered, setRendered] = useState<RenderedLine[]>([]);
  const [activeLine, setActiveLine] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    function wait(ms: number) {
      return new Promise<void>((resolve) => {
        const t = setTimeout(resolve, ms);
        timers.push(t);
      });
    }

    async function run() {
      setRendered([]);
      for (let i = 0; i < lines.length; i++) {
        if (cancelled) return;
        const line = lines[i];
        setActiveLine(i);
        if (line.delayBefore) await wait(line.delayBefore);

        setRendered((prev) => [
          ...prev,
          { text: "", className: line.className, done: false },
        ]);

        for (let c = 1; c <= line.text.length; c++) {
          if (cancelled) return;
          await wait(speed);
          const partial = line.text.slice(0, c);
          setRendered((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], text: partial };
            return next;
          });
        }

        setRendered((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], done: true };
          return next;
        });
      }
      if (!cancelled) {
        setIsComplete(true);
        onCompleteRef.current?.();
      }
    }

    run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed]);

  return { rendered, activeLine, isComplete };
}

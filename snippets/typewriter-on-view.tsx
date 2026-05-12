/**
 * Typewriter animation triggered by viewport entry
 * ================================================
 *
 * Types out a string character by character, but only when the
 * element actually enters the viewport. While off-screen, renders
 * an invisible placeholder of the correct width to prevent layout
 * shift (CLS).
 *
 * Two-component split:
 *   - Typewriter: pure animation primitive, knows nothing about scroll
 *   - TypewriterOnView: wraps Typewriter with an IntersectionObserver
 *     that flips a hasTriggered flag on first visibility
 *
 * Usage:
 *
 *   <h2>
 *     <TypewriterOnView text="Contact" speed={80} delay={200} />
 *   </h2>
 *
 * Knobs:
 *   - speed:  ms per character (lower = faster)
 *   - delay:  ms before the first character appears
 *   - threshold (internal): 0.5 → fire when 50% of the element is visible
 *
 * One typewriter per section is enough. More than one on screen at
 * once makes the page feel like a chatbot demo, not a landing page.
 */

"use client";
import { useState, useEffect, useRef } from "react";

// ── Underlying typewriter primitive ───────────────────────────
function Typewriter({
  text,
  speed = 80,
  delay = 0,
  className = "",
}: {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
}) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const start = () => {
      timer = setTimeout(function step() {
        if (i <= text.length) {
          setShown(text.slice(0, i));
          i++;
          timer = setTimeout(step, speed);
        }
      }, delay);
    };
    start();
    return () => clearTimeout(timer);
  }, [text, speed, delay]);

  return <span className={className}>{shown}</span>;
}

// ── Viewport-triggered wrapper ────────────────────────────────
export default function TypewriterOnView({
  text,
  speed = 80,
  delay = 200,
  className = "",
}: {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
}) {
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered) {
          setHasTriggered(true);
        }
      },
      { threshold: 0.5 },
    );

    const el = ref.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasTriggered]);

  return (
    <span ref={ref} className={className}>
      {hasTriggered ? (
        <Typewriter text={text} speed={speed} delay={delay} />
      ) : (
        // Invisible placeholder of correct width — prevents CLS
        // when the typewriter starts.
        <span className="opacity-0">{text}</span>
      )}
    </span>
  );
}

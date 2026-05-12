/**
 * Reveal-on-scroll wrapper using Framer Motion
 * ============================================
 *
 * Fades-and-slides children in when they scroll into view. Once.
 *
 * The work is offloaded to Framer Motion's whileInView prop, which
 * uses IntersectionObserver under the hood. Cheap, no scroll-event
 * listeners, plays nicely with reduced-motion preferences.
 *
 * Usage:
 *
 *   <Reveal>
 *     <h2>Section heading</h2>
 *   </Reveal>
 *   <Reveal delay={0.1}>
 *     <p>Section description.</p>
 *   </Reveal>
 *
 * Knobs:
 *   - amount: 0.35  →  fire when 35% of the element is in view
 *   - once: true    →  animate only the first time it enters view
 *   - delay (prop)  →  stagger child elements with cumulative delays
 */

"use client";
import { motion } from "framer-motion";

export default function Reveal({
  children,
  delay = 0.1,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

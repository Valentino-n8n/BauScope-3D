# Scroll Animation Patterns

Two patterns for making a landing page feel alive without being
noisy:

1. **Reveal-on-scroll** — fade-and-slide a block in when it enters
   the viewport. Once. Never again.
2. **Typewriter-on-view** — type out a heading character by
   character, but only when the user actually scrolls to it (not
   while it's still off-screen).

Both rely on the same primitive: `IntersectionObserver`, the
browser API for asking "is this element visible?". The difference
is who manages the observer — Framer Motion handles the first one,
manual `useEffect` handles the second.

## Pattern 1: Reveal on scroll (Framer Motion)

Framer Motion has a `whileInView` prop that does exactly this.
Pass an animation target, set `viewport={{ once: true }}`, and the
animation fires once when the element first scrolls in.

```tsx
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
```

Three knobs that matter:

- **`amount: 0.35`** — fire when 35% of the element is in view.
  Lower (`0.1`) = fires early, animation can be missed if user
  scrolls fast. Higher (`0.5`) = fires later, can feel laggy.
  35% is a good default for blocks of content.

- **`once: true`** — animate only the first time. Without this,
  scrolling up and back down replays the animation, which gets
  annoying.

- **`delay`** — stagger child elements. If you wrap several items
  in `<Reveal>` with `delay={0}`, `delay={0.1}`, `delay={0.2}`,
  they cascade in nicely without you having to think about it.

Usage in a page:

```tsx
<Reveal>
  <h2>Section heading</h2>
</Reveal>
<Reveal delay={0.1}>
  <p>Section description.</p>
</Reveal>
<Reveal delay={0.2}>
  <button>Call to action</button>
</Reveal>
```

The full snippet is in
[`../snippets/reveal-on-scroll.tsx`](../snippets/reveal-on-scroll.tsx).

## Pattern 2: Typewriter on viewport entry

The typewriter pattern types out a string one character at a time.
The wrinkle: if you start the typewriter immediately on mount, the
animation runs while the user is still scrolling somewhere else,
and they miss it.

The fix: don't start the typewriter until the element is actually
visible. Two-component split:

- **`Typewriter`** — the character-by-character animation. Knows
  nothing about scrolling.
- **`TypewriterOnView`** — wraps `Typewriter` in an
  `IntersectionObserver` that flips a `hasTriggered` flag when the
  element enters the viewport. Until the flag flips, it renders an
  invisible placeholder of the same width (so the layout doesn't
  jump when the typewriter starts).

```tsx
"use client";
import { useState, useEffect, useRef } from "react";
import Typewriter from "./Typewriter";

export default function TypewriterOnView({
  text,
  speed = 80,
  delay = 200,
}: {
  text: string;
  speed?: number;
  delay?: number;
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
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasTriggered]);

  return (
    <span ref={ref}>
      {hasTriggered ? (
        <Typewriter text={text} speed={speed} delay={delay} />
      ) : (
        <span className="opacity-0">{text}</span>
      )}
    </span>
  );
}
```

Two details that aren't obvious:

**The invisible placeholder.** When `hasTriggered` is false, we
render the text with `opacity-0` so the element occupies the
correct width and height. Without this, the page would be missing
the heading until the observer fires, then suddenly grow as the
typewriter unrolls. Layout shift is bad for both UX and Core Web
Vitals (CLS).

**`threshold: 0.5`** — fire when 50% of the element is visible.
The typewriter is usually a heading, which is short — wait until
it's clearly in view before starting, otherwise it triggers when
you can barely see it.

The full snippet is in
[`../snippets/typewriter-on-view.tsx`](../snippets/typewriter-on-view.tsx).

## When to use which

- **Use `Reveal`** for paragraphs, images, cards, buttons, and most
  block content.
- **Use `TypewriterOnView`** for the *one* dramatic heading per
  section. More than one typewriter on screen at the same time
  makes the page feel like a chatbot demo, not a landing page.
- **Use neither** for the page's main hero heading on initial load
  — it should be visible immediately. Animation is for content
  *below* the fold.

## Performance

Both patterns use `IntersectionObserver`, which is much cheaper
than scroll-event-based detection. The browser computes
intersections off the main thread when it can. For a page with
30 reveal blocks, total overhead is negligible.

`Reveal` adds Framer Motion to the bundle (~30kb gzipped). If you
only need fade-and-slide on scroll, you can implement the same
pattern in plain CSS with `@starting-style` or the `view-timeline`
property — but browser support is patchy. Framer Motion is the
pragmatic choice today.

## Things to avoid

- **Don't animate everything.** A few reveals per section feel
  intentional; reveals on every paragraph feel chaotic.
- **Don't animate above the fold.** The user expects the page to
  be there when they arrive. Animating the hero on load adds
  perceived latency.
- **Don't forget reduced motion.** Framer Motion respects
  `prefers-reduced-motion` automatically (animations become
  instant transitions). For your custom IntersectionObserver
  animations, check `window.matchMedia('(prefers-reduced-motion:
  reduce)').matches` and skip the animation when true.

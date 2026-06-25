'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

// ─── Blur-in (usado por Hero) ────────────────────────────────────────────────
const BLUR_EASE = [0.22, 1, 0.36, 1] as const;

export const blurInContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

export const blurInWord: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(12px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: BLUR_EASE },
  },
};

export function BlurWord({ children }: { children: ReactNode }) {
  return (
    <motion.span variants={blurInWord} className="inline-block">
      {children}
    </motion.span>
  );
}

// ─── Mask Reveal Up (animate-text: mask-reveal-up) ──────────────────────────
// Per-line: cada línea sube desde abajo con fade + blur suave.
// Spec: duration 760ms × 0.72 = 547ms | stagger 90ms × 0.72 = 65ms
//       y 30px × 0.58 (y_travel_multiplier) = 17px | blur 6px
//       ease enter: cubic-bezier(0.22, 1, 0.36, 1)
const MASK_ENTER_EASE = [0.22, 1, 0.36, 1] as const;
const MASK_DURATION = 0.547;
const MASK_STAGGER = 0.065;
const MASK_Y = 30 * 0.58; // ≈ 17px

const maskContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: MASK_STAGGER } },
};

const maskLine: Variants = {
  hidden: { opacity: 0, y: MASK_Y, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: MASK_DURATION, ease: MASK_ENTER_EASE },
  },
};

type Tag = 'h1' | 'h2' | 'h3' | 'p' | 'span';

/** Anima un texto plano línea por línea con efecto mask-reveal-up. */
export function AnimatedText({
  text,
  as = 'h2',
  className,
  trigger = 'view',
  delay = 0,
}: {
  text: string;
  as?: Tag;
  className?: string;
  /** 'load' anima al montar; 'view' al entrar en viewport. */
  trigger?: 'load' | 'view';
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];
  const lines = text.split('\n');

  const containerWithDelay: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: MASK_STAGGER, delayChildren: delay } },
  };

  const animProps = reduced
    ? { initial: 'visible' as const, animate: 'visible' as const }
    : trigger === 'view'
      ? {
          initial: 'hidden' as const,
          whileInView: 'visible' as const,
          viewport: { once: true, margin: '-80px' },
        }
      : { initial: 'hidden' as const, animate: 'visible' as const };

  return (
    <MotionTag
      className={className}
      aria-label={text}
      variants={delay ? containerWithDelay : maskContainer}
      {...animProps}
    >
      {lines.map((line, i) => (
        // overflow-hidden crea el "mask": el texto sube desde abajo del borde.
        <span key={i} className="block overflow-hidden">
          <motion.span
            aria-hidden
            variants={maskLine}
            className="block"
            style={{ willChange: 'transform, opacity, filter' }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

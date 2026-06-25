'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Efecto "soft blur in" (catálogo animate-text): cada palabra entra con fade +
 * leve subida + desenfoque que se disipa. Apple-style hero/title reveal.
 */
const EASE = [0.22, 1, 0.36, 1] as const;

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
    transition: { duration: 0.9, ease: EASE },
  },
};

/** Una palabra animada (inline-block para que transform/blur funcionen). */
export function BlurWord({ children }: { children: ReactNode }) {
  return (
    <motion.span variants={blurInWord} className="inline-block">
      {children}
    </motion.span>
  );
}

type Tag = 'h1' | 'h2' | 'h3' | 'p' | 'span';

/** Anima un texto plano palabra por palabra. */
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
  const words = text.split(' ');

  const animationProps = reduced
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
      variants={blurInContainer}
      transition={{ delayChildren: delay }}
      {...animationProps}
    >
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block whitespace-pre">
          <BlurWord>{w}</BlurWord>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </MotionTag>
  );
}

'use client';

import { motion } from 'framer-motion';

/**
 * App Router re-monta este template en cada navegación → fade/translate sutil
 * de entrada entre páginas (catálogo ↔ detalle). Compatible con output: export.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

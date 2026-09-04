import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

/** Consistent route transition (§2.1 of the master prompt): a soft
 * crossfade + scale + RTL-aware slide. Respects prefers-reduced-motion by
 * collapsing to an instant, motion-free fade. */
export default function PageTransition({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, x: -16 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.98, x: 16 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

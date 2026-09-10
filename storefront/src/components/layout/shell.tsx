import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Header } from "./header";
import { Footer } from "./footer";
import { Lattice } from "@/components/lattice";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const reduce = useReducedMotion();
  return (
    <div className="noise relative flex min-h-dvh flex-col">
      <Lattice />
      <div className="relative z-10 flex min-h-dvh flex-col">
        <Header />
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: reduce ? 0 : 0.34, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1"
          >
            {children}
          </motion.main>
        </AnimatePresence>
        <Footer />
      </div>
    </div>
  );
}

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 220, damping: 20 });
  const sy = useSpring(ry, { stiffness: 220, damping: 20 });

  function onMove(e: React.PointerEvent) {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rx.set(py * -8);
    ry.set(px * 8);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      style={{ rotateX: reduce ? 0 : sx, rotateY: reduce ? 0 : sy, transformPerspective: 800 }}
      className={cn(
        "group rounded-xl bg-elevated stage-lift transition-[box-shadow,transform] duration-200",
        "hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-primary)_35%,transparent),0_28px_64px_-24px_black]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

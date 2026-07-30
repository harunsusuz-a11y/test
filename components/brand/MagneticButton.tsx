"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Manyetik buton: imleç butona yaklaştıkça buton hafifçe ona doğru kayar
 * (premium-frontend-ui "high-fidelity micro-interactions" ilkesi).
 * Yalnızca gerçek imleçli, hassas işaretçili cihazlarda çalışır
 * (hover: hover + pointer: fine) — dokunmatik cihazlarda sıfır maliyet.
 * prefers-reduced-motion'da tamamen devre dışı.
 */
export function MagneticButton({
  children,
  className = "",
  strength = 0.35,
}: {
  children: React.ReactNode;
  className?: string;
  /** 0-1 arası — imlece ne kadar güçlü tepki verileceği */
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.4 });

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return; // dokunmatikte manyetik etki yok
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * strength);
    y.set(relY * strength);
  }

  function handlePointerLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ x: springX, y: springY }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}

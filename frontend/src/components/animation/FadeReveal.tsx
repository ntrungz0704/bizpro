"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

interface FadeRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  duration?: number;
}

export default function FadeReveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
  duration = 0.5,
}: FadeRevealProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDesktop(window.matchMedia("(min-width: 768px)").matches);
  }, []);

  if (!mounted) {
    return <div className={className}>{children}</div>;
  }

  // Mobile: keep motion ultra-light to avoid scroll lag
  if (!isDesktop) {
    return (
      <div className={`transition-opacity duration-300 ${className}`}>
        {children}
      </div>
    );
  }

  const offset = 24;
  const initialVariants = {
    up: { opacity: 0, y: offset },
    down: { opacity: 0, y: -offset },
    left: { opacity: 0, x: offset },
    right: { opacity: 0, x: -offset },
    none: { opacity: 0 },
  };

  return (
    <motion.div
      initial={initialVariants[direction]}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

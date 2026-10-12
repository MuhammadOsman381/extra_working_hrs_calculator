"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type CardProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: ReactNode;
  interactive?: boolean;
  hoverGradient?: boolean;
  className?: string;
  as?: "div" | "section" | "article";
};

export function Card({
  children,
  interactive = true,
  hoverGradient = true,
  className = "",
  as = "div",
  ...props
}: CardProps) {
  const Component = as === "section" ? motion.section : as === "article" ? motion.article : motion.div;

  return (
    <Component
      whileHover={interactive ? { y: -3 } : undefined}
      transition={{ duration: 0.25 }}
      className={`group/card relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-6 shadow-[var(--shadow-card)] backdrop-blur-sm ${
        hoverGradient ? "hover:border-[var(--accent)]/55" : ""
      } ${className}`}
      {...props}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-60"
      />
      {hoverGradient ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition duration-500 group-hover/card:opacity-100"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in_srgb,var(--gradient-start)_44%,transparent), color-mix(in_srgb,var(--gradient-mid)_30%,transparent) 48%, color-mix(in_srgb,var(--gradient-end)_40%,transparent))",
          }}
        />
      ) : null}
      <div className="relative z-10">{children}</div>
    </Component>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "accent";
  icon?: ReactNode;
};

const variants = {
  primary: "bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 disabled:opacity-45",
  accent: "bg-[var(--accent)] text-zinc-950 shadow-[0_12px_40px_rgba(52,211,153,0.22)] hover:bg-[var(--accent-strong)] disabled:opacity-45",
  secondary: "border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] disabled:opacity-45",
  danger: "bg-[var(--danger)] text-white hover:opacity-90 disabled:opacity-45",
  ghost: "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] disabled:opacity-45",
};

export function Button({ className = "", variant = "primary", icon, children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

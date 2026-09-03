import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";

export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 text-sm font-medium text-[var(--muted)] ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-11 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--subtle)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)] ${props.className ?? ""}`}
    />
  );
}

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={`text-sm font-medium text-[var(--muted)] ${props.className ?? ""}`} />;
}

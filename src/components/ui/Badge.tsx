import type { ReactNode } from "react";

export function Badge({ children, tone = "brand" }: { children: ReactNode; tone?: "brand" | "muted" }) {
  const toneClasses =
    tone === "brand"
      ? "bg-brand-light text-brand-dark"
      : "bg-surface text-muted border border-border";
  return (
    <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium ${toneClasses}`}>
      {children}
    </span>
  );
}

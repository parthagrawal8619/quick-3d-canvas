import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 border px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "border-primary bg-primary text-primary-foreground hover:bg-primary/85",
        variant === "outline" && "border-border-strong bg-surface/65 text-foreground hover:border-primary hover:text-primary",
        variant === "ghost" && "border-transparent bg-transparent text-muted-foreground hover:text-foreground",
        variant === "danger" && "border-destructive bg-destructive/15 text-destructive hover:bg-destructive/25",
        className,
      )}
      {...props}
    />
  );
}
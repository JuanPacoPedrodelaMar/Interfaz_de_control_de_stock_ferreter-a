"use client";

import { useTheme } from "../../hooks/useTheme";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      style={
        {
          "--normal-bg":      "var(--card)",
          "--normal-text":    "var(--card-foreground)",
          "--normal-border":  "var(--border)",

          "--success-bg":     "var(--card)",
          "--success-text":   "var(--card-foreground)",
          "--success-border": "var(--border)",

          "--error-bg":       "var(--card)",
          "--error-text":     "var(--card-foreground)",
          "--error-border":   "var(--border)",

          "--warning-bg":     "var(--card)",
          "--warning-text":   "var(--card-foreground)",
          "--warning-border": "var(--border)",

          "--info-bg":        "var(--card)",
          "--info-text":      "var(--card-foreground)",
          "--info-border":    "var(--border)",

          "--border-radius":  "var(--radius)",
          "--width":          "300px",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
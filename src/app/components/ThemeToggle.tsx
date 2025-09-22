"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isLight = (resolvedTheme ?? theme) === "light";
  return (
    <button
      onClick={() => setTheme(isLight ? "dark" : "light")}
      aria-label="Toggle theme"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        borderRadius: 8,
        background: "var(--panel)",
        color: "var(--text)",
        border: "1px solid rgba(255,255,255,.1)",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.15s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(74,198,255,.1)";
        e.currentTarget.style.borderColor = "var(--accent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--panel)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,.1)";
      }}
    >
      <Sun size={16} />
      {isLight ? "Dark" : "Light"}
    </button>
  );
}

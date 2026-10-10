"use client";

import { usePreferences } from "@/components/PreferencesProvider";
import { useToast } from "@/components/ToastProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = usePreferences();
  const { showToast } = useToast();

  function handleToggle() {
    try {
      toggleTheme();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  return (
    <button className="theme-toggle" onClick={handleToggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
      <span aria-hidden="true">{theme === "dark" ? "☼" : "☾"}</span>
    </button>
  );
}

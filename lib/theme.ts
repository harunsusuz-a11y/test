export type Theme = "dark" | "light";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem("admin-theme") as Theme) ?? "dark";
}

export function setTheme(theme: Theme) {
  localStorage.setItem("admin-theme", theme);
  document.documentElement.setAttribute("data-theme", theme);
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "light") {
    root.style.setProperty("--bg-primary", "#f4f4f6");
    root.style.setProperty("--bg-secondary", "#ffffff");
    root.style.setProperty("--bg-elevated", "#f9f9fb");
    root.style.setProperty("--text-primary", "#111118");
    root.style.setProperty("--text-secondary", "#4a4a55");
    root.style.setProperty("--text-muted", "#8a8a95");
    root.style.setProperty("--border", "rgba(0,0,0,0.08)");
    root.style.setProperty("--accent", "#c8a26b");
  } else {
    root.style.setProperty("--bg-primary", "#0a0a0d");
    root.style.setProperty("--bg-secondary", "#1a1a1f");
    root.style.setProperty("--bg-elevated", "#151518");
    root.style.setProperty("--text-primary", "#f2f2f3");
    root.style.setProperty("--text-secondary", "#9b9ba4");
    root.style.setProperty("--text-muted", "#6b6b76");
    root.style.setProperty("--border", "rgba(255,255,255,0.08)");
    root.style.setProperty("--accent", "#c8a26b");
  }
}

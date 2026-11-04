try {
  if (localStorage.getItem("orbit-theme") === "dark") {
    document.documentElement.classList.add("dark");
  }
} catch {
  // Storage is unavailable: fall back to the default (light) theme.
}

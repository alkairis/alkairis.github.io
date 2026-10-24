import { create } from 'zustand';

export type Theme = 'light' | 'dark';

// Shared with the boot script in index.html, which applies the theme before
// first paint so a dark-mode visitor never sees a light flash.
const STORAGE_KEY = 'alkairis-theme';

// Browser-chrome colour on mobile; matches --bg-rgb for each theme.
const THEME_COLOR: Record<Theme, string> = {
  light: '#f6f3fa',
  dark: '#050505',
};

const systemTheme = (): Theme =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const storedTheme = (): Theme | null => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null; // storage blocked (privacy mode) — fall back to the OS
  }
};

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLOR[theme]);
};

type ThemeStore = {
  theme: Theme;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
  // The boot script has already set data-theme; read it back so the store and
  // the page agree from the first render.
  theme: (document.documentElement.dataset.theme as Theme | undefined) ?? storedTheme() ?? systemTheme(),

  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;

    // Cross-fade only for the switch itself; see `.theme-switching` in index.css.
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) {
      root.classList.add('theme-switching');
      window.setTimeout(() => root.classList.remove('theme-switching'), 400);
    }

    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* not persisted — the choice still holds for this page view */
    }
    set({ theme: next });
  },
}));

// Until the visitor picks a theme themselves, keep following the OS setting.
window
  .matchMedia?.('(prefers-color-scheme: dark)')
  .addEventListener?.('change', (event) => {
    if (storedTheme()) return;
    const theme: Theme = event.matches ? 'dark' : 'light';
    applyTheme(theme);
    useThemeStore.setState({ theme });
  });

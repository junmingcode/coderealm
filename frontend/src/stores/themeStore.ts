import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  setDark: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: (() => {
        const stored = localStorage.getItem('theme');
        if (stored) return stored === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      })(),
      toggle: () => {
        const newDark = !get().isDark;
        set({ isDark: newDark });
        document.documentElement.setAttribute('data-theme', newDark ? 'dark' : 'light');
      },
      setDark: (dark: boolean) => {
        set({ isDark: dark });
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
      },
    }),
    {
      name: 'theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute('data-theme', state.isDark ? 'dark' : 'light');
        }
      },
    }
  )
);

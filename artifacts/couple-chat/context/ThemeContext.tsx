import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { THEMES, ThemeName, ThemePalette, radius } from "@/constants/themes";

interface ThemeContextValue {
  activeTheme: ThemeName;
  palette: ThemePalette & { radius: number };
  setTheme: (name: ThemeName) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

const defaultTheme: ThemeContextValue = {
  activeTheme: "cyberNight",
  palette: { ...THEMES.cyberNight, radius },
  setTheme: () => {},
  isFullscreen: false,
  toggleFullscreen: () => {},
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activeTheme, setActiveTheme] = useState<ThemeName>("cyberNight");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet(["activeTheme", "isFullscreen"]).then(([themeEntry, fsEntry]) => {
      if (themeEntry[1]) setActiveTheme(themeEntry[1] as ThemeName);
      if (fsEntry[1]) setIsFullscreen(fsEntry[1] === "true");
    });
  }, []);

  const setTheme = useCallback(async (name: ThemeName) => {
    setActiveTheme(name);
    await AsyncStorage.setItem("activeTheme", name);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    setIsFullscreen((prev) => {
      const next = !prev;
      AsyncStorage.setItem("isFullscreen", String(next));
      return next;
    });
  }, []);

  const palette = { ...THEMES[activeTheme], radius };

  return (
    <ThemeContext.Provider value={{ activeTheme, palette, setTheme, isFullscreen, toggleFullscreen }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    console.warn("useTheme called outside ThemeProvider. Using default theme.");
    return defaultTheme;
  }
  return ctx;
}

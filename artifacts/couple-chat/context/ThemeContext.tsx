import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { THEMES, ThemeName, ThemePalette, radius } from "@/constants/themes";

interface ThemeContextValue {
  activeTheme: ThemeName;
  palette: ThemePalette & { radius: number };
  setTheme: (name: ThemeName) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  chatBackground: string | null;
  setChatBackground: (uri: string | null) => Promise<void>;
}

const defaultTheme: ThemeContextValue = {
  activeTheme: "cyberNight",
  palette: { ...THEMES.cyberNight, radius },
  setTheme: () => {},
  isFullscreen: false,
  toggleFullscreen: () => {},
  chatBackground: null,
  setChatBackground: async () => {},
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activeTheme, setActiveTheme] = useState<ThemeName>("cyberNight");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chatBackground, setChatBackgroundState] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.multiGet(["activeTheme", "isFullscreen", "chatBackground"]).then(
      ([themeEntry, fsEntry, bgEntry]) => {
        if (themeEntry[1]) setActiveTheme(themeEntry[1] as ThemeName);
        if (fsEntry[1]) setIsFullscreen(fsEntry[1] === "true");
        if (bgEntry[1]) setChatBackgroundState(bgEntry[1]);
      }
    );
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

  const setChatBackground = useCallback(async (uri: string | null) => {
    setChatBackgroundState(uri);
    if (uri) {
      await AsyncStorage.setItem("chatBackground", uri);
    } else {
      await AsyncStorage.removeItem("chatBackground");
    }
  }, []);

  const palette = { ...THEMES[activeTheme], radius };

  return (
    <ThemeContext.Provider value={{ activeTheme, palette, setTheme, isFullscreen, toggleFullscreen, chatBackground, setChatBackground }}>
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

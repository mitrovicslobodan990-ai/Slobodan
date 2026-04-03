import { useTheme } from "@/context/ThemeContext";

/**
 * Returns the active theme palette + radius.
 * Theme is selected by user in settings, not by device color scheme.
 */
export function useColors() {
  const { palette } = useTheme();
  return palette;
}

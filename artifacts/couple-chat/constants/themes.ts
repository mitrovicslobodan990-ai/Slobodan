export type ThemeName =
  | "cyberNight"
  | "midnightPurple"
  | "oceanNight"
  | "forestDark"
  | "sunsetRose"
  | "arcticBlue"
  | "mintPearl"
  | "lavenderMist"
  | "peachFrost";

export interface ThemePalette {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  text: string;
  tint: string;
  myBubble: string;
  theirBubble: string;
  myBubbleText: string;
  theirBubbleText: string;
  headerBg: string;
  statusBarStyle: "light" | "dark";
}

export interface ThemeMeta {
  name: ThemeName;
  label: string;
  emoji: string;
  preview: string[];
}

export const THEMES: Record<ThemeName, ThemePalette> = {
  cyberNight: {
    background: "#0a0a0f",
    foreground: "#f0f0ff",
    card: "#111118",
    cardForeground: "#f0f0ff",
    primary: "#7c3aed",
    primaryForeground: "#ffffff",
    secondary: "#1c1c2e",
    secondaryForeground: "#a78bfa",
    muted: "#16161f",
    mutedForeground: "#6b6b8a",
    accent: "#06b6d4",
    accentForeground: "#ffffff",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#1e1e2e",
    input: "#1e1e2e",
    text: "#f0f0ff",
    tint: "#7c3aed",
    myBubble: "#7c3aed",
    theirBubble: "#1c1c2e",
    myBubbleText: "#ffffff",
    theirBubbleText: "#c4b5fd",
    headerBg: "#0a0a0f",
    statusBarStyle: "light",
  },

  midnightPurple: {
    background: "#08010f",
    foreground: "#ede9fe",
    card: "#110820",
    cardForeground: "#ede9fe",
    primary: "#a855f7",
    primaryForeground: "#ffffff",
    secondary: "#1e0a35",
    secondaryForeground: "#d8b4fe",
    muted: "#160a28",
    mutedForeground: "#7c5fa0",
    accent: "#ec4899",
    accentForeground: "#ffffff",
    destructive: "#f43f5e",
    destructiveForeground: "#ffffff",
    border: "#2a1045",
    input: "#2a1045",
    text: "#ede9fe",
    tint: "#a855f7",
    myBubble: "#7e22ce",
    theirBubble: "#1e0a35",
    myBubbleText: "#ffffff",
    theirBubbleText: "#d8b4fe",
    headerBg: "#08010f",
    statusBarStyle: "light",
  },

  oceanNight: {
    background: "#010d1a",
    foreground: "#e0f2fe",
    card: "#051525",
    cardForeground: "#e0f2fe",
    primary: "#0ea5e9",
    primaryForeground: "#ffffff",
    secondary: "#082030",
    secondaryForeground: "#7dd3fc",
    muted: "#071a28",
    mutedForeground: "#3d7a9a",
    accent: "#06b6d4",
    accentForeground: "#ffffff",
    destructive: "#f43f5e",
    destructiveForeground: "#ffffff",
    border: "#0c2a40",
    input: "#0c2a40",
    text: "#e0f2fe",
    tint: "#0ea5e9",
    myBubble: "#0369a1",
    theirBubble: "#082030",
    myBubbleText: "#ffffff",
    theirBubbleText: "#7dd3fc",
    headerBg: "#010d1a",
    statusBarStyle: "light",
  },

  forestDark: {
    background: "#020b04",
    foreground: "#dcfce7",
    card: "#071209",
    cardForeground: "#dcfce7",
    primary: "#22c55e",
    primaryForeground: "#ffffff",
    secondary: "#0f2412",
    secondaryForeground: "#86efac",
    muted: "#0a1c0c",
    mutedForeground: "#3d7a4a",
    accent: "#4ade80",
    accentForeground: "#000000",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#142e18",
    input: "#142e18",
    text: "#dcfce7",
    tint: "#22c55e",
    myBubble: "#15803d",
    theirBubble: "#0f2412",
    myBubbleText: "#ffffff",
    theirBubbleText: "#86efac",
    headerBg: "#020b04",
    statusBarStyle: "light",
  },

  sunsetRose: {
    background: "#0f0208",
    foreground: "#ffe4e6",
    card: "#1c0510",
    cardForeground: "#ffe4e6",
    primary: "#f43f5e",
    primaryForeground: "#ffffff",
    secondary: "#2d0a18",
    secondaryForeground: "#fda4af",
    muted: "#200812",
    mutedForeground: "#7a3048",
    accent: "#fb7185",
    accentForeground: "#ffffff",
    destructive: "#dc2626",
    destructiveForeground: "#ffffff",
    border: "#3d1020",
    input: "#3d1020",
    text: "#ffe4e6",
    tint: "#f43f5e",
    myBubble: "#be123c",
    theirBubble: "#2d0a18",
    myBubbleText: "#ffffff",
    theirBubbleText: "#fda4af",
    headerBg: "#0f0208",
    statusBarStyle: "light",
  },

  arcticBlue: {
    background: "#f8fafc",
    foreground: "#0f172a",
    card: "#ffffff",
    cardForeground: "#0f172a",
    primary: "#3b82f6",
    primaryForeground: "#ffffff",
    secondary: "#eff6ff",
    secondaryForeground: "#1d4ed8",
    muted: "#f1f5f9",
    mutedForeground: "#64748b",
    accent: "#0ea5e9",
    accentForeground: "#ffffff",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#e2e8f0",
    input: "#e2e8f0",
    text: "#0f172a",
    tint: "#3b82f6",
    myBubble: "#2563eb",
    theirBubble: "#f1f5f9",
    myBubbleText: "#ffffff",
    theirBubbleText: "#0f172a",
    headerBg: "#1d4ed8",
    statusBarStyle: "light",
  },

  mintPearl: {
    background: "#f0fdf4",
    foreground: "#052e16",
    card: "#ffffff",
    cardForeground: "#052e16",
    primary: "#10b981",
    primaryForeground: "#ffffff",
    secondary: "#d1fae5",
    secondaryForeground: "#065f46",
    muted: "#ecfdf5",
    mutedForeground: "#6b7280",
    accent: "#34d399",
    accentForeground: "#ffffff",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#d1fae5",
    input: "#d1fae5",
    text: "#052e16",
    tint: "#10b981",
    myBubble: "#059669",
    theirBubble: "#f0fdf4",
    myBubbleText: "#ffffff",
    theirBubbleText: "#052e16",
    headerBg: "#065f46",
    statusBarStyle: "light",
  },

  lavenderMist: {
    background: "#faf5ff",
    foreground: "#1e1b4b",
    card: "#ffffff",
    cardForeground: "#1e1b4b",
    primary: "#8b5cf6",
    primaryForeground: "#ffffff",
    secondary: "#ede9fe",
    secondaryForeground: "#4c1d95",
    muted: "#f5f3ff",
    mutedForeground: "#6d6a8a",
    accent: "#a78bfa",
    accentForeground: "#ffffff",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#ddd6fe",
    input: "#ddd6fe",
    text: "#1e1b4b",
    tint: "#8b5cf6",
    myBubble: "#7c3aed",
    theirBubble: "#f5f3ff",
    myBubbleText: "#ffffff",
    theirBubbleText: "#1e1b4b",
    headerBg: "#4c1d95",
    statusBarStyle: "light",
  },

  peachFrost: {
    background: "#fff7ed",
    foreground: "#1c0a00",
    card: "#ffffff",
    cardForeground: "#1c0a00",
    primary: "#f97316",
    primaryForeground: "#ffffff",
    secondary: "#ffedd5",
    secondaryForeground: "#9a3412",
    muted: "#fef3e2",
    mutedForeground: "#78716c",
    accent: "#fb923c",
    accentForeground: "#ffffff",
    destructive: "#dc2626",
    destructiveForeground: "#ffffff",
    border: "#fed7aa",
    input: "#fed7aa",
    text: "#1c0a00",
    tint: "#f97316",
    myBubble: "#ea580c",
    theirBubble: "#fff7ed",
    myBubbleText: "#ffffff",
    theirBubbleText: "#1c0a00",
    headerBg: "#9a3412",
    statusBarStyle: "light",
  },
};

export const THEME_META: ThemeMeta[] = [
  {
    name: "cyberNight",
    label: "Cyber",
    emoji: "⚡",
    preview: ["#0a0a0f", "#7c3aed", "#06b6d4"],
  },
  {
    name: "midnightPurple",
    label: "Midnight",
    emoji: "🌙",
    preview: ["#08010f", "#a855f7", "#ec4899"],
  },
  {
    name: "oceanNight",
    label: "Ocean",
    emoji: "🌊",
    preview: ["#010d1a", "#0ea5e9", "#06b6d4"],
  },
  {
    name: "forestDark",
    label: "Forest",
    emoji: "🌲",
    preview: ["#020b04", "#22c55e", "#4ade80"],
  },
  {
    name: "sunsetRose",
    label: "Sunset",
    emoji: "🌹",
    preview: ["#0f0208", "#f43f5e", "#fb7185"],
  },
  {
    name: "arcticBlue",
    label: "Arctic",
    emoji: "❄️",
    preview: ["#f8fafc", "#3b82f6", "#0ea5e9"],
  },
  {
    name: "mintPearl",
    label: "Mint",
    emoji: "🌿",
    preview: ["#f0fdf4", "#10b981", "#34d399"],
  },
  {
    name: "lavenderMist",
    label: "Lavender",
    emoji: "💜",
    preview: ["#faf5ff", "#8b5cf6", "#a78bfa"],
  },
  {
    name: "peachFrost",
    label: "Peach",
    emoji: "🍑",
    preview: ["#fff7ed", "#f97316", "#fb923c"],
  },
];

export const radius = 14;

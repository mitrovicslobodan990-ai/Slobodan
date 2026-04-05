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
    background: "#09090d",
    foreground: "#e8e8f0",
    card: "#13131f",
    cardForeground: "#e8e8f0",
    primary: "#00e676",
    primaryForeground: "#000000",
    secondary: "#1a0a2e",
    secondaryForeground: "#c084fc",
    muted: "#1a1a28",
    mutedForeground: "#7070a0",
    accent: "#9c27b0",
    accentForeground: "#ffffff",
    destructive: "#ff1744",
    destructiveForeground: "#ffffff",
    border: "#1e1e30",
    input: "#1e1e30",
    text: "#e8e8f0",
    tint: "#00e676",
    myBubble: "#00c853",
    theirBubble: "#1a0a2e",
    myBubbleText: "#000000",
    theirBubbleText: "#c084fc",
    headerBg: "#0d0d1a",
    statusBarStyle: "light",
  },

  midnightPurple: {
    background: "#0d0014",
    foreground: "#f0e8ff",
    card: "#1a0a2e",
    cardForeground: "#f0e8ff",
    primary: "#9c27b0",
    primaryForeground: "#ffffff",
    secondary: "#2d1040",
    secondaryForeground: "#e040fb",
    muted: "#1e0a30",
    mutedForeground: "#8060a0",
    accent: "#e040fb",
    accentForeground: "#0d0014",
    destructive: "#ff1744",
    destructiveForeground: "#ffffff",
    border: "#2d1040",
    input: "#2d1040",
    text: "#f0e8ff",
    tint: "#e040fb",
    myBubble: "#7b1fa2",
    theirBubble: "#2d1040",
    myBubbleText: "#ffffff",
    theirBubbleText: "#e0b0ff",
    headerBg: "#12001f",
    statusBarStyle: "light",
  },

  oceanNight: {
    background: "#050f1a",
    foreground: "#e0f4ff",
    card: "#0a1e30",
    cardForeground: "#e0f4ff",
    primary: "#00bcd4",
    primaryForeground: "#000000",
    secondary: "#0a2040",
    secondaryForeground: "#80deea",
    muted: "#0d1e30",
    mutedForeground: "#406080",
    accent: "#0288d1",
    accentForeground: "#ffffff",
    destructive: "#ff5252",
    destructiveForeground: "#ffffff",
    border: "#0d2035",
    input: "#0d2035",
    text: "#e0f4ff",
    tint: "#00bcd4",
    myBubble: "#00838f",
    theirBubble: "#0a2040",
    myBubbleText: "#ffffff",
    theirBubbleText: "#80deea",
    headerBg: "#030d16",
    statusBarStyle: "light",
  },

  forestDark: {
    background: "#060f08",
    foreground: "#e8f5e9",
    card: "#0d1f10",
    cardForeground: "#e8f5e9",
    primary: "#4caf50",
    primaryForeground: "#000000",
    secondary: "#1a2e1c",
    secondaryForeground: "#a5d6a7",
    muted: "#0f1f12",
    mutedForeground: "#4a7050",
    accent: "#81c784",
    accentForeground: "#000000",
    destructive: "#ef5350",
    destructiveForeground: "#ffffff",
    border: "#1a2e1c",
    input: "#1a2e1c",
    text: "#e8f5e9",
    tint: "#66bb6a",
    myBubble: "#2e7d32",
    theirBubble: "#1a2e1c",
    myBubbleText: "#ffffff",
    theirBubbleText: "#c8e6c9",
    headerBg: "#050d06",
    statusBarStyle: "light",
  },

  sunsetRose: {
    background: "#1a060a",
    foreground: "#ffe8ed",
    card: "#2e0a12",
    cardForeground: "#ffe8ed",
    primary: "#f48fb1",
    primaryForeground: "#1a0008",
    secondary: "#3d1020",
    secondaryForeground: "#f48fb1",
    muted: "#250810",
    mutedForeground: "#804050",
    accent: "#f06292",
    accentForeground: "#ffffff",
    destructive: "#ff1744",
    destructiveForeground: "#ffffff",
    border: "#3d1020",
    input: "#3d1020",
    text: "#ffe8ed",
    tint: "#f48fb1",
    myBubble: "#ad1457",
    theirBubble: "#3d1020",
    myBubbleText: "#ffffff",
    theirBubbleText: "#f48fb1",
    headerBg: "#120308",
    statusBarStyle: "light",
  },

  arcticBlue: {
    background: "#f0f4f8",
    foreground: "#1a2030",
    card: "#ffffff",
    cardForeground: "#1a2030",
    primary: "#1565c0",
    primaryForeground: "#ffffff",
    secondary: "#e3f2fd",
    secondaryForeground: "#0d47a1",
    muted: "#e8eef5",
    mutedForeground: "#607090",
    accent: "#42a5f5",
    accentForeground: "#ffffff",
    destructive: "#e53935",
    destructiveForeground: "#ffffff",
    border: "#dde6f0",
    input: "#dde6f0",
    text: "#1a2030",
    tint: "#1565c0",
    myBubble: "#1565c0",
    theirBubble: "#ffffff",
    myBubbleText: "#ffffff",
    theirBubbleText: "#1a2030",
    headerBg: "#0d47a1",
    statusBarStyle: "light",
  },

  mintPearl: {
    background: "#f7fffb",
    foreground: "#1a2a27",
    card: "#ffffff",
    cardForeground: "#1a2a27",
    primary: "#3ecf8e",
    primaryForeground: "#ffffff",
    secondary: "#d7f7e8",
    secondaryForeground: "#2c6f5b",
    muted: "#edf5f0",
    mutedForeground: "#7a8b82",
    accent: "#75d9a2",
    accentForeground: "#0b3f30",
    destructive: "#e74c3c",
    destructiveForeground: "#ffffff",
    border: "#d6eddf",
    input: "#eef8f1",
    text: "#1a2a27",
    tint: "#3ecf8e",
    myBubble: "#3ecf8e",
    theirBubble: "#ffffff",
    myBubbleText: "#ffffff",
    theirBubbleText: "#1a2a27",
    headerBg: "#2d8f6d",
    statusBarStyle: "dark",
  },

  lavenderMist: {
    background: "#f9f6ff",
    foreground: "#2c2a3a",
    card: "#ffffff",
    cardForeground: "#2c2a3a",
    primary: "#9f7bff",
    primaryForeground: "#ffffff",
    secondary: "#f3e8ff",
    secondaryForeground: "#5b4090",
    muted: "#f1edf9",
    mutedForeground: "#8d86a6",
    accent: "#9a7cff",
    accentForeground: "#2c2a3a",
    destructive: "#ef5350",
    destructiveForeground: "#ffffff",
    border: "#e6e0f5",
    input: "#f3effc",
    text: "#2c2a3a",
    tint: "#9f7bff",
    myBubble: "#9f7bff",
    theirBubble: "#ffffff",
    myBubbleText: "#ffffff",
    theirBubbleText: "#2c2a3a",
    headerBg: "#7a58f0",
    statusBarStyle: "dark",
  },

  peachFrost: {
    background: "#fff8f5",
    foreground: "#3d2d25",
    card: "#ffffff",
    cardForeground: "#3d2d25",
    primary: "#ff8a65",
    primaryForeground: "#ffffff",
    secondary: "#ffe9df",
    secondaryForeground: "#8f4b37",
    muted: "#f8eee9",
    mutedForeground: "#b08d84",
    accent: "#ffab91",
    accentForeground: "#3d2d25",
    destructive: "#d84315",
    destructiveForeground: "#ffffff",
    border: "#f5ded7",
    input: "#fff0eb",
    text: "#3d2d25",
    tint: "#ff8a65",
    myBubble: "#ff8a65",
    theirBubble: "#ffffff",
    myBubbleText: "#ffffff",
    theirBubbleText: "#3d2d25",
    headerBg: "#ff7043",
    statusBarStyle: "dark",
  },
};

export const THEME_META: ThemeMeta[] = [
  {
    name: "cyberNight",
    label: "Cyber Noć",
    emoji: "💚",
    preview: ["#09090d", "#00e676", "#9c27b0"],
  },
  {
    name: "midnightPurple",
    label: "Ponoćna ljubičasta",
    emoji: "💜",
    preview: ["#0d0014", "#9c27b0", "#e040fb"],
  },
  {
    name: "oceanNight",
    label: "Okean",
    emoji: "🌊",
    preview: ["#050f1a", "#00bcd4", "#0288d1"],
  },
  {
    name: "forestDark",
    label: "Mračna šuma",
    emoji: "🌲",
    preview: ["#060f08", "#4caf50", "#81c784"],
  },
  {
    name: "sunsetRose",
    label: "Zalazak ruže",
    emoji: "🌹",
    preview: ["#1a060a", "#f48fb1", "#f06292"],
  },
  {
    name: "arcticBlue",
    label: "Arktička plava",
    emoji: "❄️",
    preview: ["#f0f4f8", "#1565c0", "#42a5f5"],
  },
  {
    name: "mintPearl",
    label: "Mint & bijela",
    emoji: "🌿",
    preview: ["#f7fffb", "#3ecf8e", "#d7f7e8"],
  },
  {
    name: "lavenderMist",
    label: "Lavanda magla",
    emoji: "🌸",
    preview: ["#f9f6ff", "#9f7bff", "#f3e8ff"],
  },
  {
    name: "peachFrost",
    label: "Breskva & led",
    emoji: "🍑",
    preview: ["#fff8f5", "#ff8a65", "#ffe9df"],
  },
];

export const radius = 14;

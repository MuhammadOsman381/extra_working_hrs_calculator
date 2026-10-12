export const paletteStorageKey = "extra-hours-palette";

export const palettes = [
  {
    id: "electric-violet",
    name: "Electric Violet",
    vibe: "Premium AI / SaaS",
    colors: ["#7C3AED", "#C026D3", "#22D3EE"],
  },
  {
    id: "cyberpunk-blue",
    name: "Cyberpunk Blue",
    vibe: "Technical, futuristic",
    colors: ["#2563EB", "#06B6D4", "#8B5CF6"],
  },
  {
    id: "neon-emerald",
    name: "Neon Emerald",
    vibe: "Fintech, analytics",
    colors: ["#10B981", "#06D6A0", "#06B6D4"],
  },
  {
    id: "aurora-premium",
    name: "Aurora Premium",
    vibe: "Premium AI startup",
    colors: ["#6366F1", "#A855F7", "#EC4899", "#06B6D4"],
  },
  {
    id: "neon-sunset",
    name: "Neon Sunset",
    vibe: "Creative, bold",
    colors: ["#F97316", "#F43F5E", "#A855F7"],
  },
  {
    id: "deep-space",
    name: "Deep Space",
    vibe: "Cosmic, sleek",
    colors: ["#1D4ED8", "#6366F1", "#D946EF"],
  },
] as const;

export type PaletteId = (typeof palettes)[number]["id"];

export const paletteIds = palettes.map((palette) => palette.id) as [PaletteId, ...PaletteId[]];

export const themeModes = ["dark", "light", "system"] as const;
export type ThemeMode = (typeof themeModes)[number];

export const defaultPalette: PaletteId = "electric-violet";

export function isPaletteId(value: string | null): value is PaletteId {
  return palettes.some((palette) => palette.id === value);
}

export function isThemeMode(value: string | null): value is ThemeMode {
  return themeModes.includes(value as ThemeMode);
}

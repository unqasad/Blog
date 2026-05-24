import imgHero from "@/assets/hero.jpg";

const MAP: Record<string, string> = {
  "/src/assets/hero.jpg": imgHero,
};

export const resolveImage = (raw?: string | null): string | undefined => {
  if (!raw) return undefined;
  return MAP[raw] ?? raw;
};

import imgChooseOffer from "@/assets/post-choose-offer.jpg";
import imgClicks from "@/assets/post-clicks-no-conversions.jpg";
import imgCpa from "@/assets/post-cpa-mistakes.jpg";
import imgTracking from "@/assets/post-tracking.jpg";
import imgTrust from "@/assets/post-trustworthy-blog.jpg";
import imgTools from "@/assets/post-tools-stack.jpg";
import imgHero from "@/assets/hero.jpg";

const MAP: Record<string, string> = {
  "/src/assets/post-choose-offer.jpg": imgChooseOffer,
  "/src/assets/post-clicks-no-conversions.jpg": imgClicks,
  "/src/assets/post-cpa-mistakes.jpg": imgCpa,
  "/src/assets/post-tracking.jpg": imgTracking,
  "/src/assets/post-trustworthy-blog.jpg": imgTrust,
  "/src/assets/post-tools-stack.jpg": imgTools,
  "/src/assets/hero.jpg": imgHero,
};

export const resolveImage = (raw?: string | null): string | undefined => {
  if (!raw) return undefined;
  return MAP[raw] ?? raw;
};

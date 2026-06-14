// Default featured image used when a post has no featured_image set.
// Using the existing hero asset avoids a network round-trip and keeps the
// publication looking consistent across older posts.
import heroFallback from "@/assets/hero.jpg";

export const FALLBACK_FEATURED_IMAGE = heroFallback;

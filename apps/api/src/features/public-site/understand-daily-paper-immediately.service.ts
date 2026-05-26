import type { LandingHeroContent, LandingLayoutAssessment } from "./understand-daily-paper-immediately.types";

export class PublicSiteLandingService {
  buildHeroContent(): LandingHeroContent {
    return {
      brand: "Daily Paper",
      headline: "Your trusted daily news brief, ready in minutes.",
      valueProposition:
        "Daily Paper turns noisy headlines into a concise, neutral morning digest with direct source links so you can understand what matters fast.",
      primaryCta: {
        label: "Get Your Daily Paper",
        route: "/signup"
      }
    };
  }

  assessHeroLayout(viewportWidth: number): LandingLayoutAssessment {
    const readableOnMobile = viewportWidth >= 320;
    const readableOnDesktop = viewportWidth >= 1024;

    return {
      readableOnMobile,
      readableOnDesktop,
      primaryCtaAboveFold: true
    };
  }
}

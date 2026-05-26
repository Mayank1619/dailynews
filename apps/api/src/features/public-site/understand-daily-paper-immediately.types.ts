export type HeroCta = {
  label: string;
  route: string;
};

export type LandingHeroContent = {
  brand: string;
  headline: string;
  valueProposition: string;
  primaryCta: HeroCta;
};

export type LandingLayoutAssessment = {
  readableOnMobile: boolean;
  readableOnDesktop: boolean;
  primaryCtaAboveFold: boolean;
};

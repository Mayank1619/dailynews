export type PublicLandingSeo = {
  title: string;
  description: string;
  openGraph: {
    title: string;
    description: string;
    url: string;
    image: string;
  };
};

export function buildPublicLandingSeo(baseUrl = "https://dailypaper.news"): PublicLandingSeo {
  const title = "Daily Paper | Your concise daily news digest";
  const description = "Understand the day in minutes with a clear, neutral, source-linked daily paper.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/`,
      image: `${baseUrl}/social-preview.png`
    }
  };
}

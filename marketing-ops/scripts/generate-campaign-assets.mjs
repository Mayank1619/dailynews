import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const opsRoot = resolve(scriptDir, "..");
const generatedRoot = resolve(opsRoot, "generated-videos");
const campaignRoot = resolve(opsRoot, "campaign-assets");
const requestedApps = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const selectedApps = requestedApps.length ? requestedApps : ["daily-paper", "astroya"];

await mkdir(campaignRoot, { recursive: true });

const runDate = new Date().toISOString().slice(0, 10);
const runSummary = {
  runDate,
  generatedAt: new Date().toISOString(),
  apps: []
};

for (const appId of selectedApps) {
  const profile = await readProfile(appId);
  const metadata = await readLatestVideoMetadata(appId);
  const assets = buildCampaignAssets(profile, metadata);
  const outputPath = resolve(campaignRoot, `${appId}-${runDate}-campaign.json`);
  const markdownPath = resolve(campaignRoot, `${appId}-${runDate}-campaign.md`);

  await writeFile(outputPath, `${JSON.stringify(assets, null, 2)}\n`, "utf8");
  await writeFile(markdownPath, renderMarkdown(assets), "utf8");
  runSummary.apps.push({
    appId,
    outputPath,
    markdownPath,
    title: assets.video.title,
    platforms: assets.platforms
  });

  console.log(`Generated campaign assets for ${appId}: ${markdownPath}`);
}

await writeFile(resolve(campaignRoot, `${runDate}-campaign-run.json`), `${JSON.stringify(runSummary, null, 2)}\n`, "utf8");

async function readProfile(appId) {
  return JSON.parse(await readFile(resolve(opsRoot, "apps", appId, "profile.json"), "utf8"));
}

async function readLatestVideoMetadata(appId) {
  const entries = await readdir(generatedRoot);
  const latest = entries
    .filter((name) => name.startsWith(`${appId}-`) && name.endsWith(".json"))
    .sort()
    .reverse()[0];

  if (!latest) {
    throw new Error(`No video metadata found for ${appId}. Run npm run marketing:render-videos -- ${appId} first.`);
  }

  return JSON.parse(await readFile(resolve(generatedRoot, latest), "utf8"));
}

function buildCampaignAssets(profile, video) {
  const isAstroya = profile.appId === "astroya";
  const facebookAccount = profile.socialAccounts?.facebook;
  const facebookDestination = facebookAccount?.publicUrl ?? video.targetUrl ?? profile.publicUrl;
  const tone = isAstroya
    ? "calm, reflective, self-discovery focused"
    : "clear, useful, modern, time-saving";
  const promise = isAstroya
    ? "a quieter way to reflect with astrology, palmistry, and AI-assisted guidance"
    : "a cleaner daily news habit without endless scrolling";

  return {
    appId: profile.appId,
    productName: profile.productName,
    generatedAt: new Date().toISOString(),
    brandTone: tone,
    targetUrl: video.targetUrl,
    platforms: profile.platforms,
    socialAccounts: profile.socialAccounts ?? {},
    video: {
      title: video.title,
      caption: `${video.caption}\n\n${video.hashtags.join(" ")}\n${video.targetUrl}`,
      mp4Path: video.output.mp4Path,
      coverPath: video.output.coverPath,
      captionPath: video.output.captionPath
    },
    organicPosts: {
      facebook: [
        {
          format: "reel",
          text: `${video.caption}\n\n${video.hashtags.join(" ")}\n${video.targetUrl}`,
          asset: basename(video.output.mp4Path),
          destination: facebookDestination,
          status: facebookAccount ? "ready" : "needs-facebook-page"
        },
        {
          format: "text-link",
          text: `${profile.productName} is built for ${promise}. Start here: ${video.targetUrl}`,
          destination: profile.publicUrl
        }
      ],
      youtubeShorts: [
        {
          title: video.title,
          description: `${video.caption}\n\n${video.hashtags.join(" ")}\n${video.targetUrl}`,
          asset: basename(video.output.mp4Path)
        }
      ],
      instagramReels: [
        {
          caption: `${video.caption}\n\n${video.hashtags.join(" ")}`,
          asset: basename(video.output.mp4Path)
        }
      ]
    },
    adDrafts: {
      facebook: [
        {
          objective: "Traffic",
          audience: isAstroya ? "Adults interested in astrology, palmistry, self-discovery, mindfulness, and spirituality." : "Students and young professionals interested in productivity, AI tools, news, business, and technology.",
          primaryText: `${profile.productName} gives you ${promise}.`,
          headline: isAstroya ? "Personal reflection, without horoscope noise" : "Your daily paper, without the scroll",
          description: isAstroya ? "Explore calm AI-assisted astrology and palmistry guidance." : "Choose topics and read one focused briefing.",
          destination: video.targetUrl,
          creative: basename(video.output.mp4Path),
          status: facebookAccount ? "draft-needs-budget" : "draft-needs-facebook-page-and-budget"
        },
        {
          objective: "Engagement",
          audience: isAstroya ? "People who follow astrology, wellness, journaling, and reflective self-growth pages." : "People who follow AI newsletters, business news, technology, productivity, and startup pages.",
          primaryText: video.caption,
          headline: video.title,
          description: "Watch the short and visit the site to try it.",
          destination: video.targetUrl,
          creative: basename(video.output.mp4Path),
          status: facebookAccount ? "draft-needs-budget" : "draft-needs-facebook-page-and-budget"
        }
      ]
    },
    seoSnippets: [
      {
        type: "meta-title",
        text: isAstroya ? "Astroya SoulPath | Calm Astrology and Palmistry Guidance" : "Daily Paper | Personalized AI News Briefing"
      },
      {
        type: "meta-description",
        text: isAstroya
          ? "Explore calm astrology, palmistry, and AI-assisted reflection with Astroya SoulPath."
          : "Choose your topics and get a cleaner personalized AI daily paper without endless scrolling."
      }
    ],
    postingChecklist: [
      "Confirm the correct brand page/channel is selected.",
      "Upload the MP4 as a short/reel.",
      "Use the platform-specific caption/title.",
      "Add the target URL in description, page post, or profile link where supported.",
      "Do not start paid ads until a budget and target geography are chosen."
    ]
  };
}

function renderMarkdown(assets) {
  return `# ${assets.productName} Campaign - ${runDate}

## Video

- Title: ${assets.video.title}
- MP4: ${assets.video.mp4Path}
- Cover: ${assets.video.coverPath}
- Target URL: ${assets.targetUrl}

## Facebook Organic

### Reel

${assets.organicPosts.facebook[0].text}

Destination: ${assets.organicPosts.facebook[0].destination}

### Text Link

${assets.organicPosts.facebook[1].text}

## YouTube Shorts

Title: ${assets.organicPosts.youtubeShorts[0].title}

${assets.organicPosts.youtubeShorts[0].description}

## Instagram Reels

${assets.organicPosts.instagramReels[0].caption}

## Facebook Ad Drafts

${assets.adDrafts.facebook.map((ad, index) => `### Draft ${index + 1}: ${ad.objective}

- Audience: ${ad.audience}
- Primary text: ${ad.primaryText}
- Headline: ${ad.headline}
- Description: ${ad.description}
- Destination: ${ad.destination}
- Creative: ${ad.creative}
- Status: ${ad.status}
`).join("\n")}

## Checklist

${assets.postingChecklist.map((item) => `- ${item}`).join("\n")}
`;
}

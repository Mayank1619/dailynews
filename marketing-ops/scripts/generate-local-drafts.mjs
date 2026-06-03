import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const endpoint = process.env.MARKETING_CAMPAIGN_ENDPOINT ?? "https://dailynews-theta-ten.vercel.app/api/marketing/make-campaign";
const token = process.env.NEWSLETTER_ADMIN_TOKEN;
const apps = process.argv.slice(2);
const selectedApps = apps.length ? apps : ["daily-paper", "astroya"];

await mkdir(resolve(root, "draft-queue"), { recursive: true });

for (const appId of selectedApps) {
  const payloadPath = resolve(root, "apps", appId, "make-payload.json");
  const payload = JSON.parse(await readFile(payloadPath, "utf8"));
  const result = token ? await generateFromProduction(payload, appId) : await generateFromLocalRuntime(payload);
  const date = result.date ?? new Date().toISOString().slice(0, 10);
  const outPath = resolve(root, "draft-queue", `${appId}-${date}.json`);
  await writeFile(outPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  console.log(`Created ${outPath}`);
}

async function generateFromProduction(payload, appId) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`${appId} campaign generation failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function generateFromLocalRuntime(payload) {
  const date = new Date().toISOString().slice(0, 10);
  const isAstroya = payload.appId === "astroya";
  const hashtags = isAstroya
    ? ["#Astroya", "#Astrology", "#Palmistry", "#SelfDiscovery"]
    : ["#DailyPaper", "#AINewsletter", "#NewsBriefing", "#Productivity"];
  const hook = isAstroya
    ? "Generic horoscope posts are noisy. Astroya SoulPath gives people a calmer reflection flow."
    : "News should not take over the morning. Daily Paper turns chosen topics into one clean briefing.";
  const caption = isAstroya
    ? `Explore astrology, palmistry, and reflective AI guidance with ${payload.productName}. ${payload.baseUrl}${payload.ctaRoute}`
    : `Choose your topics and get one clean Daily Paper. ${payload.baseUrl}${payload.ctaRoute}`;

  return {
    date,
    app: {
      appId: payload.appId,
      productName: payload.productName,
      baseUrl: payload.baseUrl,
      positioning: payload.positioning
    },
    strategy: payload.strategy,
    generation: {
      mode: "local-deterministic-draft",
      note: "Created locally without calling the protected production endpoint."
    },
    makeScenario: {
      name: `${payload.productName} daily organic marketing factory`,
      trigger: "Make Scheduler, once per day",
      cadence: "Daily draft generation with human approval before posting",
      monthlyOperationEstimate: 240,
      minimumPlanFit: "free-tier-friendly"
    },
    publishingQueue: {
      blogDraft: {
        title: isAstroya ? "A Calmer Way to Explore Astrology and Palmistry" : "A Cleaner Way to Read the News Each Morning",
        slug: `${payload.appId}-${date}`,
        targetUrl: `${payload.baseUrl}${payload.sampleRoute}`,
        status: "draft",
        destination: `${payload.productName} local draft queue`
      },
      socialPosts: payload.platforms.map((platform) => ({
        platform,
        format: "short-video-caption",
        copy: caption,
        hashtags,
        targetUrl: `${payload.baseUrl}${payload.ctaRoute}`,
        status: "draft"
      })),
      videoBriefs: payload.platforms.map((platform) => ({
        platform,
        durationSeconds: 15,
        title: `${payload.productName}: ${isAstroya ? "reflection without the noise" : "news without the scroll"}`,
        hook,
        productionMode: "script-only",
        estimatedExternalVideoCostUsd: 0
      }))
    },
    costGuardrails: [
      "Keep the first week in draft/review mode.",
      "Use one reusable script-only video brief per app per day.",
      "Do not enable paid video rendering until manual drafts prove useful.",
      "Do not publish publicly without owner approval."
    ]
  };
}

import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const opsRoot = resolve(scriptDir, "..");
const generatedRoot = resolve(opsRoot, "generated-videos");
const publishQueueRoot = resolve(opsRoot, "publish-queue");
const requestedApps = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const selectedApps = requestedApps.length ? requestedApps : ["daily-paper", "astroya"];
const publishMode = process.env.SOCIAL_PUBLISH_MODE ?? detectPublishMode();
const autoPostEnabled = process.env.SOCIAL_AUTO_POST === "true";

await mkdir(publishQueueRoot, { recursive: true });

const run = {
  runId: `social-${new Date().toISOString().replace(/[:.]/g, "-")}`,
  createdAt: new Date().toISOString(),
  mode: publishMode,
  autoPostEnabled,
  posts: []
};

for (const appId of selectedApps) {
  const metadataPath = await findLatestMetadata(appId);
  const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
  const video = await readAsset(metadata.output.mp4Path, "video/mp4");
  const cover = await readAsset(metadata.output.coverPath, "image/png");
  const captionText = await readFile(metadata.output.captionPath, "utf8");
  const profile = await readProfile(appId);
  const platforms = profile.platforms?.length ? profile.platforms : ["youtube-shorts", "instagram-reels", "facebook-reels"];

  const post = {
    appId,
    productName: metadata.productName,
    sourceMetadataFile: metadataPath,
    platforms,
    title: metadata.title,
    description: `${metadata.caption}\n\n${metadata.hashtags.join(" ")}\n${metadata.targetUrl}`,
    caption: captionText.trim(),
    hashtags: metadata.hashtags,
    targetUrl: metadata.targetUrl,
    suggestedHandles: profile.preferredHandles ?? {},
    socialAccounts: profile.socialAccounts ?? {},
    files: {
      video,
      cover,
      caption: {
        fileName: basename(metadata.output.captionPath),
        mimeType: "text/plain",
        text: captionText
      }
    }
  };

  const queuePath = resolve(publishQueueRoot, `${appId}-${new Date().toISOString().slice(0, 10)}-social-publish.json`);
  await writeFile(queuePath, `${JSON.stringify(post, null, 2)}\n`, "utf8");
  run.posts.push({ appId, queuePath, title: post.title, platforms });

  if (publishMode !== "dry-run" && autoPostEnabled) {
    await sendToAutomation(post);
    console.log(`Sent ${appId} social video to ${publishMode}`);
  } else {
    console.log(`Prepared ${appId} social publish bundle at ${queuePath}`);
  }
}

const runPath = resolve(publishQueueRoot, `${run.runId}.json`);
await writeFile(runPath, `${JSON.stringify(run, null, 2)}\n`, "utf8");
console.log(`Social publishing run saved at ${runPath}`);

async function findLatestMetadata(appId) {
  const entries = await readdir(generatedRoot);
  const matches = entries
    .filter((name) => name.startsWith(`${appId}-`) && name.endsWith(".json"))
    .sort()
    .reverse();

  if (!matches.length) {
    throw new Error(`No rendered video metadata found for ${appId}. Run npm run marketing:render-videos -- ${appId} first.`);
  }

  return resolve(generatedRoot, matches[0]);
}

async function readProfile(appId) {
  const profilePath = resolve(opsRoot, "apps", appId, "profile.json");
  return JSON.parse(await readFile(profilePath, "utf8"));
}

async function readAsset(filePath, mimeType) {
  const bytes = await readFile(filePath);
  const info = await stat(filePath);

  return {
    fileName: basename(filePath),
    mimeType,
    sizeBytes: info.size,
    base64: bytes.toString("base64")
  };
}

function detectPublishMode() {
  if (process.env.N8N_SOCIAL_WEBHOOK_URL) {
    return "n8n-webhook";
  }

  if (process.env.MAKE_SOCIAL_WEBHOOK_URL) {
    return "make-webhook";
  }

  return "dry-run";
}

async function sendToAutomation(post) {
  if (publishMode === "n8n-webhook") {
    await sendToN8n(post);
    return;
  }

  if (publishMode === "make-webhook") {
    await sendToMake(post);
    return;
  }

  throw new Error(`Unsupported SOCIAL_PUBLISH_MODE: ${publishMode}`);
}

async function sendToMake(post) {
  const webhookUrl = process.env.MAKE_SOCIAL_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error("MAKE_SOCIAL_WEBHOOK_URL is required when SOCIAL_PUBLISH_MODE=make-webhook and SOCIAL_AUTO_POST=true.");
  }

  const headers = { "Content-Type": "application/json" };
  if (process.env.MAKE_SOCIAL_WEBHOOK_TOKEN) {
    headers["x-make-apikey"] = process.env.MAKE_SOCIAL_WEBHOOK_TOKEN;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(post)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Make webhook failed with ${response.status}: ${body}`);
  }
}

async function sendToN8n(post) {
  const webhookUrl = process.env.N8N_SOCIAL_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error("N8N_SOCIAL_WEBHOOK_URL is required when SOCIAL_PUBLISH_MODE=n8n-webhook and SOCIAL_AUTO_POST=true.");
  }

  const headers = { "Content-Type": "application/json" };
  if (process.env.N8N_SOCIAL_WEBHOOK_TOKEN) {
    headers[process.env.N8N_SOCIAL_WEBHOOK_HEADER ?? "X-DailyNews-Token"] = process.env.N8N_SOCIAL_WEBHOOK_TOKEN;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(post)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`n8n webhook failed with ${response.status}: ${body}`);
  }
}

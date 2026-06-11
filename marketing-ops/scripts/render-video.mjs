import ffmpeg from "@ffmpeg-installer/ffmpeg";
import { chromium } from "@playwright/test";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const opsRoot = resolve(scriptDir, "..");
const outputRoot = resolve(opsRoot, "generated-videos");
const tempRoot = resolve(outputRoot, ".frames");
const requestedApps = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const selectedApps = requestedApps.length ? requestedApps : ["daily-paper", "astroya"];
const renderSize = { width: 1080, height: 1920 };
const fps = 30;

const appThemes = {
  "daily-paper": {
    appId: "daily-paper",
    productName: "Daily Paper",
    shortName: "Daily Paper",
    baseUrl: "https://dailynews-theta-ten.vercel.app",
    ctaRoute: "/signup",
    bgA: "#070912",
    bgB: "#0b1020",
    accent: "#22d3ee",
    accent2: "#f472b6",
    accent3: "#a78bfa",
    tagline: "Your news, chosen by you.",
    safetyLine: "Source-aware AI briefing"
  },
  astroya: {
    appId: "astroya",
    productName: "Astroya SoulPath",
    shortName: "Astroya",
    baseUrl: "https://www.astroya.ca",
    ctaRoute: "/signup",
    bgA: "#070814",
    bgB: "#171024",
    accent: "#a78bfa",
    accent2: "#22d3ee",
    accent3: "#f472b6",
    tagline: "A calmer reflection ritual.",
    safetyLine: "Astrology and palmistry for self-discovery"
  }
};

await mkdir(outputRoot, { recursive: true });
await rm(tempRoot, { recursive: true, force: true });
await mkdir(tempRoot, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  for (const appId of selectedApps) {
    const theme = appThemes[appId];
    if (!theme) {
      throw new Error(`Unknown marketing app: ${appId}`);
    }

    const campaign = await loadCampaign(theme);
    const videoPlan = buildVideoPlan(theme, campaign);
    const appFrameDir = resolve(tempRoot, appId);
    await mkdir(appFrameDir, { recursive: true });

    const page = await browser.newPage({ viewport: renderSize });
    const frameFiles = [];
    for (const [index, slide] of videoPlan.slides.entries()) {
      const framePath = resolve(appFrameDir, `frame-${String(index).padStart(2, "0")}.png`);
      await page.setContent(renderSlideHtml(theme, slide, index, videoPlan.slides.length), { waitUntil: "networkidle" });
      await page.screenshot({ path: framePath, type: "png" });
      frameFiles.push({ path: framePath, duration: slide.durationSeconds });
    }
    await page.close();

    const date = campaign.date ?? new Date().toISOString().slice(0, 10);
    const outputBase = `${theme.appId}-${date}-${videoPlan.durationSeconds}s`;
    const mp4Path = resolve(outputRoot, `${outputBase}.mp4`);
    const coverPath = resolve(outputRoot, `${outputBase}-cover.png`);
    const captionPath = resolve(outputRoot, `${outputBase}-caption.txt`);
    const metadataPath = resolve(outputRoot, `${outputBase}.json`);
    const concatPath = resolve(appFrameDir, "concat.txt");

    await writeFile(concatPath, renderConcatFile(frameFiles), "utf8");
    await runFfmpeg([
      "-y",
      "-f", "concat",
      "-safe", "0",
      "-i", concatPath,
      "-vf", `fps=${fps},scale=${renderSize.width}:${renderSize.height}:force_original_aspect_ratio=decrease,pad=${renderSize.width}:${renderSize.height}:(ow-iw)/2:(oh-ih)/2,format=yuv420p`,
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", "22",
      "-movflags", "+faststart",
      mp4Path
    ]);

    await copyFile(frameFiles[0].path, coverPath);
    await writeFile(captionPath, `${videoPlan.caption}\n\n${videoPlan.hashtags.join(" ")}\n${videoPlan.targetUrl}\n`, "utf8");
    await writeFile(metadataPath, `${JSON.stringify({ ...videoPlan, output: { mp4Path, coverPath, captionPath } }, null, 2)}\n`, "utf8");

    console.log(`Rendered ${mp4Path}`);
  }
} finally {
  await browser.close();
}

async function loadCampaign(theme) {
  const today = new Date().toISOString().slice(0, 10);
  const draftPath = resolve(opsRoot, "draft-queue", `${theme.appId}-${today}.json`);

  try {
    return JSON.parse(await readFile(draftPath, "utf8"));
  } catch {
    return buildFallbackCampaign(theme, today);
  }
}

function buildFallbackCampaign(theme, date) {
  const isAstroya = theme.appId === "astroya";
  const hook = isAstroya
    ? "Generic horoscope posts are noisy. Build a calmer reflection ritual."
    : "News should not take over your morning.";
  const title = isAstroya
    ? "Astroya: reflection without the noise"
    : "Daily Paper: news without the scroll";
  const caption = isAstroya
    ? "Explore astrology, palmistry, and reflective AI guidance with Astroya SoulPath."
    : "Choose your topics and get one clean Daily Paper.";
  const hashtags = isAstroya
    ? ["#Astroya", "#Astrology", "#Palmistry", "#SelfDiscovery"]
    : ["#DailyPaper", "#AINewsletter", "#NewsBriefing", "#Productivity"];

  return {
    date,
    app: {
      appId: theme.appId,
      productName: theme.productName,
      baseUrl: theme.baseUrl
    },
    publishingQueue: {
      socialPosts: [
        {
          platform: "instagram-reels",
          copy: caption,
          hashtags,
          targetUrl: `${theme.baseUrl}${theme.ctaRoute}`
        }
      ],
      videoBriefs: [
        {
          platform: "instagram-reels",
          durationSeconds: 15,
          title,
          hook
        }
      ]
    }
  };
}

function buildVideoPlan(theme, campaign) {
  const socialPost = campaign.publishingQueue?.socialPosts?.find((post) => post.platform !== "blog") ?? campaign.publishingQueue?.socialPosts?.[0];
  const videoBrief = campaign.publishingQueue?.videoBriefs?.find((brief) => Number(brief.durationSeconds) === 15) ?? campaign.publishingQueue?.videoBriefs?.[0];
  const title = videoBrief?.title ?? `${theme.productName}: ${theme.tagline}`;
  const hook = videoBrief?.hook ?? theme.tagline;
  const caption = socialPost?.copy ?? `${theme.productName} helps people start with a cleaner daily habit.`;
  const hashtags = socialPost?.hashtags?.length ? socialPost.hashtags : defaultHashtags(theme);
  const targetUrl = socialPost?.targetUrl ?? `${theme.baseUrl}${theme.ctaRoute}`;
  const durationSeconds = Math.max(10, Math.min(Number(videoBrief?.durationSeconds ?? 15), 30));
  const slides = [
    {
      eyebrow: theme.shortName,
      headline: title,
      body: hook,
      footer: theme.safetyLine,
      durationSeconds: 3
    },
    {
      eyebrow: "The problem",
      headline: theme.appId === "astroya" ? "Too much generic guidance" : "Too many feeds, not enough signal",
      body: theme.appId === "astroya" ? "Create a quieter moment for reflection." : "Start with one focused paper instead.",
      footer: theme.tagline,
      durationSeconds: 3
    },
    {
      eyebrow: "How it works",
      headline: theme.appId === "astroya" ? "Astrology, palmistry, reflection" : "Pick topics. Get one paper.",
      body: theme.appId === "astroya" ? "A calm AI-assisted path for self-discovery." : "AI, markets, sports, culture, and more.",
      footer: "Built for quick daily attention",
      durationSeconds: 3
    },
    {
      eyebrow: "Try it",
      headline: theme.appId === "astroya" ? "Begin your SoulPath" : "Create your Daily Paper",
      body: targetUrl.replace(/^https?:\/\//, ""),
      footer: hashtags.slice(0, 3).join(" "),
      durationSeconds: Math.max(3, durationSeconds - 9)
    }
  ];

  return {
    appId: theme.appId,
    productName: theme.productName,
    durationSeconds,
    title,
    hook,
    caption,
    hashtags,
    targetUrl,
    slides
  };
}

function renderSlideHtml(theme, slide, index, total) {
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          width: ${renderSize.width}px;
          height: ${renderSize.height}px;
          overflow: hidden;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #f8fafc;
          background:
            radial-gradient(circle at 16% 10%, ${hexToRgba(theme.accent, 0.36)}, transparent 30%),
            radial-gradient(circle at 86% 4%, ${hexToRgba(theme.accent2, 0.28)}, transparent 30%),
            linear-gradient(180deg, ${theme.bgA} 0%, ${theme.bgB} 100%);
        }
        .frame {
          position: relative;
          width: 100%;
          height: 100%;
          padding: 92px 76px 82px;
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: 44px;
        }
        .brand {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 34px;
          font-weight: 900;
          letter-spacing: 0;
        }
        .badge {
          border: 2px solid ${hexToRgba(theme.accent, 0.7)};
          color: ${theme.accent};
          border-radius: 999px;
          padding: 14px 24px;
          background: rgba(7, 9, 18, 0.46);
        }
        .counter {
          color: rgba(248, 250, 252, 0.68);
          font-size: 28px;
        }
        .content {
          align-self: center;
          display: grid;
          gap: 34px;
        }
        .eyebrow {
          width: fit-content;
          max-width: 100%;
          padding: 14px 24px;
          border-radius: 999px;
          background: ${hexToRgba(theme.accent2, 0.18)};
          color: ${theme.accent2};
          font-size: 30px;
          font-weight: 900;
        }
        h1 {
          margin: 0;
          font-size: ${slide.headline.length > 42 ? 86 : 98}px;
          line-height: 0.98;
          letter-spacing: 0;
          text-wrap: balance;
        }
        p {
          margin: 0;
          max-width: 860px;
          color: rgba(226, 232, 240, 0.88);
          font-size: 44px;
          line-height: 1.16;
          font-weight: 750;
        }
        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
          border-top: 2px solid rgba(148, 163, 184, 0.22);
          padding-top: 34px;
          color: rgba(248, 250, 252, 0.76);
          font-size: 29px;
          font-weight: 800;
        }
        .pulse {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: ${theme.accent};
          box-shadow: 0 0 34px ${theme.accent};
          flex: 0 0 auto;
        }
      </style>
    </head>
    <body>
      <section class="frame">
        <header class="brand">
          <span class="badge">${escapeHtml(theme.shortName)}</span>
          <span class="counter">${index + 1}/${total}</span>
        </header>
        <main class="content">
          <span class="eyebrow">${escapeHtml(slide.eyebrow)}</span>
          <h1>${escapeHtml(slide.headline)}</h1>
          <p>${escapeHtml(slide.body)}</p>
        </main>
        <footer class="footer">
          <span>${escapeHtml(slide.footer)}</span>
          <span class="pulse"></span>
        </footer>
      </section>
    </body>
  </html>`;
}

function renderConcatFile(frameFiles) {
  const lines = [];
  for (const frame of frameFiles) {
    lines.push(`file '${frame.path.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`);
    lines.push(`duration ${frame.duration}`);
  }
  lines.push(`file '${frameFiles.at(-1).path.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`);
  return `${lines.join("\n")}\n`;
}

function runFfmpeg(args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(ffmpeg.path, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      reject(new Error(`ffmpeg failed with code ${code}: ${stderr}`));
    });
  });
}

async function copyFile(from, to) {
  const bytes = await readFile(from);
  await writeFile(to, bytes);
}

function defaultHashtags(theme) {
  return theme.appId === "astroya"
    ? ["#Astroya", "#Astrology", "#SelfDiscovery"]
    : ["#DailyPaper", "#AINewsletter", "#NewsBriefing"];
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const bigint = Number.parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

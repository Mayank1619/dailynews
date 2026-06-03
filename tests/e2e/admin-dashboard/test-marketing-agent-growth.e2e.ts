import { expect, test } from "@playwright/test";

test("admin growth tab validates token before marketing generation", async ({ page }) => {
  await page.goto("/admin");
  await page.getByRole("button", { name: "Growth" }).click();

  await page.getByRole("button", { name: "Generate Blog and Video Kit" }).click();

  await expect(page.getByRole("alert")).toHaveText("Enter the admin token before generating marketing content.");
});

test("admin growth tab generates and renders a marketing content kit", async ({ page }) => {
  let authorization = "";
  let requestTopic = "";

  await page.route("**/api/marketing/daily-content", async (route) => {
    const request = route.request();
    authorization = request.headers().authorization ?? "";
    requestTopic = String((request.postDataJSON() as { topic?: string }).topic ?? "");

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        date: "2026-06-03",
        blogDraft: {
          title: "How Daily Paper Cuts Through News Overload",
          metaDescription: "A personalized daily briefing helps readers stay informed without endless scrolling.",
          excerpt: "Daily Paper turns selected topics into a source-linked morning briefing.",
          canonicalPath: "/blog/how-daily-paper-cuts-through-news-overload",
          ctaRoute: "/signup",
          sampleRoute: "/samples/ai-daily-paper"
        },
        videoScripts: [
          {
            durationSeconds: 10,
            title: "News without the scroll",
            hook: "Your morning news should take minutes, not hours.",
            caption: "Choose your topics. Get one clean paper.",
            hashtags: ["#DailyPaper", "#AINewsletter"]
          },
          {
            durationSeconds: 15,
            title: "Choose your paper",
            hook: "AI, markets, sports, and more in one briefing.",
            caption: "Start with a sample Daily Paper.",
            hashtags: ["#NewsBriefing"]
          },
          {
            durationSeconds: 30,
            title: "Your AI morning paper",
            hook: "Stop opening five apps before breakfast.",
            caption: "Try Daily Paper free for 15 days.",
            hashtags: ["#Productivity"]
          }
        ],
        publishingPlan: {
          recommendedPublishWindow: "Post the blog at 8:00 AM and the short video after 6:00 PM.",
          channels: ["Blog", "Instagram Reels", "YouTube Shorts"],
          reviewChecklist: [
            "Check source claims.",
            "Check title length.",
            "Verify signup and sample links."
          ]
        },
        generation: {
          mode: "ai",
          modelName: "gpt-4.1-mini"
        }
      })
    });
  });

  await page.goto("/admin");
  await page.getByRole("button", { name: "Growth" }).click();
  await page.getByLabel("Marketing admin token").fill("test-admin-token");
  await page.getByLabel("Marketing topic").fill("news habits for students");
  await page.getByRole("button", { name: "Generate Blog and Video Kit" }).click();

  await expect(page.getByTestId("marketing-kit-result")).toBeVisible();
  await expect(page.getByText("How Daily Paper Cuts Through News Overload")).toBeVisible();
  await expect(page.getByText("10s short")).toBeVisible();
  await expect(page.getByText("30s short")).toBeVisible();
  await expect(page.getByText("Post the blog at 8:00 AM and the short video after 6:00 PM.")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("test-admin-token");

  expect(authorization).toBe("Bearer test-admin-token");
  expect(requestTopic).toBe("news habits for students");
});

test("admin growth tab generates a Make.com campaign kit", async ({ page }) => {
  let authorization = "";
  let strategy = "";

  await page.route("**/api/marketing/make-campaign", async (route) => {
    const request = route.request();
    authorization = request.headers().authorization ?? "";
    strategy = String((request.postDataJSON() as { strategy?: string }).strategy ?? "");

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        date: "2026-06-03",
        app: {
          productName: "Daily Paper",
          baseUrl: "https://dailynews-theta-ten.vercel.app",
          positioning: "A personalized AI daily paper."
        },
        strategy: "minimal-cost",
        makeScenario: {
          name: "Daily Paper daily organic marketing factory",
          trigger: "Make Scheduler, once per day",
          cadence: "Daily draft generation with human approval before posting",
          monthlyOperationEstimate: 270,
          minimumPlanFit: "free-tier-friendly",
          steps: [
            {
              order: 1,
              module: "Scheduler",
              action: "Run once daily during the chosen marketing window.",
              estimatedOperationsPerRun: 1,
              notes: "Start with Daily Paper."
            },
            {
              order: 2,
              module: "HTTP",
              action: "POST to /api/marketing/make-campaign with the admin bearer token.",
              estimatedOperationsPerRun: 1,
              notes: "The app handles generation."
            }
          ],
          setupChecklist: ["Create a Make scenario."]
        },
        publishingQueue: {
          socialPosts: [
            {
              platform: "instagram-reels",
              format: "short-video-caption",
              copy: "Choose your topics. Get one clean paper.",
              targetUrl: "/signup",
              status: "draft"
            }
          ],
          videoBriefs: [
            {
              platform: "instagram-reels",
              durationSeconds: 15,
              title: "Choose your paper",
              productionMode: "script-only",
              estimatedExternalVideoCostUsd: 0
            }
          ]
        },
        costGuardrails: [
          "Use the Daily Paper endpoint for AI generation so Make only routes assets.",
          "Use script-only video briefs until a paid video generation budget is approved."
        ],
        requiredUserInputs: ["NEWSLETTER_ADMIN_TOKEN"]
      })
    });
  });

  await page.goto("/admin");
  await page.getByRole("button", { name: "Growth" }).click();
  await page.getByLabel("Marketing admin token").fill("test-admin-token");
  await page.getByRole("button", { name: "Generate Make.com Campaign Kit" }).click();

  await expect(page.getByTestId("make-campaign-result")).toBeVisible();
  await expect(page.getByText("Daily Paper daily organic marketing factory")).toBeVisible();
  await expect(page.getByText("Estimated monthly operations: 270")).toBeVisible();
  await expect(page.getByText("1 social drafts")).toBeVisible();
  await expect(page.getByText("External video cost: $0 in this starter flow")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("test-admin-token");

  expect(authorization).toBe("Bearer test-admin-token");
  expect(strategy).toBe("minimal-cost");
});

test("admin growth tab runs the low-cost draft automation batch", async ({ page }) => {
  let authorization = "";
  let provider = "";

  await page.route("**/api/marketing/automation-run", async (route) => {
    const request = route.request();
    authorization = request.headers().authorization ?? "";
    provider = String((request.postDataJSON() as { provider?: string }).provider ?? "");

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        runId: "marketing-2026-06-03-daily-paper-astroya",
        date: "2026-06-03",
        provider: "manual",
        mode: "draft-only",
        status: "drafts-ready",
        scheduler: {
          recommendedPrimary: "vercel-cron",
          fallback: "github-actions",
          cadence: "Once daily at 10:00 UTC for draft generation, then human review before anything goes public.",
          reason: "The app already runs on Vercel, so the cheapest scalable scheduler is a Vercel Cron GET request into this API."
        },
        monthlyCostEstimateUsd: {
          scheduler: 0,
          draftStorage: 0,
          videoRendering: 0,
          socialPublishing: 0,
          notes: ["Keep video generation script-only."]
        },
        apps: [
          {
            appId: "daily-paper",
            productName: "Daily Paper",
            draftCount: 8,
            blogSlug: "daily-news-habit-2026-06-03",
            targetUrl: "https://dailynews-theta-ten.vercel.app/blog/daily-news-habit-2026-06-03",
            campaign: {
              date: "2026-06-03",
              app: {
                productName: "Daily Paper",
                baseUrl: "https://dailynews-theta-ten.vercel.app",
                positioning: "A personalized AI daily paper."
              },
              strategy: "minimal-cost",
              contentKit: {
                date: "2026-06-03",
                blogDraft: {
                  title: "How a Daily News Habit Helps You Make Better Decisions",
                  metaDescription: "See how a short, personalized Daily Paper briefing can turn news overload into clearer everyday decisions.",
                  excerpt: "A short daily briefing can help readers stay informed without losing the morning to endless feeds.",
                  canonicalPath: "/blog/daily-news-habit-2026-06-03",
                  ctaRoute: "/signup",
                  sampleRoute: "/samples/ai-daily-paper"
                },
                videoScripts: [],
                publishingPlan: {
                  recommendedPublishWindow: "Post at 8 AM.",
                  reviewChecklist: [],
                  channels: []
                },
                generation: {
                  mode: "deterministic-fallback",
                  modelName: "gpt-4.1-mini"
                }
              },
              makeScenario: {
                name: "Daily Paper daily organic marketing factory",
                trigger: "Scheduler",
                cadence: "Daily draft generation",
                monthlyOperationEstimate: 270,
                minimumPlanFit: "free-tier-friendly",
                steps: [],
                setupChecklist: []
              },
              publishingQueue: {
                blogDraft: {
                  title: "How a Daily News Habit Helps You Make Better Decisions",
                  slug: "daily-news-habit-2026-06-03",
                  targetUrl: "https://dailynews-theta-ten.vercel.app/blog/daily-news-habit-2026-06-03",
                  status: "draft",
                  destination: "Daily Paper blog admin queue"
                },
                socialPosts: [
                  {
                    platform: "instagram-reels",
                    format: "short-video-caption",
                    copy: "Choose your topics. Get one clean paper.",
                    hashtags: ["#DailyPaper", "#AINews"],
                    targetUrl: "https://dailynews-theta-ten.vercel.app/signup",
                    status: "draft"
                  }
                ],
                videoBriefs: [
                  {
                    platform: "instagram-reels",
                    durationSeconds: 15,
                    title: "News without the scroll",
                    hook: "Your morning news should take minutes, not hours.",
                    productionMode: "script-only",
                    estimatedExternalVideoCostUsd: 0
                  }
                ]
              },
              costGuardrails: [],
              requiredUserInputs: []
            },
            reviewQueue: {
              destination: "Daily Paper admin Growth tab and local draft queue",
              approvalRequired: true,
              publishPolicy: "never-auto-publish",
              suggestedOwnerAction: "Review the blog, caption, hashtags, and script brief before copying into any social platform."
            }
          },
          {
            appId: "astroya",
            productName: "Astroya SoulPath",
            draftCount: 8,
            blogSlug: "astrology-reflection-2026-06-03",
            targetUrl: "https://www.astroya.ca/blog/astrology-reflection-2026-06-03",
            campaign: {
              date: "2026-06-03",
              app: {
                productName: "Astroya SoulPath",
                baseUrl: "https://www.astroya.ca",
                positioning: "A calm astrology and palmistry guidance experience."
              },
              strategy: "minimal-cost",
              contentKit: {
                date: "2026-06-03",
                blogDraft: {
                  title: "How Astroya SoulPath Turns Curiosity Into Reflection",
                  metaDescription: "See how Astroya creates a calm astrology and palmistry experience for self-discovery.",
                  excerpt: "Astroya gives curious visitors a calmer way to explore astrology and palmistry.",
                  canonicalPath: "/blog/astrology-reflection-2026-06-03",
                  ctaRoute: "/signup",
                  sampleRoute: "/how-it-works"
                },
                videoScripts: [],
                publishingPlan: {
                  recommendedPublishWindow: "Post at 8 AM.",
                  reviewChecklist: [],
                  channels: []
                },
                generation: {
                  mode: "deterministic-fallback",
                  modelName: "gpt-4.1-mini"
                }
              },
              makeScenario: {
                name: "Astroya SoulPath daily organic marketing factory",
                trigger: "Scheduler",
                cadence: "Daily draft generation",
                monthlyOperationEstimate: 270,
                minimumPlanFit: "free-tier-friendly",
                steps: [],
                setupChecklist: []
              },
              publishingQueue: {
                blogDraft: {
                  title: "How Astroya SoulPath Turns Curiosity Into Reflection",
                  slug: "astrology-reflection-2026-06-03",
                  targetUrl: "https://www.astroya.ca/blog/astrology-reflection-2026-06-03",
                  status: "draft",
                  destination: "Astroya blog admin queue"
                },
                socialPosts: [
                  {
                    platform: "instagram-reels",
                    format: "short-video-caption",
                    copy: "A calmer way to reflect with astrology and palmistry.",
                    hashtags: ["#Astroya", "#Astrology"],
                    targetUrl: "https://www.astroya.ca/signup",
                    status: "draft"
                  }
                ],
                videoBriefs: [
                  {
                    platform: "instagram-reels",
                    durationSeconds: 15,
                    title: "A calmer reflection ritual",
                    hook: "Your chart can be a prompt for reflection.",
                    productionMode: "script-only",
                    estimatedExternalVideoCostUsd: 0
                  }
                ]
              },
              costGuardrails: [],
              requiredUserInputs: []
            },
            reviewQueue: {
              destination: "Astroya SoulPath admin Growth tab and local draft queue",
              approvalRequired: true,
              publishPolicy: "never-auto-publish",
              suggestedOwnerAction: "Review the blog, caption, hashtags, and script brief before copying into any social platform."
            }
          }
        ],
        safeguards: [
          "The automation only creates drafts and script briefs.",
          "No public post, scheduled post, account creation, or OAuth permission is triggered by this endpoint."
        ],
        nextActions: ["Add CRON_SECRET to Vercel."]
      })
    });
  });

  await page.goto("/admin");
  await page.getByRole("button", { name: "Growth" }).click();
  await page.getByLabel("Marketing admin token").fill("test-admin-token");
  await page.getByRole("button", { name: "Run Low-Cost Automation Batch" }).click();

  const automationResult = page.getByTestId("marketing-automation-result");
  await expect(automationResult).toBeVisible();
  await expect(page.getByText("marketing-2026-06-03-daily-paper-astroya")).toBeVisible();
  await expect(automationResult.getByText("Daily Paper", { exact: true })).toBeVisible();
  await expect(automationResult.getByText("Astroya SoulPath", { exact: true }).first()).toBeVisible();
  await expect(automationResult.getByText("$0 Starter Cost Model")).toBeVisible();
  await expect(automationResult.getByText("never-auto-publish").first()).toBeVisible();
  await expect(page.getByTestId("automation-content-preview-daily-paper")).toContainText("How a Daily News Habit Helps You Make Better Decisions");
  await expect(page.getByTestId("automation-content-preview-daily-paper")).toContainText("Choose your topics. Get one clean paper.");
  await expect(page.getByTestId("automation-content-preview-astroya")).toContainText("How Astroya SoulPath Turns Curiosity Into Reflection");
  await expect(page.getByTestId("automation-content-preview-astroya")).toContainText("A calmer way to reflect with astrology and palmistry.");
  await expect(page.locator("body")).not.toContainText("test-admin-token");

  expect(authorization).toBe("Bearer test-admin-token");
  expect(provider).toBe("manual");
});

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

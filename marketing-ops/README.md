# Marketing Operations Workspace

This folder keeps the low-cost Make.com marketing framework for Daily Paper and Astroya SoulPath.

## Current Strategy

- Keep each app as a separate brand profile, social account set, and draft queue.
- Start with review-only drafts for YouTube, Instagram, and Facebook.
- Generate one reusable script-only video brief per app per day.
- Cross-post the same approved short concept across platforms before paying for video rendering.
- Store local drafts in `draft-queue/` during testing. That folder is ignored by git.

## Apps

- Daily Paper: `apps/daily-paper/profile.json`
- Astroya SoulPath: `apps/astroya/profile.json`

## Make.com First Scenario

Use `make/scenario-starter.md`.

The scenario should call:

```text
POST https://dailynews-theta-ten.vercel.app/api/marketing/make-campaign
Authorization: Bearer NEWSLETTER_ADMIN_TOKEN
Content-Type: application/json
```

Start with Daily Paper, then duplicate the scenario for Astroya after account connections are stable.

## External Accounts

Separate accounts should be created for each app:

- YouTube channel
- Instagram business or creator account
- Facebook page

Account creation and final publishing require user confirmation because they create or modify persistent external accounts.

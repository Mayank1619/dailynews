import React from "react";
import { onAuthStateChanged, signOut, updatePassword, updateProfile, type User } from "firebase/auth";
import { DESIGN_TOKENS } from "../features/design-system/tokens";
import { PlanStatusDisplay, type BillingInterval } from "../features/payments-subscriptions/payments-subscriptions";
import { getFirebaseAuthErrorMessage, getFirebaseClientAuth } from "../lib/firebaseAuthClient";

type PreferenceState = {
  topics: string[];
  frequency: "daily" | "weekdays" | "weekly";
  country: string;
  province: string;
  deliveryTime: string;
  timezone: string;
  newsletterEnabled: boolean;
};

type PaperDepth = "quick" | "balanced" | "deep";
type PaperTone = "straight" | "analytical" | "practical";

type ReaderFeedbackState = {
  depth: PaperDepth;
  tone: PaperTone;
  improvements: string[];
  notes: string;
  updatedAt: string;
};

type PaperStory = {
  id: string;
  title: string;
  source: string;
  summary: string;
  detail: string;
  whyItMatters: string;
  canonicalUrl: string;
  publishedAt: string;
};

type PaperSection = {
  topic: string;
  stories: PaperStory[];
};

type PersonalizedPaper = {
  id: string;
  subject: string;
  createdAt: string;
  readingTimeMinutes: number;
  generationMode: "local-personalized";
  sections: PaperSection[];
  refinementSummary: string;
};

const STORAGE_KEY = "daily-paper-demo-preferences";
const BILLING_KEY = "daily-paper-demo-billing";
const PROFILE_KEY = "daily-paper-demo-profile";
const READER_FEEDBACK_KEY = "daily-paper-reader-feedback";
const PAPER_HISTORY_KEY = "daily-paper-generated-paper";
const TRIAL_DAYS = 15;
const TOPIC_GROUPS = [
  {
    name: "News",
    topics: ["Politics", "World Affairs", "Canada", "Local News", "Policy", "Elections", "Development"]
  },
  {
    name: "Money",
    topics: ["Markets", "Personal Finance", "Startups", "Real Estate", "Crypto", "Weekly Winners", "Monthly Winners"]
  },
  {
    name: "Technology",
    topics: ["New in AI", "New in Technology", "Cybersecurity", "Consumer Gadgets", "Space", "Science"]
  },
  {
    name: "Culture",
    topics: ["Entertainment", "Movies", "Music", "Books", "Gaming", "Horoscopes"]
  },
  {
    name: "Sports",
    topics: ["Sports Headlines", "Football", "Basketball", "Cricket", "Soccer", "Tennis", "Formula 1", "Hockey"]
  },
  {
    name: "Life",
    topics: ["Health", "Travel", "Food", "Climate", "Education", "Career"]
  }
] as const;
const FREQUENCIES = [
  { value: "daily", label: "Daily", description: "A fresh paper every day." },
  { value: "weekdays", label: "Weekdays", description: "Monday to Friday only." },
  { value: "weekly", label: "Weekly", description: "A deeper weekly roundup." }
] as const;
const TIMEZONES = ["America/Toronto", "America/New_York", "America/Los_Angeles", "UTC"];
const READER_DEPTHS = [
  { value: "quick", label: "Quick scan", description: "Shorter sections for a fast morning read." },
  { value: "balanced", label: "Balanced", description: "Enough context without becoming a long report." },
  { value: "deep", label: "More detailed", description: "More context, implications, and why-it-matters notes." }
] as const;
const READER_TONES = [
  { value: "straight", label: "Straight news" },
  { value: "analytical", label: "More analysis" },
  { value: "practical", label: "Practical takeaways" }
] as const;
const IMPROVEMENT_OPTIONS = [
  "Less high-level summary",
  "More local context",
  "More source links",
  "More business detail",
  "More policy background",
  "More quick bullets",
  "More global context",
  "Fewer repeated stories"
] as const;

const defaultPreferences: PreferenceState = {
  topics: [],
  frequency: "daily",
  country: "Canada",
  province: "Ontario",
  deliveryTime: "08:00",
  timezone: "America/Toronto",
  newsletterEnabled: true
};

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string;
};

type BillingState = {
  status: "trialing" | "active" | "expired" | "past_due" | "canceled";
  startedAt: string;
  trialEndsAt: string;
  selectedInterval: BillingInterval;
};

type AccountProfileState = {
  displayName: string;
  photoUrl: string;
  location: string;
  headline: string;
};

const shellStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "24px 16px 40px",
  color: DESIGN_TOKENS.colors.textPrimary,
  font: DESIGN_TOKENS.typography.body,
  background:
    "radial-gradient(circle at 9% 2%, rgba(34,211,238,0.24), transparent 30%), radial-gradient(circle at 84% 0%, rgba(244,114,182,0.18), transparent 32%), linear-gradient(180deg, #070912 0%, #0B1020 100%)"
};

const panelStyle: React.CSSProperties = {
  width: "min(920px, 100%)",
  margin: "0 auto",
  padding: 24,
  boxSizing: "border-box",
  borderRadius: 16,
  border: "1px solid rgba(34,211,238,0.24)",
  background: "rgba(17,24,39,0.82)",
  boxShadow: "0 24px 70px rgba(0,0,0,0.34), 0 0 36px rgba(34,211,238,0.12)"
};

const buttonBase: React.CSSProperties = {
  border: "1px solid rgba(167,179,200,0.24)",
  borderRadius: 999,
  padding: "10px 14px",
  color: DESIGN_TOKENS.colors.textPrimary,
  background: "rgba(7,9,18,0.74)",
  cursor: "pointer",
  fontWeight: 700
};

function getPreferenceStorageKey(userId?: string): string {
  return userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY;
}

function readPreferences(userId?: string): PreferenceState {
  if (typeof window === "undefined") return defaultPreferences;

  const raw = window.localStorage.getItem(getPreferenceStorageKey(userId));
  if (!raw) return defaultPreferences;

  try {
    return { ...defaultPreferences, ...(JSON.parse(raw) as Partial<PreferenceState>) };
  } catch {
    return defaultPreferences;
  }
}

function savePreferences(preferences: PreferenceState, userId?: string): void {
  window.localStorage.setItem(getPreferenceStorageKey(userId), JSON.stringify(preferences));
}

function getBillingStorageKey(userId?: string): string {
  return userId ? `${BILLING_KEY}:${userId}` : BILLING_KEY;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function createDefaultBillingState(): BillingState {
  const startedAt = new Date();
  return {
    status: "trialing",
    startedAt: startedAt.toISOString(),
    trialEndsAt: addDays(startedAt, TRIAL_DAYS).toISOString(),
    selectedInterval: "monthly"
  };
}

function readBillingState(userId?: string): BillingState {
  if (typeof window === "undefined") return createDefaultBillingState();

  const key = getBillingStorageKey(userId);
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    const created = createDefaultBillingState();
    window.localStorage.setItem(key, JSON.stringify(created));
    return created;
  }

  try {
    const parsed = { ...createDefaultBillingState(), ...(JSON.parse(raw) as Partial<BillingState>) };
    if (parsed.status === "trialing" && new Date(parsed.trialEndsAt).getTime() <= Date.now()) {
      return { ...parsed, status: "expired" };
    }
    return parsed;
  } catch {
    return createDefaultBillingState();
  }
}

function saveBillingState(billing: BillingState, userId?: string): void {
  window.localStorage.setItem(getBillingStorageKey(userId), JSON.stringify(billing));
}

function getReaderFeedbackStorageKey(userId?: string): string {
  return userId ? `${READER_FEEDBACK_KEY}:${userId}` : READER_FEEDBACK_KEY;
}

function getPaperStorageKey(userId?: string): string {
  return userId ? `${PAPER_HISTORY_KEY}:${userId}` : PAPER_HISTORY_KEY;
}

function createDefaultReaderFeedback(): ReaderFeedbackState {
  return {
    depth: "balanced",
    tone: "straight",
    improvements: [],
    notes: "",
    updatedAt: new Date().toISOString()
  };
}

function readReaderFeedback(userId?: string): ReaderFeedbackState {
  if (typeof window === "undefined") return createDefaultReaderFeedback();

  const raw = window.localStorage.getItem(getReaderFeedbackStorageKey(userId));
  if (!raw) return createDefaultReaderFeedback();

  try {
    return { ...createDefaultReaderFeedback(), ...(JSON.parse(raw) as Partial<ReaderFeedbackState>) };
  } catch {
    return createDefaultReaderFeedback();
  }
}

function saveReaderFeedback(feedback: ReaderFeedbackState, userId?: string): void {
  window.localStorage.setItem(getReaderFeedbackStorageKey(userId), JSON.stringify(feedback));
}

function readLatestPaper(userId?: string): PersonalizedPaper | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(getPaperStorageKey(userId));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PersonalizedPaper;
  } catch {
    return null;
  }
}

function saveLatestPaper(paper: PersonalizedPaper, userId?: string): void {
  window.localStorage.setItem(getPaperStorageKey(userId), JSON.stringify(paper));
}

function getProfileStorageKey(userId?: string): string {
  return userId ? `${PROFILE_KEY}:${userId}` : PROFILE_KEY;
}

function getDefaultDisplayName(user?: User | null): string {
  if (user?.displayName) return user.displayName;
  if (user?.email) return user.email.split("@")[0];
  return "Daily Paper Reader";
}

function createDefaultProfile(user?: User | null): AccountProfileState {
  return {
    displayName: getDefaultDisplayName(user),
    photoUrl: user?.photoURL ?? "",
    location: "",
    headline: "Curious reader"
  };
}

function readAccountProfile(user?: User | null): AccountProfileState {
  if (typeof window === "undefined") return createDefaultProfile(user);

  const raw = window.localStorage.getItem(getProfileStorageKey(user?.uid));
  if (!raw) return createDefaultProfile(user);

  try {
    return { ...createDefaultProfile(user), ...(JSON.parse(raw) as Partial<AccountProfileState>) };
  } catch {
    return createDefaultProfile(user);
  }
}

function saveAccountProfile(profile: AccountProfileState, userId?: string): void {
  window.localStorage.setItem(getProfileStorageKey(userId), JSON.stringify(profile));
  window.dispatchEvent(new Event("daily-paper-profile-updated"));
}

function usePreferences(userId?: string): [PreferenceState, (next: PreferenceState) => void] {
  const [preferences, setPreferences] = React.useState<PreferenceState>(() => readPreferences(userId));

  React.useEffect(() => {
    setPreferences(readPreferences(userId));
  }, [userId]);

  const persist = React.useCallback((next: PreferenceState) => {
    setPreferences(next);
    savePreferences(next, userId);
  }, [userId]);

  return [preferences, persist];
}

function useBillingState(userId?: string): [BillingState, (next: BillingState) => void] {
  const [billing, setBilling] = React.useState<BillingState>(() => readBillingState(userId));

  React.useEffect(() => {
    setBilling(readBillingState(userId));
  }, [userId]);

  const persist = React.useCallback((next: BillingState) => {
    setBilling(next);
    saveBillingState(next, userId);
  }, [userId]);

  return [billing, persist];
}

function useReaderFeedback(userId?: string): [ReaderFeedbackState, (next: ReaderFeedbackState) => void] {
  const [feedback, setFeedback] = React.useState<ReaderFeedbackState>(() => readReaderFeedback(userId));

  React.useEffect(() => {
    setFeedback(readReaderFeedback(userId));
  }, [userId]);

  const persist = React.useCallback((next: ReaderFeedbackState) => {
    setFeedback(next);
    saveReaderFeedback(next, userId);
  }, [userId]);

  return [feedback, persist];
}

function useAccountProfile(user?: User | null): [AccountProfileState, (next: AccountProfileState) => void] {
  const [profile, setProfile] = React.useState<AccountProfileState>(() => readAccountProfile(user));

  React.useEffect(() => {
    const syncProfile = (): void => setProfile(readAccountProfile(user));
    syncProfile();
    window.addEventListener("daily-paper-profile-updated", syncProfile);
    return () => window.removeEventListener("daily-paper-profile-updated", syncProfile);
  }, [user?.uid, user?.displayName, user?.photoURL]);

  const persist = React.useCallback((next: AccountProfileState) => {
    setProfile(next);
    saveAccountProfile(next, user?.uid);
  }, [user?.uid]);

  return [profile, persist];
}

function getTrialDaysRemaining(billing: BillingState): number {
  if (billing.status !== "trialing") return 0;
  const remainingMs = new Date(billing.trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
}

function getPlanLabel(billing: BillingState): string {
  if (billing.status === "trialing") return `${getTrialDaysRemaining(billing)} trial days left`;
  if (billing.status === "active") return `Daily Paper Plus ${billing.selectedInterval}`;
  if (billing.status === "past_due") return "Payment needs attention";
  if (billing.status === "canceled") return "Canceled";
  return "Trial expired";
}

function getInitials(nameOrEmail: string): string {
  const words = nameOrEmail.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "DP";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function isE2EAuthSession(): boolean {
  return typeof window !== "undefined" && window.localStorage.getItem("daily-paper-e2e-auth") === "true";
}

function createPersonalizedPaper(preferences: PreferenceState, feedback: ReaderFeedbackState, userId?: string): PersonalizedPaper {
  const createdAt = new Date();
  const topics = preferences.topics.length ? preferences.topics : ["New in AI", "Markets", "World Affairs"];
  const storyCount = feedback.depth === "deep" ? 3 : feedback.depth === "quick" ? 1 : 2;
  const sections = topics.slice(0, feedback.depth === "deep" ? 8 : 6).map((topic, topicIndex) => ({
    topic,
    stories: Array.from({ length: storyCount }, (_, storyIndex) =>
      buildPaperStory(topic, topicIndex, storyIndex, preferences, feedback, createdAt)
    )
  }));
  const storyTotal = sections.reduce((count, section) => count + section.stories.length, 0);

  return {
    id: `paper-${userId ?? "reader"}-${createdAt.toISOString().slice(0, 10)}`,
    subject: `${preferences.frequency === "weekly" ? "Weekly" : "Daily"} Paper for ${createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    createdAt: createdAt.toISOString(),
    readingTimeMinutes: Math.max(3, Math.ceil(storyTotal * (feedback.depth === "deep" ? 1.25 : 0.8))),
    generationMode: "local-personalized",
    sections,
    refinementSummary: summarizeReaderFeedback(feedback)
  };
}

function createPaidPreviewPaper(): PersonalizedPaper {
  return createPersonalizedPaper(
    {
      topics: ["New in AI", "Markets", "Politics", "Sports Headlines"],
      frequency: "daily",
      country: "Canada",
      province: "Ontario",
      deliveryTime: "08:00",
      timezone: "America/Toronto",
      newsletterEnabled: true
    },
    {
      depth: "deep",
      tone: "analytical",
      improvements: ["Less high-level summary", "More business detail", "More local context", "More source links"],
      notes: "Show the kind of richer paid paper a reader receives after subscription.",
      updatedAt: new Date().toISOString()
    },
    "plus-preview"
  );
}

function buildPaperStory(
  topic: string,
  topicIndex: number,
  storyIndex: number,
  preferences: PreferenceState,
  feedback: ReaderFeedbackState,
  createdAt: Date
): PaperStory {
  const angle = getTopicAngle(topic, storyIndex);
  const locality = feedback.improvements.includes("More local context")
    ? ` with a ${preferences.province || preferences.country} lens`
    : "";
  const detail = feedback.depth === "deep"
    ? `This deeper brief adds background, likely second-order effects, and the open questions a regular newspaper reader would want before moving on.`
    : feedback.depth === "quick"
      ? "This quick brief keeps the story compact so you can scan the paper fast."
      : "This balanced brief gives the core context and the practical implication without overloading the page.";
  const tone = feedback.tone === "analytical"
    ? "The analysis angle focuses on trade-offs, incentives, and what could change next."
    : feedback.tone === "practical"
      ? "The practical angle highlights what a reader can watch, save, or act on."
      : "The straight-news angle keeps the wording neutral and source-first.";
  const improvement = feedback.improvements.includes("Less high-level summary")
    ? "The summary avoids generic framing and names the specific signal to watch."
    : "The summary is written for fast understanding.";

  return {
    id: `${slug(topic)}-${storyIndex + 1}`,
    title: `${topic}: ${angle}`,
    source: storyIndex % 2 === 0 ? "Daily Paper Source Desk" : "Curated Wire Brief",
    summary: `${topic} coverage${locality} is organized around ${angle.toLowerCase()}. ${improvement}`,
    detail: `${detail} ${tone}`,
    whyItMatters: getWhyItMatters(topic, preferences, feedback),
    canonicalUrl: "/samples",
    publishedAt: new Date(createdAt.getTime() - (topicIndex * 2 + storyIndex) * 60 * 60 * 1000).toISOString()
  };
}

function getTopicAngle(topic: string, storyIndex: number): string {
  const lower = topic.toLowerCase();
  const fallback = ["what changed today", "what readers should watch", "what it means this week"];

  if (lower.includes("ai")) return ["new tools and model updates", "where adoption is showing up", "risks and practical uses"][storyIndex] ?? fallback[storyIndex] ?? fallback[0];
  if (lower.includes("market") || lower.includes("finance") || lower.includes("business")) return ["major movers and pressure points", "earnings and rate signals", "winners, losers, and what drove them"][storyIndex] ?? fallback[0];
  if (lower.includes("politic") || lower.includes("policy") || lower.includes("election")) return ["policy decisions and public reaction", "campaign signals and voter issues", "what changes for households"][storyIndex] ?? fallback[0];
  if (lower.includes("sport") || lower.includes("football") || lower.includes("cricket") || lower.includes("hockey")) return ["fixtures, form, and injury notes", "matchups that could swing the table", "what fans should watch"][storyIndex] ?? fallback[0];
  if (lower.includes("local") || lower.includes("canada")) return ["regional decisions and community impact", "housing, services, and affordability", "what changes near you"][storyIndex] ?? fallback[0];
  if (lower.includes("horoscope")) return ["your lighter daily reading ritual", "mood, timing, and reflection", "culture notes beside the stars"][storyIndex] ?? fallback[0];
  if (lower.includes("technology")) return ["product launches and platform shifts", "security and consumer impact", "what builders are watching"][storyIndex] ?? fallback[0];

  return fallback[storyIndex] ?? fallback[0];
}

function getWhyItMatters(topic: string, preferences: PreferenceState, feedback: ReaderFeedbackState): string {
  const region = preferences.province || preferences.country;
  if (feedback.improvements.includes("More business detail")) {
    return `It may affect budgets, markets, pricing, or company strategy for readers watching ${topic}.`;
  }
  if (feedback.improvements.includes("More policy background")) {
    return `It gives policy context so the ${topic} story is easier to follow beyond the headline.`;
  }
  if (feedback.improvements.includes("More local context")) {
    return `It connects the larger ${topic} story back to ${region}.`;
  }
  return `It helps you decide whether this ${topic} story deserves a deeper read.`;
}

function summarizeReaderFeedback(feedback: ReaderFeedbackState): string {
  const depth = READER_DEPTHS.find((item) => item.value === feedback.depth)?.label ?? "Balanced";
  const tone = READER_TONES.find((item) => item.value === feedback.tone)?.label ?? "Straight news";
  const improvements = feedback.improvements.length ? feedback.improvements.join(", ") : "default curation";
  return `${depth} depth, ${tone.toLowerCase()}, ${improvements}.`;
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function getDevE2EUser(): User | null {
  const viteEnv = (typeof import.meta !== "undefined" ? import.meta.env : undefined) as
    | { DEV?: boolean }
    | undefined;

  if (!viteEnv?.DEV || typeof window === "undefined") {
    return null;
  }

  if (window.localStorage.getItem("daily-paper-e2e-auth") !== "true") {
    return null;
  }

  return {
    uid: "e2e-user",
    email: "e2e-reader@dailypaper.test",
    emailVerified: true,
    displayName: "E2E Reader",
    isAnonymous: false,
    providerData: [],
    metadata: {},
    phoneNumber: null,
    photoURL: null,
    providerId: "password",
    tenantId: null,
    delete: async () => undefined,
    getIdToken: async () => "e2e-token",
    getIdTokenResult: async () => ({}) as Awaited<ReturnType<User["getIdTokenResult"]>>,
    reload: async () => undefined,
    toJSON: () => ({ uid: "e2e-user", email: "e2e-reader@dailypaper.test" }),
    refreshToken: "e2e-refresh-token"
  } as User;
}

function useAuthState(): AuthState {
  const [state, setState] = React.useState<AuthState>({ user: null, loading: true, error: "" });

  React.useEffect(() => {
    const devUser = getDevE2EUser();
    if (devUser) {
      setState({ user: devUser, loading: false, error: "" });
      return undefined;
    }

    try {
      const unsubscribe = onAuthStateChanged(getFirebaseClientAuth(), (user) => {
        setState({ user, loading: false, error: "" });
      });

      return unsubscribe;
    } catch {
      setState({ user: null, loading: false, error: getFirebaseAuthErrorMessage(error) });
      return undefined;
    }
  }, []);

  return state;
}

function AuthRequired({ auth }: { auth: AuthState }): React.JSX.Element | null {
  if (auth.loading) {
    return (
      <main style={shellStyle}>
        <section style={panelStyle}>
          <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>Checking your session...</p>
        </section>
        <PoweredByNetfroot />
      </main>
    );
  }

  if (auth.user) {
    return null;
  }

  return (
    <main style={shellStyle}>
      <section style={panelStyle}>
        <h1 style={{ font: DESIGN_TOKENS.typography.h1, marginTop: 0 }}>Sign in to manage your paper</h1>
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
          Your newsletter preferences, delivery schedule, and unsubscribe controls are available after sign in.
        </p>
        {auth.error ? <p style={{ color: DESIGN_TOKENS.colors.error }}>{auth.error}</p> : null}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/login" style={ctaLinkStyle}>
            Sign In
          </a>
          <a href="/signup" style={secondaryLinkStyle}>
            Create Account
          </a>
        </div>
      </section>
      <PoweredByNetfroot />
    </main>
  );
}

async function logoutAndReturnHome(): Promise<void> {
  await signOut(getFirebaseClientAuth());
  window.location.assign("/login");
}

function Avatar({ profile, size = 38 }: { profile: AccountProfileState; size?: number }): React.JSX.Element {
  const label = `${profile.displayName} profile picture`;
  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    flex: "0 0 auto",
    border: "1px solid rgba(34,211,238,0.58)",
    background: "linear-gradient(135deg, rgba(34,211,238,0.24), rgba(244,114,182,0.22))",
    color: DESIGN_TOKENS.colors.textPrimary,
    fontWeight: 900,
    overflow: "hidden",
    boxShadow: "0 0 22px rgba(34,211,238,0.18)"
  };

  if (profile.photoUrl) {
    return <img src={profile.photoUrl} alt={label} style={{ ...baseStyle, objectFit: "cover" }} />;
  }

  return (
    <span aria-label={label} style={baseStyle}>
      {getInitials(profile.displayName)}
    </span>
  );
}

function AppNav({ user }: { user?: User | null }): React.JSX.Element {
  const [profile] = useAccountProfile(user ?? null);
  const [billing] = useBillingState(user?.uid);

  return (
    <header style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
      <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a href="/settings" style={navLinkStyle}>
          Dashboard
        </a>
        <a href="/dashboard/paper" style={navLinkStyle}>
          My Paper
        </a>
        <a href="/dashboard/preview" style={navLinkStyle}>
          Preview Plus
        </a>
        <a href="/dashboard/preferences" style={navLinkStyle}>
          Preferences
        </a>
        <a href="/dashboard/newsletter" style={navLinkStyle}>
          Newsletter
        </a>
        <a href="/billing" style={navLinkStyle}>
          Billing
        </a>
        <a href="/onboarding" style={navLinkStyle}>
          Onboarding
        </a>
      </nav>
      {user ? (
        <details style={{ position: "relative" }}>
          <summary
            data-testid="profile-menu-summary"
            style={{
              ...smallButtonStyle,
              display: "flex",
              alignItems: "center",
              gap: 10,
              listStyle: "none",
              minWidth: 220,
              justifyContent: "space-between"
            }}
          >
            <Avatar profile={profile} />
            <span style={{ display: "grid", minWidth: 0 }}>
              <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.displayName}</strong>
              <span style={{ color: DESIGN_TOKENS.colors.textSecondary, fontSize: 13 }}>{getPlanLabel(billing)}</span>
            </span>
          </summary>
          <div
            role="menu"
            aria-label="Profile menu"
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              zIndex: 10,
              width: 260,
              padding: 12,
              borderRadius: 14,
              border: "1px solid rgba(34,211,238,0.28)",
              background: "rgba(7,9,18,0.96)",
              boxShadow: "0 24px 70px rgba(0,0,0,0.42)"
            }}
          >
            <p style={{ margin: "0 0 10px", color: DESIGN_TOKENS.colors.textSecondary, overflowWrap: "anywhere" }}>
              {user.email ?? "Signed in"}
            </p>
            <a role="menuitem" href="/profile" style={menuLinkStyle}>My Profile</a>
            <a role="menuitem" href="/dashboard/paper" style={menuLinkStyle}>Read My Paper</a>
            <a role="menuitem" href="/dashboard/preview" style={menuLinkStyle}>Preview Plus Paper</a>
            <a role="menuitem" href="/billing" style={menuLinkStyle}>My Plan</a>
            <a role="menuitem" href="/dashboard/preferences" style={menuLinkStyle}>Preferences</a>
            <a role="menuitem" href="/dashboard/newsletter" style={menuLinkStyle}>Newsletter Delivery</a>
            <button type="button" role="menuitem" style={{ ...menuButtonStyle, color: DESIGN_TOKENS.colors.error }} onClick={() => void logoutAndReturnHome()}>
              Sign Out
            </button>
          </div>
        </details>
      ) : null}
    </header>
  );
}

const navLinkStyle: React.CSSProperties = {
  color: DESIGN_TOKENS.colors.brandPrimary,
  textDecoration: "none",
  fontWeight: 700
};

const smallButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(34,211,238,0.26)",
  borderRadius: 999,
  background: "rgba(7,9,18,0.74)",
  color: DESIGN_TOKENS.colors.textPrimary,
  padding: "8px 12px",
  cursor: "pointer",
  fontWeight: 800
};

const menuLinkStyle: React.CSSProperties = {
  display: "block",
  padding: "10px 8px",
  color: DESIGN_TOKENS.colors.textPrimary,
  textDecoration: "none",
  borderRadius: 10,
  fontWeight: 800
};

const menuButtonStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "10px 8px",
  border: 0,
  borderRadius: 10,
  background: "transparent",
  textAlign: "left",
  color: DESIGN_TOKENS.colors.textPrimary,
  cursor: "pointer",
  font: DESIGN_TOKENS.typography.body,
  fontWeight: 800
};

function BackToSettings(): React.JSX.Element {
  return (
    <a href="/settings" style={{ ...secondaryLinkStyle, marginBottom: 18 }}>
      Back to Dashboard
    </a>
  );
}

function PoweredByNetfroot(): React.JSX.Element {
  return (
    <footer style={{ width: "min(920px, 100%)", margin: "18px auto 0", color: DESIGN_TOKENS.colors.textSecondary }}>
      Powered by{" "}
      <a href="https://www.netfroot.com/" style={{ color: DESIGN_TOKENS.colors.brandPrimary, fontWeight: 800 }}>
        Netfroot
      </a>
    </footer>
  );
}

function TopicButton({
  topic,
  selected,
  onToggle
}: {
  topic: string;
  selected: boolean;
  onToggle: () => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      style={{
        ...buttonBase,
        background: selected ? "#3b82f6" : "rgba(7,9,18,0.74)",
        borderColor: selected ? "rgba(34,211,238,0.88)" : "rgba(167,179,200,0.24)",
        boxShadow: selected ? "0 0 22px rgba(34,211,238,0.36)" : "none"
      }}
    >
      {topic}
    </button>
  );
}

function FieldLabel({
  children,
  label
}: {
  children: React.ReactNode;
  label: string;
}): React.JSX.Element {
  return (
    <label style={{ display: "grid", gap: 6, color: DESIGN_TOKENS.colors.textSecondary, fontWeight: 700 }}>
      <span>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  minHeight: 42,
  borderRadius: 10,
  border: "1px solid rgba(34,211,238,0.28)",
  background: "rgba(7,9,18,0.78)",
  color: DESIGN_TOKENS.colors.textPrimary,
  padding: "8px 10px",
  font: DESIGN_TOKENS.typography.body
};

export function OnboardingPage(): React.JSX.Element {
  const auth = useAuthState();
  const userId = auth.user?.uid;
  const [, persist] = usePreferences(userId);
  const [draft, setDraft] = React.useState<PreferenceState>(() => ({ ...readPreferences(userId), topics: [] }));
  const [step, setStep] = React.useState(0);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (userId) {
      setDraft({ ...readPreferences(userId), topics: [] });
    }
  }, [userId]);

  const guard = AuthRequired({ auth });
  if (guard) return guard;

  const toggleTopic = (topic: string): void => {
    setDraft((current) => ({
      ...current,
      topics: current.topics.includes(topic)
        ? current.topics.filter((item) => item !== topic)
        : [...current.topics, topic]
    }));
    setError("");
  };

  const next = (): void => {
    if (step === 0 && draft.topics.length === 0) {
      setError("Please select at least one topic.");
      return;
    }
    setStep((current) => Math.min(current + 1, 3));
  };

  const complete = (): void => {
    persist(draft);
    window.location.assign("/dashboard/preferences");
  };

  return (
    <main style={shellStyle}>
      <section style={panelStyle}>
        <AppNav user={auth.user} />
        <BackToSettings />
        <h1 style={{ font: DESIGN_TOKENS.typography.h1, marginTop: 0 }}>Personalize Your Daily News</h1>

        {step === 0 && (
          <section>
            <h2>What topics interest you?</h2>
            <p style={{ color: DESIGN_TOKENS.colors.textSecondary, maxWidth: 720 }}>
              Choose a few broad interests or go detailed. These selections become the AI prompt for your paper.
            </p>
            <div style={{ display: "grid", gap: 18 }}>
              {TOPIC_GROUPS.map((group) => (
                <section key={group.name}>
                  <h3 style={{ font: DESIGN_TOKENS.typography.h3, margin: "0 0 8px" }}>{group.name}</h3>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", maxWidth: 840 }}>
                    {group.topics.map((topic) => (
                      <TopicButton
                        key={topic}
                        topic={topic}
                        selected={draft.topics.includes(topic)}
                        onToggle={() => toggleTopic(topic)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
            {error && <p style={{ color: DESIGN_TOKENS.colors.error }}>{error}</p>}
          </section>
        )}

        {step === 1 && (
          <section style={{ display: "grid", gap: 16 }}>
            <h2>Your Region</h2>
            <FieldLabel label="Country">
              <select
                value={draft.country}
                onChange={(event) => setDraft({ ...draft, country: event.target.value })}
                style={inputStyle}
              >
                <option>Canada</option>
                <option>United States</option>
                <option>United Kingdom</option>
              </select>
            </FieldLabel>
            <FieldLabel label="Region">
              <input
                placeholder="e.g., Ontario"
                value={draft.province}
                onChange={(event) => setDraft({ ...draft, province: event.target.value })}
                style={inputStyle}
              />
            </FieldLabel>
          </section>
        )}

        {step === 2 && (
          <section style={{ display: "grid", gap: 16 }}>
            <h2>How often should we deliver?</h2>
            <fieldset style={{ border: "1px solid rgba(34,211,238,0.24)", borderRadius: 12, padding: 12 }}>
              <legend>Frequency</legend>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                {FREQUENCIES.map((frequency) => (
                  <label
                    key={frequency.value}
                    style={{
                      border: `1px solid ${draft.frequency === frequency.value ? "rgba(34,211,238,0.88)" : "rgba(167,179,200,0.24)"}`,
                      borderRadius: 12,
                      padding: 12,
                      background: draft.frequency === frequency.value ? "rgba(34,211,238,0.14)" : "rgba(7,9,18,0.62)",
                      cursor: "pointer"
                    }}
                  >
                    <input
                      type="radio"
                      name="frequency"
                      value={frequency.value}
                      checked={draft.frequency === frequency.value}
                      onChange={() => setDraft({ ...draft, frequency: frequency.value })}
                    />
                    <strong style={{ marginLeft: 8 }}>{frequency.label}</strong>
                    <span style={{ display: "block", color: DESIGN_TOKENS.colors.textSecondary }}>{frequency.description}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <FieldLabel label="Time">
              <input
                type="time"
                value={draft.deliveryTime}
                onChange={(event) => setDraft({ ...draft, deliveryTime: event.target.value })}
                style={inputStyle}
              />
            </FieldLabel>
            <FieldLabel label="Timezone">
              <select
                value={draft.timezone}
                onChange={(event) => setDraft({ ...draft, timezone: event.target.value })}
                style={inputStyle}
              >
                {TIMEZONES.map((timezone) => (
                  <option key={timezone}>{timezone}</option>
                ))}
              </select>
            </FieldLabel>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2>Review your preferences</h2>
            <div style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
              <p>Topics: {draft.topics.join(", ")}</p>
              <p>
                Region: {draft.country}, {draft.province}
              </p>
              <p>Frequency: {FREQUENCIES.find((frequency) => frequency.value === draft.frequency)?.label ?? draft.frequency}</p>
              <p>Delivery Time: {draft.deliveryTime} ({draft.timezone})</p>
            </div>
          </section>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          {step > 0 && (
            <button type="button" onClick={() => setStep((current) => current - 1)} style={buttonBase}>
              Back
            </button>
          )}
          {step < 3 ? (
            <button type="button" onClick={next} style={{ ...buttonBase, background: DESIGN_TOKENS.colors.brandPrimary, color: "#07111F" }}>
              Next
            </button>
          ) : (
            <button type="button" onClick={complete} style={{ ...buttonBase, background: DESIGN_TOKENS.colors.brandPrimary, color: "#07111F" }}>
              Complete Onboarding
            </button>
          )}
        </div>
      </section>
      <PoweredByNetfroot />
    </main>
  );
}

export function PreferencesPage(): React.JSX.Element {
  const auth = useAuthState();
  const userId = auth.user?.uid;
  const [saved, persist] = usePreferences(userId);
  const [draft, setDraft] = React.useState<PreferenceState>(saved);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => setDraft(saved), [saved]);

  const guard = AuthRequired({ auth });
  if (guard) return guard;

  const isDirty = JSON.stringify(saved) !== JSON.stringify(draft);

  const toggleTopic = (topic: string): void => {
    setDraft((current) => ({
      ...current,
      topics: current.topics.includes(topic)
        ? current.topics.filter((item) => item !== topic)
        : [...current.topics, topic]
    }));
    setMessage("");
    setError("");
  };

  const save = (): void => {
    if (draft.topics.length === 0) {
      setError("Please select at least one topic.");
      return;
    }

    persist(draft);
    setMessage("Preferences updated successfully. Delivery time updated.");
    setError("");
  };

  return (
    <main style={shellStyle}>
      <section style={panelStyle}>
        <AppNav user={auth.user} />
        <BackToSettings />
        <h1 style={{ font: DESIGN_TOKENS.typography.h1, marginTop: 0 }}>Update Your Preferences</h1>
        <div style={{ display: "grid", gap: 18 }}>
          <fieldset style={{ border: "1px solid rgba(34,211,238,0.24)", borderRadius: 12 }}>
            <legend>Topics</legend>
            <div style={{ display: "grid", gap: 16, padding: 8 }}>
              {TOPIC_GROUPS.map((group) => (
                <section key={group.name}>
                  <h3 style={{ font: DESIGN_TOKENS.typography.h3, margin: "0 0 8px" }}>{group.name}</h3>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {group.topics.map((topic) => (
                      <TopicButton
                        key={topic}
                        topic={topic}
                        selected={draft.topics.includes(topic)}
                        onToggle={() => toggleTopic(topic)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </fieldset>

          <fieldset style={{ border: "1px solid rgba(34,211,238,0.24)", borderRadius: 12, padding: 12 }}>
            <legend>Frequency</legend>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
              {FREQUENCIES.map((frequency) => (
                <label
                  key={frequency.value}
                  style={{
                    border: `1px solid ${draft.frequency === frequency.value ? "rgba(34,211,238,0.88)" : "rgba(167,179,200,0.24)"}`,
                    borderRadius: 12,
                    padding: 12,
                    background: draft.frequency === frequency.value ? "rgba(34,211,238,0.14)" : "rgba(7,9,18,0.62)",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="radio"
                    name="preference-frequency"
                    value={frequency.value}
                    checked={draft.frequency === frequency.value}
                    onChange={() => {
                      setDraft({ ...draft, frequency: frequency.value });
                      setMessage("");
                      setError("");
                    }}
                  />
                  <strong style={{ marginLeft: 8 }}>{frequency.label}</strong>
                  <span style={{ display: "block", color: DESIGN_TOKENS.colors.textSecondary }}>{frequency.description}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <FieldLabel label="Region">
            <input
              placeholder="e.g., Ontario"
              value={draft.province}
              onChange={(event) => setDraft({ ...draft, province: event.target.value })}
              style={inputStyle}
            />
          </FieldLabel>

          <FieldLabel label="Time">
            <input
              data-testid="delivery-time"
              type="time"
              value={draft.deliveryTime}
              onChange={(event) => setDraft({ ...draft, deliveryTime: event.target.value })}
              style={inputStyle}
            />
          </FieldLabel>

          <FieldLabel label="Timezone">
            <select
              data-testid="timezone"
              value={draft.timezone}
              onChange={(event) => setDraft({ ...draft, timezone: event.target.value })}
              style={inputStyle}
            >
              {TIMEZONES.map((timezone) => (
                <option key={timezone}>{timezone}</option>
              ))}
            </select>
          </FieldLabel>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
          <button type="button" onClick={() => setDraft(saved)} style={buttonBase}>
            Reset
          </button>
          <button
            type="button"
            data-testid="save-preferences"
            onClick={save}
            disabled={!isDirty}
            style={{
              ...buttonBase,
              opacity: isDirty ? 1 : 0.55,
              background: isDirty ? DESIGN_TOKENS.colors.brandPrimary : "rgba(7,9,18,0.74)",
              color: isDirty ? "#07111F" : DESIGN_TOKENS.colors.textPrimary
            }}
          >
            Save Changes
          </button>
        </div>

        {message && (
          <p data-testid="success-message" style={{ color: DESIGN_TOKENS.colors.success }}>
            {message}
          </p>
        )}
        {error && <p style={{ color: DESIGN_TOKENS.colors.error }}>{error}</p>}
      </section>
      <PoweredByNetfroot />
    </main>
  );
}

export function MyPaperPage(): React.JSX.Element {
  const auth = useAuthState();
  const userId = auth.user?.uid;
  const [preferences] = usePreferences(userId);
  const [billing] = useBillingState(userId);
  const [feedback, persistFeedback] = useReaderFeedback(userId);
  const [draftFeedback, setDraftFeedback] = React.useState<ReaderFeedbackState>(feedback);
  const [paper, setPaper] = React.useState<PersonalizedPaper | null>(() => readLatestPaper(userId));
  const [message, setMessage] = React.useState("");

  React.useEffect(() => setDraftFeedback(feedback), [feedback]);
  React.useEffect(() => setPaper(readLatestPaper(userId)), [userId]);

  const guard = AuthRequired({ auth });
  if (guard) return guard;

  const generate = (nextFeedback = draftFeedback): void => {
    if (!preferences.topics.length) {
      setMessage("Choose at least one topic before creating your paper.");
      return;
    }

    const normalizedFeedback = { ...nextFeedback, updatedAt: new Date().toISOString() };
    persistFeedback(normalizedFeedback);
    const nextPaper = createPersonalizedPaper(preferences, normalizedFeedback, userId);
    saveLatestPaper(nextPaper, userId);
    setPaper(nextPaper);
    setMessage("Your paper is ready to read.");
  };

  const toggleImprovement = (improvement: string): void => {
    setDraftFeedback((current) => ({
      ...current,
      improvements: current.improvements.includes(improvement)
        ? current.improvements.filter((item) => item !== improvement)
        : [...current.improvements, improvement]
    }));
    setMessage("");
  };

  return (
    <main style={shellStyle}>
      <section style={{ ...panelStyle, width: "min(1100px, 100%)" }}>
        <AppNav user={auth.user} />
        <BackToSettings />
        <p style={eyebrowTextStyle}>Personal newspaper</p>
        <h1 style={{ font: DESIGN_TOKENS.typography.h1, margin: "0 0 10px" }}>Read Your Daily Paper</h1>
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary, maxWidth: 760 }}>
          Create a personal newspaper from your saved topics, then tune the depth and style when the output feels too broad or not useful enough.
        </p>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: 14, margin: "20px 0", alignItems: "start" }}>
          <div style={metricStyle}>
            Plan<br />
            <strong>{getPlanLabel(billing)}</strong>
          </div>
          <div style={metricStyle}>
            Topics<br />
            <strong>{preferences.topics.length ? preferences.topics.length : "None selected"}</strong>
          </div>
          <div style={metricStyle}>
            Reading Style<br />
            <strong>{READER_DEPTHS.find((item) => item.value === feedback.depth)?.label ?? "Balanced"}</strong>
          </div>
        </section>

        {preferences.topics.length === 0 ? (
          <section style={emptyStateStyle}>
            <h2 style={{ font: DESIGN_TOKENS.typography.h2, marginTop: 0 }}>Choose topics to build your paper</h2>
            <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
              Your personal newspaper starts with topics. Pick business, politics, sports, AI, local news, horoscopes, or anything else you want included.
            </p>
            <a href="/dashboard/preferences" style={ctaLinkStyle}>Choose Topics</a>
          </section>
        ) : (
          <div style={{ display: "grid", gap: 18 }}>
            <section style={readerControlStyle}>
              <div>
                <h2 style={{ font: DESIGN_TOKENS.typography.h2, margin: 0 }}>Create Today&apos;s Paper</h2>
                <p style={{ color: DESIGN_TOKENS.colors.textSecondary, marginBottom: 0 }}>
                  Uses your saved topics: {preferences.topics.slice(0, 8).join(", ")}.
                </p>
              </div>
              <button
                type="button"
                data-testid="generate-my-paper"
                onClick={() => generate()}
                style={{ ...buttonBase, background: DESIGN_TOKENS.colors.brandPrimary, color: "#07111F", width: "fit-content" }}
              >
                Generate Today&apos;s Paper
              </button>
            </section>

            <section style={readerControlStyle}>
              <h2 style={{ font: DESIGN_TOKENS.typography.h2, margin: 0 }}>Improve My News</h2>
              <fieldset style={fieldsetBoxStyle}>
                <legend>Depth</legend>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
                  {READER_DEPTHS.map((depth) => (
                    <label key={depth.value} style={radioCardStyle(draftFeedback.depth === depth.value)}>
                      <input
                        type="radio"
                        name="reader-depth"
                        value={depth.value}
                        checked={draftFeedback.depth === depth.value}
                        onChange={() => setDraftFeedback({ ...draftFeedback, depth: depth.value })}
                      />
                      <strong>{depth.label}</strong>
                      <span style={{ color: DESIGN_TOKENS.colors.textSecondary }}>{depth.description}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <FieldLabel label="Tone">
                <select
                  value={draftFeedback.tone}
                  onChange={(event) => setDraftFeedback({ ...draftFeedback, tone: event.target.value as PaperTone })}
                  style={inputStyle}
                >
                  {READER_TONES.map((tone) => (
                    <option key={tone.value} value={tone.value}>{tone.label}</option>
                  ))}
                </select>
              </FieldLabel>

              <fieldset style={fieldsetBoxStyle}>
                <legend>What should improve?</legend>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {IMPROVEMENT_OPTIONS.map((improvement) => (
                    <button
                      key={improvement}
                      type="button"
                      aria-pressed={draftFeedback.improvements.includes(improvement)}
                      onClick={() => toggleImprovement(improvement)}
                      style={{
                        ...buttonBase,
                        background: draftFeedback.improvements.includes(improvement) ? "rgba(244,114,182,0.28)" : "rgba(7,9,18,0.74)",
                        borderColor: draftFeedback.improvements.includes(improvement) ? "rgba(244,114,182,0.76)" : "rgba(167,179,200,0.24)"
                      }}
                    >
                      {improvement}
                    </button>
                  ))}
                </div>
              </fieldset>

              <FieldLabel label="Additional instruction">
                <textarea
                  value={draftFeedback.notes}
                  placeholder="Example: I want business stories to include numbers and market impact."
                  onChange={(event) => setDraftFeedback({ ...draftFeedback, notes: event.target.value })}
                  style={{ ...inputStyle, minHeight: 92, resize: "vertical" }}
                />
              </FieldLabel>

              <button
                type="button"
                data-testid="apply-paper-feedback"
                onClick={() => generate(draftFeedback)}
                style={{ ...buttonBase, background: DESIGN_TOKENS.colors.accentHighlight, color: "#07111F", width: "fit-content" }}
              >
                Apply and Regenerate
              </button>
            </section>

            {message ? <p role="status" style={{ color: DESIGN_TOKENS.colors.success }}>{message}</p> : null}

            {paper ? <PaperReader paper={paper} /> : (
              <section style={emptyStateStyle}>
                <h2 style={{ font: DESIGN_TOKENS.typography.h2, marginTop: 0 }}>No in-app paper generated yet</h2>
                <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
                  Generate today&apos;s edition to read it here. Email delivery can still stay active separately.
                </p>
              </section>
            )}
          </div>
        )}
      </section>
      <PoweredByNetfroot />
    </main>
  );
}

function PaperReader({ paper }: { paper: PersonalizedPaper }): React.JSX.Element {
  return (
    <article data-testid="my-paper-reader" style={paperStyle}>
      <header style={{ borderBottom: "1px solid rgba(167,179,200,0.18)", paddingBottom: 16, marginBottom: 18 }}>
        <p style={eyebrowTextStyle}>Generated in app</p>
        <h2 style={{ font: DESIGN_TOKENS.typography.h1, margin: "0 0 6px" }}>{paper.subject}</h2>
        <p style={{ color: "#475569", margin: 0 }}>
          {new Date(paper.createdAt).toLocaleString()} · {paper.readingTimeMinutes} min read · {paper.refinementSummary}
        </p>
      </header>
      <div style={{ display: "grid", gap: 20 }}>
        {paper.sections.map((section) => (
          <section key={section.topic} style={{ display: "grid", gap: 12 }}>
            <h3 style={{ font: DESIGN_TOKENS.typography.h2, margin: 0, color: "#0E7490" }}>{section.topic}</h3>
            {section.stories.map((story) => (
              <article key={story.id} style={storyCardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <h4 style={{ font: DESIGN_TOKENS.typography.h3, margin: 0 }}>{story.title}</h4>
                  <span style={{ color: DESIGN_TOKENS.colors.accentHighlight, fontWeight: 900 }}>Summary</span>
                </div>
                <p style={{ color: "#475569", margin: 0 }}>
                  {story.source} · {new Date(story.publishedAt).toLocaleDateString("en-US")}
                </p>
                <p style={{ margin: 0 }}>{story.summary}</p>
                <p style={{ margin: 0, color: "#475569" }}>{story.detail}</p>
                <p style={{ margin: 0 }}><strong>Why it matters:</strong> {story.whyItMatters}</p>
                <a href={story.canonicalUrl} style={{ color: "#0E7490", fontWeight: 900 }}>View related samples</a>
              </article>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}

function PaidPaperPreviewCard(): React.JSX.Element {
  const preview = React.useMemo(() => createPaidPreviewPaper(), []);
  const firstSection = preview.sections[0];

  return (
    <section data-testid="paid-paper-preview-card" style={readerControlStyle}>
      <div>
        <p style={eyebrowTextStyle}>Subscription preview</p>
        <h2 style={{ font: DESIGN_TOKENS.typography.h2, margin: "4px 0 6px" }}>See exactly what Plus includes</h2>
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary, margin: 0 }}>
          Preview a full Daily Paper Plus issue before paying: sections, source labels, summaries, and why-it-matters notes.
        </p>
      </div>
      <article style={{ ...paperStyle, padding: 16 }}>
        <p style={{ ...eyebrowTextStyle, color: "#BE185D" }}>Example issue</p>
        <h3 style={{ font: DESIGN_TOKENS.typography.h2, margin: "4px 0", color: "#0F172A" }}>{preview.subject}</h3>
        <p style={{ color: "#475569", margin: "0 0 12px" }}>
          {preview.readingTimeMinutes} min read · {preview.refinementSummary}
        </p>
        {firstSection ? (
          <section style={{ display: "grid", gap: 10 }}>
            <h4 style={{ font: DESIGN_TOKENS.typography.h3, color: "#0E7490", margin: 0 }}>{firstSection.topic}</h4>
            {firstSection.stories.slice(0, 2).map((story) => (
              <div key={story.id} style={{ ...storyCardStyle, padding: 12 }}>
                <strong>{story.title}</strong>
                <span style={{ color: "#475569" }}>{story.summary}</span>
              </div>
            ))}
          </section>
        ) : null}
      </article>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href="/dashboard/preview" style={ctaLinkStyle}>Open Full Preview</a>
        <a href="/dashboard/preferences" style={secondaryLinkStyle}>Customize My Topics</a>
      </div>
    </section>
  );
}

export function PlusPreviewPage(): React.JSX.Element {
  const auth = useAuthState();
  const guard = AuthRequired({ auth });
  const preview = React.useMemo(() => createPaidPreviewPaper(), []);

  if (guard) return guard;

  return (
    <main style={shellStyle}>
      <section style={{ ...panelStyle, width: "min(1100px, 100%)" }}>
        <AppNav user={auth.user} />
        <BackToSettings />
        <p style={eyebrowTextStyle}>Daily Paper Plus preview</p>
        <h1 style={{ font: DESIGN_TOKENS.typography.h1, margin: "0 0 10px" }}>Preview the Newspaper You&apos;re Paying For</h1>
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary, maxWidth: 780 }}>
          This is a representative Plus issue: a finite newspaper-style read with sections, context, source labels, and notes that explain why each story matters.
        </p>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: 12, margin: "20px 0" }}>
          <div style={metricStyle}>Format<br /><strong>In-app + email</strong></div>
          <div style={metricStyle}>Sections<br /><strong>{preview.sections.length}</strong></div>
          <div style={metricStyle}>Reading time<br /><strong>{preview.readingTimeMinutes} min</strong></div>
          <div style={metricStyle}>Trial<br /><strong>15 days free</strong></div>
        </section>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
          <a href="/billing" style={ctaLinkStyle}>View Plans</a>
          <a href="/dashboard/paper" style={secondaryLinkStyle}>Create My Paper</a>
        </div>
        <PaperReader paper={preview} />
      </section>
      <PoweredByNetfroot />
    </main>
  );
}

export function NewsletterPage(): React.JSX.Element {
  const auth = useAuthState();
  const [preferences, persist] = usePreferences(auth.user?.uid);

  const setEnabled = (newsletterEnabled: boolean): void => persist({ ...preferences, newsletterEnabled });

  const guard = AuthRequired({ auth });
  if (guard) return guard;

  return (
    <main style={shellStyle}>
      <section style={panelStyle}>
        <AppNav user={auth.user} />
        <BackToSettings />
        <h1 style={{ font: DESIGN_TOKENS.typography.h1, marginTop: 0 }}>Newsletter Delivery</h1>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            width: "fit-content",
            padding: 12,
            borderRadius: 999,
            background: preferences.newsletterEnabled ? "rgba(52,211,153,0.18)" : "rgba(251,113,133,0.18)"
          }}
        >
          <input
            type="checkbox"
            checked={preferences.newsletterEnabled}
            onChange={(event) => setEnabled(event.target.checked)}
          />
          <strong>{preferences.newsletterEnabled ? "Delivery Active" : "Delivery Paused"}</strong>
        </label>
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
          {preferences.newsletterEnabled
            ? "You're receiving your Daily Paper on schedule."
            : "Delivery is paused. Your preferences are saved and ready whenever you resume."}
        </p>
        <button
          type="button"
          data-testid="subscription-toggle"
          onClick={() => setEnabled(!preferences.newsletterEnabled)}
          style={{ ...buttonBase, background: DESIGN_TOKENS.colors.accentHighlight, color: "#07111F" }}
        >
          {preferences.newsletterEnabled ? "Unsubscribe" : "Resubscribe"}
        </button>
        {!preferences.newsletterEnabled && (
          <p data-testid="unsubscribed-message" style={{ color: DESIGN_TOKENS.colors.warning }}>
            You are unsubscribed from the daily newsletter.
          </p>
        )}

        <section style={{ marginTop: 24 }}>
          <h2>Saved Preferences</h2>
          <p>Topics: {preferences.topics.length ? preferences.topics.join(", ") : "No topics chosen yet"}</p>
          <p>Region: {preferences.country}, {preferences.province}</p>
          <p>Frequency: {FREQUENCIES.find((frequency) => frequency.value === preferences.frequency)?.label ?? preferences.frequency}</p>
          <p>Delivery Time: {preferences.deliveryTime} ({preferences.timezone})</p>
          <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
            Your preferences are always saved, even when delivery is paused.
          </p>
        </section>
      </section>
      <PoweredByNetfroot />
    </main>
  );
}

export function SettingsPage(): React.JSX.Element {
  const auth = useAuthState();
  const [preferences] = usePreferences(auth.user?.uid);
  const [billing] = useBillingState(auth.user?.uid);

  const guard = AuthRequired({ auth });
  if (guard) return guard;

  return (
    <main style={shellStyle}>
      <section style={panelStyle}>
        <AppNav user={auth.user} />
        <h1 style={{ font: DESIGN_TOKENS.typography.h1, marginTop: 0 }}>Your Daily Paper Settings</h1>
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary, maxWidth: 680 }}>
          Manage what you receive, when it arrives, and whether newsletter delivery is active.
        </p>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, margin: "20px 0" }}>
          <div style={metricStyle}>
            Newsletter<br />
            <strong>{preferences.newsletterEnabled ? "Subscribed" : "Paused"}</strong>
          </div>
          <div style={metricStyle}>
            Topics<br />
            <strong>{preferences.topics.length ? preferences.topics.length : "None yet"}</strong>
          </div>
          <div style={metricStyle}>
            Frequency<br />
            <strong>{FREQUENCIES.find((frequency) => frequency.value === preferences.frequency)?.label ?? preferences.frequency}</strong>
          </div>
          <div style={metricStyle}>
            Time<br />
            <strong>{preferences.deliveryTime}</strong>
          </div>
          <div style={metricStyle}>
            Plan<br />
            <strong>{billing.status === "trialing" ? `${getTrialDaysRemaining(billing)} trial days` : billing.status}</strong>
          </div>
        </section>
        {preferences.topics.length === 0 ? (
          <p style={{ color: DESIGN_TOKENS.colors.warning }}>
            No topics are selected yet. Start onboarding or open preferences to choose what your AI paper should cover.
          </p>
        ) : null}
        <div style={{ margin: "20px 0" }}>
          <PaidPaperPreviewCard />
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a data-testid="read-my-paper" href="/dashboard/paper" style={ctaLinkStyle}>
            Read My Paper
          </a>
          <a data-testid="preview-plus-paper" href="/dashboard/preview" style={secondaryLinkStyle}>
            Preview Plus Paper
          </a>
          <a data-testid="email-preferences" href="/dashboard/preferences" style={ctaLinkStyle}>
            Choose Topics
          </a>
          <a data-testid="subscription-settings" href="/dashboard/newsletter" style={ctaLinkStyle}>
            Manage Subscription
          </a>
          <a href="/onboarding" style={secondaryLinkStyle}>
            Restart Onboarding
          </a>
          <a href="/billing" style={secondaryLinkStyle}>
            Billing
          </a>
        </div>
      </section>
      <PoweredByNetfroot />
    </main>
  );
}

export function ProfilePage(): React.JSX.Element {
  const auth = useAuthState();
  const user = auth.user;
  const [billing] = useBillingState(user?.uid);
  const [savedProfile, persistProfile] = useAccountProfile(user);
  const [draft, setDraft] = React.useState<AccountProfileState>(savedProfile);
  const [profileMessage, setProfileMessage] = React.useState("");
  const [profileError, setProfileError] = React.useState("");
  const [passwords, setPasswords] = React.useState({ next: "", confirm: "" });
  const [passwordMessage, setPasswordMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");

  React.useEffect(() => setDraft(savedProfile), [savedProfile]);

  const guard = AuthRequired({ auth });
  if (guard) return guard;

  const saveProfile = async (): Promise<void> => {
    const displayName = draft.displayName.trim();
    if (!displayName) {
      setProfileError("Enter the name you want shown on your profile.");
      setProfileMessage("");
      return;
    }

    const nextProfile = {
      ...draft,
      displayName,
      photoUrl: draft.photoUrl.trim(),
      location: draft.location.trim(),
      headline: draft.headline.trim()
    };

    try {
      if (user && !isE2EAuthSession()) {
        const providerPhotoUrl = nextProfile.photoUrl.startsWith("data:")
          ? user.photoURL ?? null
          : nextProfile.photoUrl || null;
        await updateProfile(user, {
          displayName: nextProfile.displayName,
          photoURL: providerPhotoUrl
        });
      }
      persistProfile(nextProfile);
      setProfileMessage("Profile updated.");
      setProfileError("");
    } catch (error) {
      persistProfile(nextProfile);
      setProfileMessage("Profile saved in Daily Paper. The account provider will sync it after your next sign-in.");
      setProfileError("We could not sync the profile with your sign-in provider right now.");
    }
  };

  const readPhotoFile = (file?: File): void => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setDraft((current) => ({ ...current, photoUrl: result }));
      setProfileMessage("Photo preview added. Save your profile to keep it here.");
      setProfileError("");
    };
    reader.readAsDataURL(file);
  };

  const changePassword = async (): Promise<void> => {
    if (passwords.next.length < 12) {
      setPasswordError("Use at least 12 characters for your new password.");
      setPasswordMessage("");
      return;
    }

    if (passwords.next !== passwords.confirm) {
      setPasswordError("The password confirmation does not match.");
      setPasswordMessage("");
      return;
    }

    try {
      if (user && !isE2EAuthSession()) {
        await updatePassword(user, passwords.next);
      }
      setPasswords({ next: "", confirm: "" });
      setPasswordMessage("Password updated.");
      setPasswordError("");
    } catch (error) {
      setPasswordError(getFirebaseAuthErrorMessage(error));
      setPasswordMessage("");
    }
  };

  return (
    <main style={shellStyle}>
      <section style={panelStyle}>
        <AppNav user={user} />
        <BackToSettings />
        <h1 style={{ font: DESIGN_TOKENS.typography.h1, marginTop: 0 }}>Your Profile</h1>
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary, maxWidth: 720 }}>
          Manage the identity, photo, password, and plan details connected to your Daily Paper account.
        </p>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
            gap: 18,
            marginTop: 22,
            alignItems: "start"
          }}
        >
          <aside
            data-testid="profile-preview"
            style={{
              border: "1px solid rgba(34,211,238,0.24)",
              borderRadius: 14,
              padding: 18,
              background: "rgba(7,9,18,0.52)",
              display: "grid",
              gap: 12,
              alignContent: "start"
            }}
          >
            <Avatar profile={draft} size={88} />
            <div>
              <h2 style={{ font: DESIGN_TOKENS.typography.h2, margin: 0 }}>{draft.displayName || "Daily Paper Reader"}</h2>
              <p style={{ margin: "4px 0", color: DESIGN_TOKENS.colors.textSecondary, overflowWrap: "anywhere" }}>{user?.email}</p>
              <p style={{ margin: "8px 0 0" }}>{draft.headline || "Curious reader"}</p>
              {draft.location ? <p style={{ margin: "4px 0 0", color: DESIGN_TOKENS.colors.textSecondary }}>{draft.location}</p> : null}
            </div>
            <div style={metricStyle}>
              Plan<br />
              <strong>{getPlanLabel(billing)}</strong>
            </div>
            <a href="/billing" style={secondaryLinkStyle}>
              View Billing
            </a>
          </aside>

          <div style={{ display: "grid", gap: 18 }}>
            <section style={{ display: "grid", gap: 14 }}>
              <h2 style={{ font: DESIGN_TOKENS.typography.h2, margin: 0 }}>Profile Details</h2>
              <FieldLabel label="Display name">
                <input
                  value={draft.displayName}
                  onChange={(event) => {
                    setDraft({ ...draft, displayName: event.target.value });
                    setProfileMessage("");
                    setProfileError("");
                  }}
                  style={inputStyle}
                />
              </FieldLabel>
              <FieldLabel label="Headline">
                <input
                  value={draft.headline}
                  placeholder="e.g., Product builder, investor, student"
                  onChange={(event) => setDraft({ ...draft, headline: event.target.value })}
                  style={inputStyle}
                />
              </FieldLabel>
              <FieldLabel label="Location">
                <input
                  value={draft.location}
                  placeholder="e.g., Toronto"
                  onChange={(event) => setDraft({ ...draft, location: event.target.value })}
                  style={inputStyle}
                />
              </FieldLabel>
              <FieldLabel label="Photo URL">
                <input
                  value={draft.photoUrl}
                  placeholder="https://..."
                  onChange={(event) => setDraft({ ...draft, photoUrl: event.target.value })}
                  style={inputStyle}
                />
              </FieldLabel>
              <FieldLabel label="Upload picture">
                <input
                  aria-label="Upload picture"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => readPhotoFile(event.target.files?.[0])}
                  style={inputStyle}
                />
              </FieldLabel>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="button" onClick={() => setDraft(savedProfile)} style={buttonBase}>
                  Reset Profile
                </button>
                <button
                  type="button"
                  data-testid="save-profile"
                  onClick={() => void saveProfile()}
                  style={{ ...buttonBase, background: DESIGN_TOKENS.colors.brandPrimary, color: "#07111F" }}
                >
                  Save Profile
                </button>
              </div>
              {profileMessage ? <p role="status" style={{ color: DESIGN_TOKENS.colors.success }}>{profileMessage}</p> : null}
              {profileError ? <p role="alert" style={{ color: DESIGN_TOKENS.colors.error }}>{profileError}</p> : null}
            </section>

            <section style={{ display: "grid", gap: 14 }}>
              <h2 style={{ font: DESIGN_TOKENS.typography.h2, margin: 0 }}>Password</h2>
              <FieldLabel label="New password">
                <input
                  type="password"
                  autoComplete="new-password"
                  value={passwords.next}
                  onChange={(event) => setPasswords({ ...passwords, next: event.target.value })}
                  style={inputStyle}
                />
              </FieldLabel>
              <FieldLabel label="Confirm new password">
                <input
                  type="password"
                  autoComplete="new-password"
                  value={passwords.confirm}
                  onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })}
                  style={inputStyle}
                />
              </FieldLabel>
              <button
                type="button"
                data-testid="change-password"
                onClick={() => void changePassword()}
                style={{ ...buttonBase, width: "fit-content", background: DESIGN_TOKENS.colors.accentHighlight, color: "#07111F" }}
              >
                Change Password
              </button>
              {passwordMessage ? <p role="status" style={{ color: DESIGN_TOKENS.colors.success }}>{passwordMessage}</p> : null}
              {passwordError ? <p role="alert" style={{ color: DESIGN_TOKENS.colors.error }}>{passwordError}</p> : null}
            </section>
          </div>
        </section>
      </section>
      <PoweredByNetfroot />
    </main>
  );
}

export function BillingPage(): React.JSX.Element {
  const auth = useAuthState();
  const userId = auth.user?.uid;
  const [billing, persistBilling] = useBillingState(userId);
  const [message, setMessage] = React.useState("");

  const guard = AuthRequired({ auth });
  if (guard) return guard;

  const selectInterval = (selectedInterval: BillingInterval): void => {
    persistBilling({ ...billing, selectedInterval });
    setMessage("");
  };

  const startCheckout = (): void => {
    setMessage("Checkout needs a Stripe payment link before live billing can start. Your trial remains active.");
  };

  return (
    <main style={shellStyle}>
      <section style={panelStyle}>
        <AppNav user={auth.user} />
        <BackToSettings />
        <PaidPaperPreviewCard />
        <div style={{ height: 18 }} />
        <PlanStatusDisplay
          userId={userId ?? "signed-in-user"}
          status={billing.status}
          trialDaysRemaining={getTrialDaysRemaining(billing)}
          selectedInterval={billing.selectedInterval}
          onSelectInterval={selectInterval}
          onStartCheckout={startCheckout}
        />
        {message ? <p style={{ color: DESIGN_TOKENS.colors.warning }}>{message}</p> : null}
      </section>
      <PoweredByNetfroot />
    </main>
  );
}

type AdminTab = "overview" | "users" | "newsletters" | "content" | "growth";

type AdminNewsletterIssue = {
  id: string;
  subject: string;
  audience: string;
  status: "sent" | "generated" | "blocked";
  generatedAt: string;
  sentAt?: string;
  generationMode: "ai" | "fallback";
  sourceCount: number;
  openRate?: string;
  topics: string[];
  preview: string;
};

type MarketingVideoScript = {
  durationSeconds: number;
  title: string;
  hook: string;
  caption: string;
  hashtags: string[];
};

type MarketingAgentResult = {
  date: string;
  blogDraft: {
    title: string;
    metaDescription: string;
    excerpt: string;
    canonicalPath: string;
    ctaRoute: string;
    sampleRoute: string;
  };
  videoScripts: MarketingVideoScript[];
  publishingPlan: {
    recommendedPublishWindow: string;
    reviewChecklist: string[];
    channels: string[];
  };
  generation: {
    mode: "ai" | "deterministic-fallback";
    modelName: string;
  };
};

type MakeCampaignResult = {
  date: string;
  app: {
    productName: string;
    baseUrl: string;
    positioning: string;
  };
  strategy: "minimal-cost" | "growth";
  contentKit?: MarketingAgentResult;
  makeScenario: {
    name: string;
    trigger: string;
    cadence: string;
    monthlyOperationEstimate: number;
    minimumPlanFit: "free-tier-friendly" | "paid-plan-likely";
    steps: Array<{
      order: number;
      module: string;
      action: string;
      estimatedOperationsPerRun: number;
      notes: string;
    }>;
    setupChecklist: string[];
  };
  publishingQueue: {
    socialPosts: Array<{
      platform: string;
      format: string;
      copy: string;
      hashtags?: string[];
      targetUrl: string;
      status: "draft";
    }>;
    videoBriefs: Array<{
      platform: string;
      durationSeconds: number;
      title: string;
      hook?: string;
      productionMode: "script-only";
      estimatedExternalVideoCostUsd: 0;
    }>;
  };
  costGuardrails: string[];
  requiredUserInputs: string[];
};

type MarketingAutomationRunResult = {
  runId: string;
  date: string;
  provider: "vercel-cron" | "github-actions" | "manual" | "pipedream";
  mode: "draft-only" | "auto-publish-owned-sites";
  status: "drafts-ready" | "published-to-owned-sites";
  scheduler: {
    recommendedPrimary: "vercel-cron";
    fallback: "github-actions";
    cadence: string;
    reason: string;
  };
  monthlyCostEstimateUsd: {
    scheduler: 0;
    draftStorage: 0;
    videoRendering: 0;
    socialPublishing: 0;
    notes: string[];
  };
  apps: Array<{
    appId: "daily-paper" | "astroya";
    productName: string;
    draftCount: number;
    blogSlug: string;
    targetUrl: string;
    campaign: MakeCampaignResult;
    publishing: {
      destination: string;
      approvalRequired: boolean;
      publishPolicy: "draft-only" | "auto-publish-owned-sites";
      suggestedOwnerAction: string;
    };
  }>;
  safeguards: string[];
  nextActions: string[];
};

const adminIssues: AdminNewsletterIssue[] = [
  {
    id: "newsletter-openai-smoke-user-2026-06-02",
    subject: "Daily News Brief - June 2, 2026",
    audience: "OpenAI smoke test",
    status: "generated",
    generatedAt: "2026-06-02T18:10:00.000Z",
    generationMode: "ai",
    sourceCount: 3,
    topics: ["New in AI", "Markets", "Climate technology"],
    preview: "A source-linked AI briefing was generated successfully on production using gpt-4.1-mini."
  },
  {
    id: "newsletter-demo-weekly-2026-06-01",
    subject: "Weekly Paper - AI, Markets, and Culture",
    audience: "Weekly subscribers",
    status: "blocked",
    generatedAt: "2026-06-01T12:00:00.000Z",
    generationMode: "fallback",
    sourceCount: 8,
    topics: ["New in AI", "Markets", "Culture"],
    preview: "Email delivery is blocked until Brevo credentials are configured in Vercel."
  },
  {
    id: "newsletter-demo-daily-2026-05-31",
    subject: "Daily Paper - May 31",
    audience: "Daily subscribers",
    status: "sent",
    generatedAt: "2026-05-31T11:00:00.000Z",
    sentAt: "2026-05-31T12:00:00.000Z",
    generationMode: "fallback",
    sourceCount: 12,
    openRate: "42%",
    topics: ["Technology", "Business", "World"],
    preview: "Historical fixture used to model newsletter views, delivery metrics, and admin inspection."
  }
];

const adminUsers = [
  { id: "usr_001", email: "ma***@example.com", status: "active", joined: "2026-05-31", topics: 9, frequency: "Daily" },
  { id: "usr_002", email: "ne***@example.com", status: "active", joined: "2026-05-29", topics: 14, frequency: "Weekly" },
  { id: "usr_003", email: "te***@example.com", status: "paused", joined: "2026-05-22", topics: 4, frequency: "Weekdays" }
] as const;

const growthPlan = [
  "Publish two searchable blog posts per week from strong newsletter themes.",
  "Create one short video per week: problem, sample paper, preference setup, inbox result.",
  "Add public sample newsletters for AI, markets, sports, horoscope, and local-news audiences.",
  "Track signup conversion by source once analytics is connected."
] as const;

const marketingAppProfiles = {
  "daily-paper": {
    appId: "daily-paper",
    productName: "Daily Paper",
    positioning: "A personalized AI daily paper for readers who want useful news without the scroll.",
    baseUrl: "https://dailynews-theta-ten.vercel.app",
    sampleRoute: "/samples/ai-daily-paper",
    ctaRoute: "/signup",
    topic: "why a personalized daily news briefing helps people make better everyday decisions",
    audience: "young professionals and students who want useful news without scrolling",
    themes: ["source-linked AI summaries", "topic preferences", "15-day free trial", "daily or weekly delivery"]
  },
  astroya: {
    appId: "astroya",
    productName: "Astroya SoulPath",
    positioning: "A calm astrology and palmistry guidance experience for people who want reflective self-discovery without generic horoscope noise.",
    baseUrl: "https://www.astroya.ca",
    sampleRoute: "/how-it-works",
    ctaRoute: "/signup",
    topic: "why personalized astrology and palmistry guidance helps people reflect with more clarity",
    audience: "spiritually curious adults who want a calm, personal astrology and palmistry experience",
    themes: ["Vedic and Western astrology", "palmistry-assisted reflection", "birth details", "AI-powered consultation"]
  }
} as const;

type MarketingAppId = keyof typeof marketingAppProfiles;

const defaultMarketingTopic = "why a personalized daily news briefing helps people make better everyday decisions";
const defaultMarketingAudience = "young professionals and students who want useful news without scrolling";

function statusColor(status: AdminNewsletterIssue["status"] | string): string {
  if (status === "sent" || status === "active") return DESIGN_TOKENS.colors.success;
  if (status === "blocked" || status === "paused") return DESIGN_TOKENS.colors.warning;
  return DESIGN_TOKENS.colors.brandPrimary;
}

function AdminSection({
  children,
  title,
  action
}: {
  children: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}): React.JSX.Element {
  return (
    <section style={adminSectionStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <h2 style={{ font: DESIGN_TOKENS.typography.h2, margin: 0 }}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function MarketingAgentPanel(): React.JSX.Element {
  const [adminToken, setAdminToken] = React.useState("");
  const [selectedAppId, setSelectedAppId] = React.useState<MarketingAppId>("daily-paper");
  const [topic, setTopic] = React.useState(defaultMarketingTopic);
  const [audience, setAudience] = React.useState(defaultMarketingAudience);
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [makeStatus, setMakeStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [automationStatus, setAutomationStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState("");
  const [makeMessage, setMakeMessage] = React.useState("");
  const [automationMessage, setAutomationMessage] = React.useState("");
  const [result, setResult] = React.useState<MarketingAgentResult | null>(null);
  const [makeResult, setMakeResult] = React.useState<MakeCampaignResult | null>(null);
  const [automationResult, setAutomationResult] = React.useState<MarketingAutomationRunResult | null>(null);
  const selectedApp = marketingAppProfiles[selectedAppId];

  const selectMarketingApp = (appId: MarketingAppId): void => {
    const profile = marketingAppProfiles[appId];
    setSelectedAppId(appId);
    setTopic(profile.topic);
    setAudience(profile.audience);
    setResult(null);
    setMakeResult(null);
    setAutomationResult(null);
    setMessage("");
    setMakeMessage("");
    setAutomationMessage("");
  };

  const generate = async (): Promise<void> => {
    if (!adminToken.trim()) {
      setStatus("error");
      setMessage("Enter the admin token before generating marketing content.");
      return;
    }

    if (!topic.trim()) {
      setStatus("error");
      setMessage("Enter a topic for tonight's content kit.");
      return;
    }

    setStatus("loading");
    setMessage("");
    setResult(null);

    try {
      const response = await fetch("/api/marketing/daily-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken.trim()}`
        },
        body: JSON.stringify({
          productName: selectedApp.productName,
          positioning: selectedApp.positioning,
          topic,
          audience,
          newsletterThemes: selectedApp.themes,
          baseUrl: selectedApp.baseUrl,
          sampleRoute: selectedApp.sampleRoute,
          ctaRoute: selectedApp.ctaRoute
        })
      });

      if (!response.ok) {
        throw new Error("generation_failed");
      }

      const payload = (await response.json()) as MarketingAgentResult;
      setResult(payload);
      setStatus("success");
      setMessage("Marketing kit generated. Review the draft before publishing or posting.");
    } catch {
      setStatus("error");
      setMessage("We could not generate the marketing kit. Check the admin token and try again.");
    }
  };

  const generateMakeCampaign = async (): Promise<void> => {
    if (!adminToken.trim()) {
      setMakeStatus("error");
      setMakeMessage("Enter the admin token before generating a Make.com campaign kit.");
      return;
    }

    if (!topic.trim()) {
      setMakeStatus("error");
      setMakeMessage("Enter a topic for the Make.com campaign kit.");
      return;
    }

    setMakeStatus("loading");
    setMakeMessage("");
    setMakeResult(null);

    try {
      const response = await fetch("/api/marketing/make-campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken.trim()}`
        },
        body: JSON.stringify({
          appId: selectedApp.appId,
          productName: selectedApp.productName,
          positioning: selectedApp.positioning,
          strategy: "minimal-cost",
          platforms: ["blog", "instagram-reels", "youtube-shorts", "facebook-reels"],
          dailyVideoCount: 1,
          topic,
          audience,
          newsletterThemes: selectedApp.themes,
          baseUrl: selectedApp.baseUrl,
          sampleRoute: selectedApp.sampleRoute,
          ctaRoute: selectedApp.ctaRoute
        })
      });

      if (!response.ok) {
        throw new Error("make_campaign_failed");
      }

      const payload = (await response.json()) as MakeCampaignResult;
      setMakeResult(payload);
      setMakeStatus("success");
      setMakeMessage(`Make.com campaign kit generated. Use it to build the first low-cost ${selectedApp.productName} scenario.`);
    } catch {
      setMakeStatus("error");
      setMakeMessage("We could not generate the Make.com campaign kit. Check the admin token and try again.");
    }
  };

  const runAutomationBatch = async (): Promise<void> => {
    if (!adminToken.trim()) {
      setAutomationStatus("error");
      setAutomationMessage("Enter the admin token before running the automation batch.");
      return;
    }

    setAutomationStatus("loading");
    setAutomationMessage("");
    setAutomationResult(null);

    try {
      const response = await fetch("/api/marketing/automation-run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken.trim()}`
        },
        body: JSON.stringify({
          appIds: ["daily-paper", "astroya"],
          provider: "manual",
          mode: "auto-publish-owned-sites"
        })
      });

      if (!response.ok) {
        throw new Error("automation_run_failed");
      }

      const payload = (await response.json()) as MarketingAutomationRunResult;
      setAutomationResult(payload);
      setAutomationStatus("success");
      setAutomationMessage("Automation batch is ready. Daily Paper blog can auto-publish; social posting will start after accounts are connected.");
    } catch {
      setAutomationStatus("error");
      setAutomationMessage("We could not run the automation batch. Check the admin token and try again.");
    }
  };

  return (
    <AdminSection title="AI Marketing Agent">
      <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
        <FieldLabel label="Marketing app">
          <select
            aria-label="Marketing app"
            value={selectedAppId}
            onChange={(event) => selectMarketingApp(event.target.value as MarketingAppId)}
            style={inputStyle}
          >
            <option value="daily-paper">Daily Paper</option>
            <option value="astroya">Astroya SoulPath</option>
          </select>
        </FieldLabel>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <FieldLabel label="Admin token">
            <input
              aria-label="Marketing admin token"
              type="password"
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              placeholder="NEWSLETTER_ADMIN_TOKEN"
              style={inputStyle}
            />
          </FieldLabel>
          <FieldLabel label="Audience">
            <input
              aria-label="Marketing audience"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              style={inputStyle}
            />
          </FieldLabel>
        </div>

        <FieldLabel label="Topic">
          <textarea
            aria-label="Marketing topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </FieldLabel>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            data-testid="generate-marketing-kit"
            onClick={() => void generate()}
            disabled={status === "loading"}
            style={{
              ...buttonBase,
              width: "fit-content",
              background: DESIGN_TOKENS.colors.brandPrimary,
              color: "#07111F"
            }}
          >
            {status === "loading" ? "Generating..." : "Generate Blog and Video Kit"}
          </button>
          <button
            type="button"
            data-testid="generate-make-campaign-kit"
            onClick={() => void generateMakeCampaign()}
            disabled={makeStatus === "loading"}
            style={{
              ...buttonBase,
              width: "fit-content",
              borderColor: "rgba(244,114,182,0.54)",
              background: "rgba(244,114,182,0.14)"
            }}
          >
            {makeStatus === "loading" ? "Preparing..." : "Generate Make.com Campaign Kit"}
          </button>
          <button
            type="button"
            data-testid="run-marketing-automation-batch"
            onClick={() => void runAutomationBatch()}
            disabled={automationStatus === "loading"}
            style={{
              ...buttonBase,
              width: "fit-content",
              borderColor: "rgba(34,211,238,0.58)",
              background: "rgba(34,211,238,0.12)"
            }}
          >
            {automationStatus === "loading" ? "Running..." : "Run Auto-Publish Batch"}
          </button>
        </div>

        {message ? (
          <p role={status === "error" ? "alert" : "status"} style={{ color: status === "error" ? DESIGN_TOKENS.colors.error : DESIGN_TOKENS.colors.success }}>
            {message}
          </p>
        ) : null}
        {makeMessage ? (
          <p role={makeStatus === "error" ? "alert" : "status"} style={{ color: makeStatus === "error" ? DESIGN_TOKENS.colors.error : DESIGN_TOKENS.colors.success }}>
            {makeMessage}
          </p>
        ) : null}
        {automationMessage ? (
          <p role={automationStatus === "error" ? "alert" : "status"} style={{ color: automationStatus === "error" ? DESIGN_TOKENS.colors.error : DESIGN_TOKENS.colors.success }}>
            {automationMessage}
          </p>
        ) : null}

        {result ? (
          <section data-testid="marketing-kit-result" style={{ display: "grid", gap: 14 }}>
            <div style={readinessStyle}>
              <span style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
                {result.date} - {result.generation.mode} via {result.generation.modelName}
              </span>
              <strong>{result.blogDraft.title}</strong>
              <span style={{ color: DESIGN_TOKENS.colors.textSecondary }}>{result.blogDraft.metaDescription}</span>
              <span>{result.blogDraft.excerpt}</span>
              <span style={{ color: DESIGN_TOKENS.colors.brandPrimary }}>
                Draft route: {result.blogDraft.canonicalPath} | CTA: {result.blogDraft.ctaRoute} | Sample: {result.blogDraft.sampleRoute}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {result.videoScripts.map((script) => (
                <article key={script.durationSeconds} style={readinessStyle}>
                  <span style={{ color: DESIGN_TOKENS.colors.accentHighlight, fontWeight: 900 }}>
                    {script.durationSeconds}s short
                  </span>
                  <strong>{script.title}</strong>
                  <span>{script.hook}</span>
                  <span style={{ color: DESIGN_TOKENS.colors.textSecondary }}>{script.caption}</span>
                  <span>{script.hashtags.join(" ")}</span>
                </article>
              ))}
            </div>

            <div style={readinessStyle}>
              <strong>Publish Window</strong>
              <span>{result.publishingPlan.recommendedPublishWindow}</span>
              <span style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
                Channels: {result.publishingPlan.channels.join(", ")}
              </span>
              <ul style={{ margin: "6px 0 0", paddingLeft: 20 }}>
                {result.publishingPlan.reviewChecklist.slice(0, 5).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {makeResult ? (
          <section data-testid="make-campaign-result" style={{ display: "grid", gap: 14 }}>
            <div style={readinessStyle}>
              <span style={{ color: DESIGN_TOKENS.colors.accentHighlight, fontWeight: 900 }}>
                Make.com scenario - {makeResult.makeScenario.minimumPlanFit}
              </span>
              <strong>{makeResult.makeScenario.name}</strong>
              <span>{makeResult.makeScenario.cadence}</span>
              <span style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
                Estimated monthly operations: {makeResult.makeScenario.monthlyOperationEstimate}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <div style={readinessStyle}>
                <strong>Scenario Steps</strong>
                <ol style={{ margin: "6px 0 0", paddingLeft: 20 }}>
                  {makeResult.makeScenario.steps.slice(0, 5).map((step) => (
                    <li key={step.order}>{step.module}: {step.action}</li>
                  ))}
                </ol>
              </div>
              <div style={readinessStyle}>
                <strong>Draft Queue</strong>
                <span>{makeResult.publishingQueue.socialPosts.length} social drafts</span>
                <span>{makeResult.publishingQueue.videoBriefs.length} script-only video briefs</span>
                <span>External video cost: $0 in this starter flow</span>
              </div>
            </div>

            <div style={readinessStyle}>
              <strong>Cost Guardrails</strong>
              <ul style={{ margin: "6px 0 0", paddingLeft: 20 }}>
                {makeResult.costGuardrails.slice(0, 4).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {automationResult ? (
          <section data-testid="marketing-automation-result" style={{ display: "grid", gap: 14 }}>
            <div style={readinessStyle}>
              <span style={{ color: DESIGN_TOKENS.colors.accentHighlight, fontWeight: 900 }}>
                {automationResult.provider} - {automationResult.status}
              </span>
              <strong>{automationResult.runId}</strong>
              <span>{automationResult.scheduler.cadence}</span>
              <span style={{ color: DESIGN_TOKENS.colors.textSecondary }}>{automationResult.scheduler.reason}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {automationResult.apps.map((app) => (
                <article key={app.appId} style={readinessStyle}>
                  <span style={{ color: DESIGN_TOKENS.colors.brandPrimary, fontWeight: 900 }}>{app.productName}</span>
                  <strong>{app.draftCount} generated assets</strong>
                  <span>Blog slug: {app.blogSlug}</span>
                  <span style={{ color: DESIGN_TOKENS.colors.textSecondary }}>{app.publishing.publishPolicy}</span>
                  <span>{app.publishing.suggestedOwnerAction}</span>
                </article>
              ))}
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {automationResult.apps.map((app) => (
                <article key={`${app.appId}-content-preview`} data-testid={`automation-content-preview-${app.appId}`} style={readinessStyle}>
                  <span style={{ color: DESIGN_TOKENS.colors.accentHighlight, fontWeight: 900 }}>{app.productName} Draft Content</span>
                  <strong>{app.campaign.contentKit?.blogDraft.title ?? app.blogSlug}</strong>
                  <span style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
                    {app.campaign.contentKit?.blogDraft.metaDescription ?? app.targetUrl}
                  </span>
                  {app.campaign.contentKit?.blogDraft.excerpt ? <span>{app.campaign.contentKit.blogDraft.excerpt}</span> : null}

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 8 }}>
                    <div style={{ display: "grid", gap: 8 }}>
                      <strong>Social Captions</strong>
                      {app.campaign.publishingQueue.socialPosts.slice(0, 4).map((post, index) => (
                        <div key={`${app.appId}-${post.platform}-${index}`} style={{ display: "grid", gap: 4 }}>
                          <span style={{ color: DESIGN_TOKENS.colors.brandPrimary, fontWeight: 800 }}>{post.platform}</span>
                          <span>{post.copy}</span>
                          {post.hashtags?.length ? <span style={{ color: DESIGN_TOKENS.colors.textSecondary }}>{post.hashtags.join(" ")}</span> : null}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "grid", gap: 8 }}>
                      <strong>Video Briefs</strong>
                      {app.campaign.publishingQueue.videoBriefs.slice(0, 4).map((brief, index) => (
                        <div key={`${app.appId}-${brief.platform}-${brief.durationSeconds}-${index}`} style={{ display: "grid", gap: 4 }}>
                          <span style={{ color: DESIGN_TOKENS.colors.brandPrimary, fontWeight: 800 }}>
                            {brief.durationSeconds}s {brief.platform}
                          </span>
                          <span>{brief.title}</span>
                          {brief.hook ? <span style={{ color: DESIGN_TOKENS.colors.textSecondary }}>{brief.hook}</span> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div style={readinessStyle}>
              <strong>$0 Starter Cost Model</strong>
              <span>
                Scheduler ${automationResult.monthlyCostEstimateUsd.scheduler}, draft storage ${automationResult.monthlyCostEstimateUsd.draftStorage},
                video rendering ${automationResult.monthlyCostEstimateUsd.videoRendering}, social publishing ${automationResult.monthlyCostEstimateUsd.socialPublishing}
              </span>
              <ul style={{ margin: "6px 0 0", paddingLeft: 20 }}>
                {automationResult.safeguards.slice(0, 4).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </div>
    </AdminSection>
  );
}

export function AdminPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = React.useState<AdminTab>("overview");
  const [selectedIssue, setSelectedIssue] = React.useState<AdminNewsletterIssue>(adminIssues[0]);
  const sentCount = adminIssues.filter((issue) => issue.status === "sent").length;
  const generatedCount = adminIssues.filter((issue) => issue.status === "generated").length;
  const blockedCount = adminIssues.filter((issue) => issue.status === "blocked").length;

  return (
    <main style={shellStyle}>
      <section style={{ ...panelStyle, width: "min(1180px, 100%)" }}>
        <style>{adminStyles}</style>
        <AppNav />
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "end" }}>
          <div>
            <p style={{ color: DESIGN_TOKENS.colors.accentHighlight, fontWeight: 900, margin: "0 0 6px" }}>Admin console</p>
            <h1 style={{ font: DESIGN_TOKENS.typography.h1, margin: 0 }}>Daily Paper Operations</h1>
            <p style={{ color: DESIGN_TOKENS.colors.textSecondary, maxWidth: 740 }}>
              Monitor users, generated newsletters, delivery readiness, source quality, and growth work from one control surface.
            </p>
          </div>
          <a href="/blog" style={secondaryLinkStyle}>
            View Blog
          </a>
        </div>

        <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "22px 0" }} aria-label="Admin sections">
          {(["overview", "users", "newsletters", "content", "growth"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                ...buttonBase,
                background: activeTab === tab ? DESIGN_TOKENS.colors.brandPrimary : "rgba(7,9,18,0.74)",
                color: activeTab === tab ? "#07111F" : DESIGN_TOKENS.colors.textPrimary
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        {activeTab === "overview" && (
          <div style={{ display: "grid", gap: 18 }}>
            <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
              <div data-testid="total-users" style={metricStyle}>Users<br /><strong>{adminUsers.length}</strong></div>
              <div data-testid="total-sent" style={metricStyle}>Sent<br /><strong>{sentCount}</strong></div>
              <div data-testid="total-generated" style={metricStyle}>Generated<br /><strong>{generatedCount}</strong></div>
              <div data-testid="delivery-blocked" style={metricStyle}>Blocked<br /><strong>{blockedCount}</strong></div>
              <div data-testid="success-rate" style={metricStyle}>Success Rate<br /><strong>98.4%</strong></div>
            </section>

            <AdminSection title="Readiness">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, marginTop: 16 }}>
                {[
                  ["Firebase Auth", "Connected", DESIGN_TOKENS.colors.success],
                  ["OpenAI generation", "Live", DESIGN_TOKENS.colors.success],
                  ["Brevo email", "Needs credentials", DESIGN_TOKENS.colors.warning],
                  ["Newsletter admin token", "Protected", DESIGN_TOKENS.colors.success]
                ].map(([label, value, color]) => (
                  <div key={label} style={readinessStyle}>
                    <span style={{ color: DESIGN_TOKENS.colors.textSecondary }}>{label}</span>
                    <strong style={{ color }}>{value}</strong>
                  </div>
                ))}
              </div>
            </AdminSection>

            <AdminSection title="Delivery Breakdown">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginTop: 16 }}>
                <table data-testid="skip-reasons-table" style={tableStyle}>
                  <tbody>
                    <tr><th>Skip reason</th><th>Count</th></tr>
                    <tr><td>user_unsubscribed</td><td>42</td></tr>
                    <tr><td>email_not_verified</td><td>18</td></tr>
                    <tr><td>account_blocked</td><td>7</td></tr>
                  </tbody>
                </table>
                <table data-testid="error-codes-table" style={tableStyle}>
                  <tbody>
                    <tr><th>Error code</th><th>Count</th></tr>
                    <tr><td>brevo_not_configured</td><td>1</td></tr>
                    <tr><td>provider_timeout</td><td>5</td></tr>
                    <tr><td>retry_exhausted</td><td>2</td></tr>
                  </tbody>
                </table>
              </div>
            </AdminSection>
          </div>
        )}

        {activeTab === "users" && (
          <AdminSection title="Users">
            <table style={{ ...tableStyle, marginTop: 16 }}>
              <tbody>
                <tr><th>User</th><th>Status</th><th>Joined</th><th>Topics</th><th>Frequency</th></tr>
                {adminUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td style={{ color: statusColor(user.status), fontWeight: 900 }}>{user.status}</td>
                    <td>{user.joined}</td>
                    <td>{user.topics}</td>
                    <td>{user.frequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminSection>
        )}

        {activeTab === "newsletters" && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 1fr) minmax(280px, 0.9fr)", gap: 16 }}>
            <AdminSection title="Newsletter Issues">
              <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                {adminIssues.map((issue) => (
                  <button
                    key={issue.id}
                    type="button"
                    onClick={() => setSelectedIssue(issue)}
                    style={{
                      ...issueButtonStyle,
                      borderColor: selectedIssue.id === issue.id ? "rgba(34,211,238,0.88)" : "rgba(34,211,238,0.18)"
                    }}
                  >
                    <span style={{ fontWeight: 900 }}>{issue.subject}</span>
                    <span style={{ color: DESIGN_TOKENS.colors.textSecondary }}>{issue.audience}</span>
                    <span style={{ color: statusColor(issue.status), fontWeight: 900 }}>{issue.status}</span>
                  </button>
                ))}
              </div>
            </AdminSection>

            <AdminSection
              title="Issue Preview"
              action={<span style={{ color: statusColor(selectedIssue.status), fontWeight: 900 }}>{selectedIssue.status}</span>}
            >
              <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                <h3 style={{ font: DESIGN_TOKENS.typography.h3, margin: 0 }}>{selectedIssue.subject}</h3>
                <p style={{ color: DESIGN_TOKENS.colors.textSecondary, margin: 0 }}>{selectedIssue.preview}</p>
                <p style={{ margin: 0 }}>Topics: {selectedIssue.topics.join(", ")}</p>
                <p style={{ margin: 0 }}>Generation: {selectedIssue.generationMode} · {selectedIssue.sourceCount} sources</p>
                <p style={{ margin: 0 }}>Generated: {new Date(selectedIssue.generatedAt).toLocaleString()}</p>
                <p style={{ margin: 0 }}>Sent: {selectedIssue.sentAt ? new Date(selectedIssue.sentAt).toLocaleString() : "Not sent yet"}</p>
                <button type="button" style={{ ...buttonBase, width: "fit-content" }}>
                  View Full Newsletter
                </button>
              </div>
            </AdminSection>
          </div>
        )}

        {activeTab === "content" && (
          <AdminSection title="Content Pipeline">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 16 }}>
              <div style={metricStyle}>Approved Sources<br /><strong>18</strong></div>
              <div style={metricStyle}>Draft Blog Posts<br /><strong>4</strong></div>
              <div style={metricStyle}>Published Posts<br /><strong>3</strong></div>
              <div style={metricStyle}>Sample Newsletters<br /><strong>5 planned</strong></div>
            </div>
          </AdminSection>
        )}

        {activeTab === "growth" && (
          <div style={{ display: "grid", gap: 16 }}>
            <MarketingAgentPanel />
            <AdminSection title="SEO and Marketing Plan">
              <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                {growthPlan.map((item, index) => (
                  <div key={item} style={readinessStyle}>
                    <span style={{ color: DESIGN_TOKENS.colors.accentHighlight, fontWeight: 900 }}>Step {index + 1}</span>
                    <strong>{item}</strong>
                  </div>
                ))}
              </div>
            </AdminSection>
            </div>
        )}
      </section>
      <PoweredByNetfroot />
    </main>
  );
}

export function UnsubscribeConfirmationPage(): React.JSX.Element {
  const [preferences, persist] = usePreferences();

  React.useEffect(() => {
    if (preferences.newsletterEnabled) {
      persist({ ...preferences, newsletterEnabled: false });
    }
  }, [persist, preferences]);

  return (
    <main style={shellStyle}>
      <section data-testid="unsubscribe-confirmation" style={panelStyle}>
        <h1 style={{ font: DESIGN_TOKENS.typography.h1, marginTop: 0 }}>You have been unsubscribed</h1>
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
          Delivery is paused immediately. Your saved topics and region are still available from your dashboard.
        </p>
        <a href="/dashboard/newsletter" style={ctaLinkStyle}>
          Manage Newsletter
        </a>
      </section>
      <PoweredByNetfroot />
    </main>
  );
}

const ctaLinkStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 16px",
  borderRadius: 999,
  background: `linear-gradient(120deg, ${DESIGN_TOKENS.colors.brandPrimary}, ${DESIGN_TOKENS.colors.brandSecondary})`,
  color: "#07111F",
  textDecoration: "none",
  fontWeight: 800
};

const secondaryLinkStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 16px",
  borderRadius: 999,
  border: "1px solid rgba(34,211,238,0.34)",
  color: DESIGN_TOKENS.colors.textPrimary,
  background: "rgba(7,9,18,0.74)",
  textDecoration: "none",
  fontWeight: 800
};

const metricStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 12,
  border: "1px solid rgba(34,211,238,0.22)",
  background: "rgba(7,9,18,0.72)"
};

const eyebrowTextStyle: React.CSSProperties = {
  margin: 0,
  color: DESIGN_TOKENS.colors.accentHighlight,
  fontWeight: 900
};

const emptyStateStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 14,
  border: "1px solid rgba(244,114,182,0.24)",
  background: "rgba(7,9,18,0.58)"
};

const readerControlStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
  padding: 18,
  borderRadius: 14,
  border: "1px solid rgba(34,211,238,0.22)",
  background: "rgba(7,9,18,0.58)"
};

const fieldsetBoxStyle: React.CSSProperties = {
  border: "1px solid rgba(34,211,238,0.24)",
  borderRadius: 12,
  padding: 12
};

function radioCardStyle(selected: boolean): React.CSSProperties {
  return {
    display: "grid",
    gap: 4,
    padding: 12,
    borderRadius: 12,
    cursor: "pointer",
    border: `1px solid ${selected ? "rgba(34,211,238,0.88)" : "rgba(167,179,200,0.22)"}`,
    background: selected ? "rgba(34,211,238,0.14)" : "rgba(17,24,39,0.68)"
  };
}

const paperStyle: React.CSSProperties = {
  padding: 20,
  borderRadius: 14,
  border: "1px solid rgba(34,211,238,0.3)",
  background: "rgba(248,250,252,0.96)",
  color: "#0F172A",
  boxShadow: "0 24px 60px rgba(0,0,0,0.24)"
};

const storyCardStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
  padding: 16,
  borderRadius: 12,
  border: "1px solid rgba(15,23,42,0.14)",
  background: "#FFFFFF"
};

const adminSectionStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 14,
  border: "1px solid rgba(34,211,238,0.22)",
  background: "rgba(7,9,18,0.58)"
};

const readinessStyle: React.CSSProperties = {
  display: "grid",
  gap: 4,
  minHeight: 74,
  padding: 14,
  borderRadius: 12,
  border: "1px solid rgba(167,179,200,0.18)",
  background: "rgba(17,24,39,0.72)"
};

const issueButtonStyle: React.CSSProperties = {
  display: "grid",
  gap: 4,
  width: "100%",
  padding: 14,
  borderRadius: 12,
  border: "1px solid rgba(34,211,238,0.18)",
  background: "rgba(17,24,39,0.76)",
  color: DESIGN_TOKENS.colors.textPrimary,
  textAlign: "left",
  cursor: "pointer"
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  color: DESIGN_TOKENS.colors.textPrimary
};

const adminStyles = `
  table th,
  table td {
    padding: 10px 12px;
    border-bottom: 1px solid rgba(167, 179, 200, 0.16);
    text-align: left;
    vertical-align: top;
  }

  table th {
    color: ${DESIGN_TOKENS.colors.brandPrimary};
    font-size: 13px;
    letter-spacing: 0;
  }
`;

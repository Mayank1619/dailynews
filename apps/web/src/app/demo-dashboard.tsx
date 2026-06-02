import React from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { DESIGN_TOKENS } from "../features/design-system/tokens";
import { getFirebaseAuthErrorMessage, getFirebaseClientAuth } from "../lib/firebaseAuthClient";

type PreferenceState = {
  topics: string[];
  country: string;
  province: string;
  deliveryTime: string;
  timezone: string;
  newsletterEnabled: boolean;
};

const STORAGE_KEY = "daily-paper-demo-preferences";
const TOPICS = ["Technology", "Business", "Science", "Culture", "Sports", "World"];
const TIMEZONES = ["America/Toronto", "America/New_York", "America/Los_Angeles", "UTC"];

const defaultPreferences: PreferenceState = {
  topics: ["Technology", "Business"],
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

function useAuthState(): AuthState {
  const [state, setState] = React.useState<AuthState>({ user: null, loading: true, error: "" });

  React.useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(getFirebaseClientAuth(), (user) => {
        setState({ user, loading: false, error: "" });
      });

      return unsubscribe;
    } catch (error) {
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
    </main>
  );
}

async function logoutAndReturnHome(): Promise<void> {
  await signOut(getFirebaseClientAuth());
  window.location.assign("/");
}

function AppNav({ user }: { user?: User | null }): React.JSX.Element {
  return (
    <header style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
      <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a href="/" style={navLinkStyle}>
          Home
        </a>
        <a href="/settings" style={navLinkStyle}>
          Settings
        </a>
        <a href="/dashboard/preferences" style={navLinkStyle}>
          Preferences
        </a>
        <a href="/dashboard/newsletter" style={navLinkStyle}>
          Newsletter
        </a>
        <a href="/blog" style={navLinkStyle}>
          Blog
        </a>
      </nav>
      {user ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ color: DESIGN_TOKENS.colors.textSecondary }}>{user.email ?? "Signed in"}</span>
          <button type="button" style={smallButtonStyle} onClick={() => void logoutAndReturnHome()}>
            Sign Out
          </button>
        </div>
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
        <h1 style={{ font: DESIGN_TOKENS.typography.h1, marginTop: 0 }}>Personalize Your Daily News</h1>

        {step === 0 && (
          <section>
            <h2>What topics interest you?</h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", maxWidth: 680 }}>
              {TOPICS.map((topic) => (
                <TopicButton
                  key={topic}
                  topic={topic}
                  selected={draft.topics.includes(topic)}
                  onToggle={() => toggleTopic(topic)}
                />
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
            <h2>When should we deliver?</h2>
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
        <h1 style={{ font: DESIGN_TOKENS.typography.h1, marginTop: 0 }}>Update Your Preferences</h1>
        <div style={{ display: "grid", gap: 18 }}>
          <fieldset style={{ border: "1px solid rgba(34,211,238,0.24)", borderRadius: 12 }}>
            <legend>Topics</legend>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: 8 }}>
              {TOPICS.map((topic) => (
                <TopicButton
                  key={topic}
                  topic={topic}
                  selected={draft.topics.includes(topic)}
                  onToggle={() => toggleTopic(topic)}
                />
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
          <p>Topics: {preferences.topics.join(", ")}</p>
          <p>Region: {preferences.country}, {preferences.province}</p>
          <p>Delivery Time: {preferences.deliveryTime} ({preferences.timezone})</p>
          <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
            Your preferences are always saved, even when delivery is paused.
          </p>
        </section>
      </section>
    </main>
  );
}

export function SettingsPage(): React.JSX.Element {
  const auth = useAuthState();
  const [preferences] = usePreferences(auth.user?.uid);

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
            <strong>{preferences.topics.length}</strong>
          </div>
          <div style={metricStyle}>
            Delivery<br />
            <strong>{preferences.deliveryTime}</strong>
          </div>
        </section>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a data-testid="email-preferences" href="/dashboard/preferences" style={ctaLinkStyle}>
            Email Preferences
          </a>
          <a data-testid="subscription-settings" href="/dashboard/newsletter" style={ctaLinkStyle}>
            Subscription Settings
          </a>
          <a href="/onboarding" style={secondaryLinkStyle}>
            Restart Onboarding
          </a>
        </div>
      </section>
    </main>
  );
}

export function AdminPage(): React.JSX.Element {
  const [showBreakdown, setShowBreakdown] = React.useState(false);

  return (
    <main style={shellStyle}>
      <section style={panelStyle}>
        <AppNav />
        <h1 style={{ font: DESIGN_TOKENS.typography.h1, marginTop: 0 }}>Admin Operations</h1>
        <button data-testid="health-dashboard" type="button" style={buttonBase}>
          Health Dashboard
        </button>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginTop: 20 }}>
          <div data-testid="success-rate" style={metricStyle}>Success Rate<br /><strong>98.4%</strong></div>
          <div data-testid="failure-rate" style={metricStyle}>Failure Rate<br /><strong>1.6%</strong></div>
          <div data-testid="total-sent" style={metricStyle}>Total Sent<br /><strong>12,480</strong></div>
        </section>
        <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
          <button data-testid="refresh-metrics" type="button" style={buttonBase}>
            Refresh Metrics
          </button>
          <button data-testid="view-breakdown" type="button" onClick={() => setShowBreakdown(true)} style={buttonBase}>
            View Breakdown
          </button>
        </div>
        {showBreakdown && (
          <section style={{ marginTop: 20, display: "grid", gap: 16 }}>
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
                <tr><td>provider_timeout</td><td>5</td></tr>
                <tr><td>retry_exhausted</td><td>2</td></tr>
              </tbody>
            </table>
          </section>
        )}
      </section>
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

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  color: DESIGN_TOKENS.colors.textPrimary
};

import React from "react";
import ReactDOM from "react-dom/client";
import BlogPage from "./app/blog/page";
import {
  AdminPage,
  BillingPage,
  NewsletterPage,
  OnboardingPage,
  PreferencesPage,
  ProfilePage,
  SettingsPage,
  UnsubscribeConfirmationPage
} from "./app/demo-dashboard";
import LoginPage from "./app/login/page";
import Page from "./app/page";
import SamplesPage from "./app/samples/page";
import SignupPage from "./app/signup/page";

function RouteView(): JSX.Element {
  const path = window.location.pathname;

  if (path === "/signup") {
    return <SignupPage />;
  }

  if (path === "/login") {
    return <LoginPage />;
  }

  if (path === "/blog") {
    return <BlogPage />;
  }

  if (path.startsWith("/blog/")) {
    const slug = decodeURIComponent(path.replace("/blog/", ""));
    return <BlogPage slug={slug} />;
  }

  if (path === "/samples") {
    return <SamplesPage />;
  }

  if (path.startsWith("/samples/")) {
    const slug = decodeURIComponent(path.replace("/samples/", ""));
    return <SamplesPage slug={slug} />;
  }

  if (path === "/onboarding") {
    return <OnboardingPage />;
  }

  if (path === "/settings") {
    return <SettingsPage />;
  }

  if (path === "/dashboard/preferences") {
    return <PreferencesPage />;
  }

  if (path === "/dashboard/newsletter") {
    return <NewsletterPage />;
  }

  if (path === "/billing") {
    return <BillingPage />;
  }

  if (path === "/profile") {
    return <ProfilePage />;
  }

  if (path === "/admin") {
    return <AdminPage />;
  }

  if (path === "/api/email/unsubscribe") {
    return <UnsubscribeConfirmationPage />;
  }

  return <Page />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouteView />
  </React.StrictMode>
);

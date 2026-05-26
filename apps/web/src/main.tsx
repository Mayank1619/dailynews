import React from "react";
import ReactDOM from "react-dom/client";
import BlogPage from "./app/blog/page";
import LoginPage from "./app/login/page";
import Page from "./app/page";
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

  return <Page />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouteView />
  </React.StrictMode>
);

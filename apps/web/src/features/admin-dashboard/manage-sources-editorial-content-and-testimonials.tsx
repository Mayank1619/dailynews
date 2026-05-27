import React, { useState } from "react";
import { DESIGN_TOKENS } from "../design-system/tokens";

export const MANAGE_SOURCES_COPY = {
  sourcesHeading: "Sources",
  blogHeading: "Blog Posts",
  testimonialsHeading: "Testimonials",
  addSourceLabel: "Add Source",
  enableLabel: "Enable",
  disableLabel: "Disable",
  publishLabel: "Publish",
  unpublishLabel: "Unpublish",
  approveLabel: "Approve",
  removeLabel: "Remove",
  invalidUrlMessage: "Source URL must start with http:// or https://"
} as const;

export type SourceRow = {
  id: string;
  name: string;
  type: string;
  url: string;
  enabled: boolean;
};

export type PostRow = {
  id: string;
  title: string;
  status: "draft" | "published" | "unpublished";
};

export type TestimonialRow = {
  id: string;
  authorName: string;
  content: string;
  status: "pending" | "approved" | "removed";
};

const containerStyle: React.CSSProperties = { padding: 24 };
const sectionStyle: React.CSSProperties = { marginBottom: 40 };
const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  background: DESIGN_TOKENS.colors.bgSecondary,
  borderRadius: 8
};
const thStyle: React.CSSProperties = {
  background: DESIGN_TOKENS.colors.brandPrimary,
  color: "#fff",
  padding: "10px 14px",
  textAlign: "left",
  fontSize: 13
};
const tdStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderBottom: `1px solid ${DESIGN_TOKENS.colors.bgPrimary}`,
  fontSize: 13
};
const btnStyle = (color: string): React.CSSProperties => ({
  border: 0,
  borderRadius: 6,
  padding: "6px 12px",
  marginRight: 4,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  background: color,
  color: "#fff"
});

export function ManageSourcesEditorialContentAndTestimonials({
  sources,
  posts,
  testimonials,
  onToggleSource,
  onPostStatusChange,
  onModerateTestimonial
}: {
  sources: SourceRow[];
  posts: PostRow[];
  testimonials: TestimonialRow[];
  onToggleSource: (id: string, enabled: boolean) => void;
  onPostStatusChange: (id: string, status: PostRow["status"]) => void;
  onModerateTestimonial: (id: string, action: "approve" | "remove") => void;
}): React.JSX.Element {
  return (
    <div style={containerStyle}>
      {/* Sources */}
      <section style={sectionStyle}>
        <h2 style={{ color: DESIGN_TOKENS.colors.textPrimary, marginBottom: 12 }}>
          {MANAGE_SOURCES_COPY.sourcesHeading}
        </h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>URL</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((src) => (
              <tr key={src.id}>
                <td style={tdStyle}>{src.name}</td>
                <td style={tdStyle}>{src.type}</td>
                <td style={tdStyle}><span style={{ wordBreak: "break-all" }}>{src.url}</span></td>
                <td style={{ ...tdStyle, color: src.enabled ? DESIGN_TOKENS.colors.success : DESIGN_TOKENS.colors.textSecondary, fontWeight: 600 }}>
                  {src.enabled ? "Enabled" : "Disabled"}
                </td>
                <td style={tdStyle}>
                  {src.enabled ? (
                    <button
                      style={btnStyle(DESIGN_TOKENS.colors.error)}
                      onClick={() => onToggleSource(src.id, false)}
                      aria-label={`Disable source ${src.name}`}
                    >
                      {MANAGE_SOURCES_COPY.disableLabel}
                    </button>
                  ) : (
                    <button
                      style={btnStyle(DESIGN_TOKENS.colors.success)}
                      onClick={() => onToggleSource(src.id, true)}
                      aria-label={`Enable source ${src.name}`}
                    >
                      {MANAGE_SOURCES_COPY.enableLabel}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Blog Posts */}
      <section style={sectionStyle}>
        <h2 style={{ color: DESIGN_TOKENS.colors.textPrimary, marginBottom: 12 }}>
          {MANAGE_SOURCES_COPY.blogHeading}
        </h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td style={tdStyle}>{post.title}</td>
                <td style={{ ...tdStyle, fontWeight: 600, color: post.status === "published" ? DESIGN_TOKENS.colors.success : DESIGN_TOKENS.colors.textSecondary }}>
                  {post.status}
                </td>
                <td style={tdStyle}>
                  {post.status !== "published" ? (
                    <button
                      style={btnStyle(DESIGN_TOKENS.colors.success)}
                      onClick={() => onPostStatusChange(post.id, "published")}
                      aria-label={`Publish post ${post.title}`}
                    >
                      {MANAGE_SOURCES_COPY.publishLabel}
                    </button>
                  ) : (
                    <button
                      style={btnStyle(DESIGN_TOKENS.colors.warning)}
                      onClick={() => onPostStatusChange(post.id, "unpublished")}
                      aria-label={`Unpublish post ${post.title}`}
                    >
                      {MANAGE_SOURCES_COPY.unpublishLabel}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Testimonials */}
      <section>
        <h2 style={{ color: DESIGN_TOKENS.colors.textPrimary, marginBottom: 12 }}>
          {MANAGE_SOURCES_COPY.testimonialsHeading}
        </h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Author</th>
              <th style={thStyle}>Content</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((t) => (
              <tr key={t.id}>
                <td style={tdStyle}>{t.authorName}</td>
                <td style={tdStyle}>{t.content}</td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{t.status}</td>
                <td style={tdStyle}>
                  {t.status !== "approved" && (
                    <button
                      style={btnStyle(DESIGN_TOKENS.colors.success)}
                      onClick={() => onModerateTestimonial(t.id, "approve")}
                      aria-label={`Approve testimonial by ${t.authorName}`}
                    >
                      {MANAGE_SOURCES_COPY.approveLabel}
                    </button>
                  )}
                  {t.status !== "removed" && (
                    <button
                      style={btnStyle(DESIGN_TOKENS.colors.error)}
                      onClick={() => onModerateTestimonial(t.id, "remove")}
                      aria-label={`Remove testimonial by ${t.authorName}`}
                    >
                      {MANAGE_SOURCES_COPY.removeLabel}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

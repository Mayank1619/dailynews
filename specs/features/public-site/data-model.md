# Data Model - Public Site

## Entities
- LandingContentBlock: id, sectionType, heading, body, order, visible
- SampleDigestCard: id, title, snippet, sourceName, canonicalUrl, publishedAt, label
- PublicNavAction: id, label, route, position

## Relationships
- LandingContentBlock ordered for above-the-fold rendering.

## Validation
- Sample content must be explicitly labeled as illustrative.
- Primary CTA route is /signup and login route is /login.

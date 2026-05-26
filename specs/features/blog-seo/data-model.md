# Data Model - Blog SEO

## Entities
- BlogPost: id, slug, title, excerpt, body, tags[], category, status, publishedAt, updatedAt, canonicalUrl
- BlogIndexEntry: postId, slug, publishedAt, category, tags[]
- SeoMetadata: route, title, description, canonicalUrl, ogImage, robots

## Relationships
- BlogIndexEntry.postId -> BlogPost.id
- SeoMetadata.route -> blog route path

## Validation
- Slug uniqueness required for published posts.
- Only published posts appear in public index/sitemap.

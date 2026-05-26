# Data Model - Design System

## Entities
- DesignToken: name, category, value, semanticUsage
- ComponentPattern: name, states[], accessibilityRules[], figmaMapping
- LayoutRule: breakpoint, gridSpec, spacingScale
- DesignException: id, rationale, reviewer, approvedAt, expiry?

## Relationships
- ComponentPattern references DesignToken set.
- DesignException references impacted ComponentPattern or LayoutRule.

## Validation
- Token names must remain stable and semantically grouped.
- Documented patterns must include keyboard and focus accessibility rules.

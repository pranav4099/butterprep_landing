---
name: Admin shell layout
description: Admin shell with full-width header (logo, breadcrumbs, year chip, avatar, logout) and refined sidebar.
type: design
---
The admin shell uses a full-width 64px header containing: ButterPrep horizontal logo (left, clickable to /dashboard), a vertical separator, and global breadcrumbs (HeaderBreadcrumbs.tsx) on the left side. The right side shows an academic year chip, the user's name with "Administrator" subtitle, a gradient avatar (ring-2 ring-primary/15), and a logout icon button.

The sidebar uses sectioned navigation with uppercase tracked labels, a left-aligned 2px primary indicator bar on active items, muted icon hover transitions, and a "BUTTERPREP · v1.0" footer mark when expanded. Active items use bg-sidebar-accent + text-sidebar-primary.

Breadcrumbs (HeaderBreadcrumbs.tsx) auto-generate from URL segments using a LABELS map for friendly names; unknown segments are de-slugged and title-cased. Home icon links to /dashboard.

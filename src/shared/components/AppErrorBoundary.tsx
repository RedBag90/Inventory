'use client';
// Feature-level error boundary — wrap each dashboard feature with this.
// Reports errors to Sentry. Renders a retry UI on failure.
// Never use a single root-level boundary — use one per feature.

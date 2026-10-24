# ADR-003: Use Next.js App Router and TypeScript

- **Status:** Accepted for MVP
- **Date:** 2026-10-24

## Context

The product needs public pages, a small server-side content adapter, an audio URL handler, client-side local state, and a later server-side endpoint for Gus AI. It is intended to deploy to Vercel with no separate application server in the initial phase.

## Decision

Use Next.js App Router with TypeScript and React. Use Tailwind CSS as a styling foundation, while keeping `DESIGN.md` and semantic CSS tokens as the visual source of truth. Use `next-themes` for theme persistence and Lucide React for icons. shadcn/ui may be added selectively; do not use its default styling as the complete design.

## Consequences

Positive:
- Server-rendered pages and client components can coexist in one project.
- Route Handlers provide a path for limited backend capabilities.
- Vercel supports Next.js deployment directly.

Negative:
- Requires Node.js and npm/pnpm for local development.
- Dependencies and build compatibility must be verified locally.
- The team must understand Server Components versus Client Components.

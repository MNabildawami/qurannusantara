# ADR-002: Use localStorage for MVP Reading Preferences and Bookmarks

- **Status:** Accepted for MVP
- **Date:** 2026-10-24

## Context

The portfolio MVP should not require login, a database, or paid backend storage. It still benefits from saving theme, translation preference, bookmarks, and last-read location within the same browser.

## Decision

Use browser localStorage for non-sensitive reading preferences, bookmarks, and last-read state. Prefix keys with `qn-` and include a schema version suffix when data shape may evolve.

## Consequences

Positive:
- No database or account setup.
- Works for a simple personal portfolio demonstration.
- Easy to inspect and test in browser devtools.

Negative:
- Data is specific to that browser/profile/device.
- Clearing browser storage deletes the state.
- State can be malformed and must be parsed defensively.
- This is not a secure vault and must not hold secrets or sensitive personal information.

## Future reconsideration

Revisit only if the product adds authenticated accounts or cross-device synchronization.

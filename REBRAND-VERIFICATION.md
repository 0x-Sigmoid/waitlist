# Rebrand verification — 5 October 2026

The page keeps the existing nav, email capture, three-scenario demo, and footer. Styling, branding assets, metadata, and demo copy changed. The stack, routes, `/api/waitlist`, database schema, submission payload, privacy text, and WebMCP signup contract were preserved.

## Accessibility and responsive layout

Lighthouse 13.5.0 accessibility audits against the local preview scored **100/100** at 360, 768, and 1280 CSS pixels. A separate 1280px dark-theme audit also scored **100/100**. No failing binary accessibility audits remained. Raw local audit reports are in the ignored `.sites-runtime/` directory.

Browser review measured actual viewport widths of 360, 768, and 1280px. Document widths stayed within the viewport at all three sizes, and every node remained within its bounds. Body text is 16px; captions are 14px. The hero is 40px on the narrow layout and 88px on desktop. Mobile presents the connected components as selectable cards; tablet and desktop show the graph.

Keyboard focus has a visible 2px outline. The page has a skip link, labeled navigation and graph group, semantic landmarks, labeled email input, live signup status, named node controls, and Radix tabs/dialog. State shapes and text accompany every color. Reduced-motion CSS disables edge animation and smooth scrolling. An inline head script resolves the theme before paint, and both themes share the same geometry.

## Interaction and data checks

- Clicked all 15 components across the three scenarios: each displayed its own state, title, file reference, evidence description, and next step.
- Billing is selected initially in the authentication scenario and shows the Firebase-to-Clerk / Stripe customer mapping conflict.
- Switched between light and dark and verified the manual preference survived a reload.
- Opened and closed the waitlist privacy dialog.
- Submitted a synthetic email to the **local** waitlist: success message displayed, HTTP 200, and one stored row with `consent_version=waitlist-v1` and `source=website`.
- Repeated that same synthetic local signup: the existing deduplication preserved one row. Exercised the existing rate limit and verified the displayed retry error. No production signup was submitted.
- TypeScript completed without errors.

## Assets and limits

SVG mark, outlined wordmark, lockup, dark and monochrome variants are under `public/brand/`. The favicon set includes SVG, 16/32/48px PNG, multi-size ICO, and a 180px touch icon. The generated OG image is exactly 1200×630 and has matching Open Graph and X metadata.

The demo and its file references remain illustrative. This rebrand does not add repository access or perform real pull-request verification. Lighthouse is an automated audit, not a substitute for a manual assistive-technology assessment.

# NodeDots waitlist

Public early-access landing page. The connection explorer contains illustrative product concepts; it does not analyze repositories.

## Signup behavior

The form saves normalized unique email addresses, timestamp, consent notice version, and source to the private D1 `waitlist` table. No public endpoint lists signups. Duplicate submissions receive the same success message and do not create another row. Inputs require explicit consent, same-site Origin, JSON, a 2 KB body limit, and a valid email shape. A honeypot and database-backed five-attempt/ten-minute request limit reduce automated abuse. Rate identifiers are SHA-256 hashes of IP and time window and expire after 20 minutes; cleanup occurs on signup requests. No raw IP or email is logged.

Owner-only Sites database tools can inspect/export the waitlist; do not expose those records publicly. Rate limiting is an initial abuse control, not email-ownership verification. Before large-scale campaigns add consent-confirming email if needed and stronger anti-bot controls.

## Email operations

No confirmation, invitation, or campaign email is sent by this implementation. Before contacting signups, configure a verified sending domain, include a working unsubscribe link in every update, maintain suppression records, and finalize operator/contact details and any jurisdiction-specific privacy requirements. Review/delete waitlist data when the early-access campaign ends. Honor removal requests without publishing subscriber data.

## Local development

Run the locked dependency installer, generate schema migrations using `npm run db:generate`, and build with the Sites build helper. Apply each generated migration to the local DB with the bundled Wrangler command documented in the Sites starter. Start the development script for UI work; the built Worker preview supports local D1 verification.

Generated migrations are schema-only. Production migrations apply through Sites publishing. Keep credentials in runtime secret storage or workflow stdin, never source.

## Domain

Intended domain: `nodedots.com`, DNS managed by Cloudflare. Use the exact apex A and ownership/TLS validation records returned by Sites. Preserve existing mail records. Domain is live only after ownership validation, routing, and TLS report active. See `DOMAIN-SETUP.md` once populated with verified records.
